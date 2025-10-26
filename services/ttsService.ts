/**
 * A service class to handle Text-to-Speech (TTS) using the Google Gemini API.
 */
import { GoogleGenAI, Modality } from "@google/genai";

// Base64 decoding function
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Custom function to decode raw PCM audio data into an AudioBuffer, as required by Gemini API.
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize from 16-bit integer to floating point [-1, 1]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


class GeminiSpeechService {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private onEndCallback: (() => void) | null = null;
  private currentSpokenText: string | null = null;
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
    } else {
        console.error("API_KEY environment variable not set. TTS will not work.");
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      // Gemini TTS outputs at 24kHz sample rate
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  public isConfigured(): boolean {
    return !!this.ai;
  }

  public async speak(text: string, onStart: () => void, onEnd: () => void) {
    if (this.isSpeaking()) {
      const wasSameText = this.currentSpokenText === text;
      this.stop();
      if (wasSameText) {
        return; // Just stop if same text is clicked again
      }
    }
    
    if (!this.ai) {
        console.error("Gemini AI not initialized. Cannot speak.");
        onEnd();
        return;
    }

    onStart();
    this.onEndCallback = onEnd;
    this.currentSpokenText = text;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' }, // A neutral, clear voice
              },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error("No audio data received from Gemini API.");
      }
      
      const audioContext = this.getAudioContext();
      const audioBytes = decode(base64Audio);
      // Gemini TTS provides single-channel (mono) audio at 24000 Hz.
      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
      
      this.sourceNode = audioContext.createBufferSource();
      this.sourceNode.buffer = audioBuffer;
      this.sourceNode.connect(audioContext.destination);
      
      this.sourceNode.onended = () => {
        this.cleanUpState();
      };
      
      this.sourceNode.start(0);

    } catch (error) {
      console.error("Error with Gemini TTS service:", error);
      this.cleanUpState();
    }
  }

  private cleanUpState() {
     if (this.onEndCallback) {
        this.onEndCallback();
     }
     this.sourceNode = null;
     this.onEndCallback = null;
     this.currentSpokenText = null;
  }

  public stop() {
    if (this.sourceNode) {
        this.sourceNode.onended = null; // Prevent double-firing of cleanup
        this.sourceNode.stop();
    }
    this.cleanUpState();
  }

  public isSpeaking(): boolean {
    return !!this.sourceNode;
  }
}

// Export a singleton instance so the entire app shares one speech manager.
export const speechService = new GeminiSpeechService();