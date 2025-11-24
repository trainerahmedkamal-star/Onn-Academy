
/**
 * A service class to handle Text-to-Speech (TTS) using the browser's native Web Speech API
 * AND pre-recorded audio files playback.
 */

class BrowserSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoiceName: string | null = null;
  // Default values: Rate 0.9 (slightly slow for learning), Pitch 1 (normal)
  private rate: number = 0.9; 
  private pitch: number = 1;
  
  private onVoicesChangedCallbacks: ((voices: SpeechSynthesisVoice[]) => void)[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  
  // Cache for real audio URLs to avoid fetching multiple times
  private audioCache: Map<string, string> = new Map();

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Load saved preferences
    this.selectedVoiceName = localStorage.getItem('preferredVoice');
    
    const savedRate = localStorage.getItem('voiceRate');
    if (savedRate) this.rate = parseFloat(savedRate);

    const savedPitch = localStorage.getItem('voicePitch');
    if (savedPitch) this.pitch = parseFloat(savedPitch);

    // Load voices immediately
    this.loadVoices();
    
    // Some browsers load voices asynchronously
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
    // Notify subscribers
    this.onVoicesChangedCallbacks.forEach(cb => cb(this.voices));
  }

  /**
   * Subscribe to voice list updates (needed because browsers load voices async)
   */
  public subscribeToVoices(callback: (voices: SpeechSynthesisVoice[]) => void) {
    this.onVoicesChangedCallbacks.push(callback);
    // If voices are already loaded, call immediately
    if (this.voices.length > 0) {
        callback(this.voices);
    }
  }

  public getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(v => v.lang.startsWith('en'));
  }

  public setPreferredVoice(voiceName: string) {
    this.selectedVoiceName = voiceName;
    localStorage.setItem('preferredVoice', voiceName);
  }

  public getPreferredVoiceName(): string | null {
      return this.selectedVoiceName;
  }

  public setRate(rate: number) {
      this.rate = rate;
      localStorage.setItem('voiceRate', rate.toString());
  }

  public getRate(): number {
      return this.rate;
  }

  public setPitch(pitch: number) {
      this.pitch = pitch;
      localStorage.setItem('voicePitch', pitch.toString());
  }

  public getPitch(): number {
      return this.pitch;
  }

  private getEffectiveVoice(): SpeechSynthesisVoice | null {
    // 1. Try to use the user's selected voice
    if (this.selectedVoiceName) {
        const selected = this.voices.find(v => v.name === this.selectedVoiceName);
        if (selected) return selected;
    }

    // 2. Priority List for Auto-Selection (Mobile & Desktop)
    
    // A. "Google US English" (Chrome Desktop/Android standard)
    const googleUS = this.voices.find(v => v.name === 'Google US English');
    if (googleUS) return googleUS;

    // B. "Natural" voices (Edge/Android often label high quality voices as Natural)
    const naturalVoice = this.voices.find(v => v.lang === 'en-US' && v.name.includes('Natural'));
    if (naturalVoice) return naturalVoice;

    // C. "Premium" or "Enhanced" voices (iOS/macOS often use these labels)
    const premiumVoice = this.voices.find(v => v.lang === 'en-US' && (v.name.includes('Premium') || v.name.includes('Enhanced')));
    if (premiumVoice) return premiumVoice;

    // 3. Fallback to any US English voice
    const enUS = this.voices.find(v => v.lang === 'en-US');
    if (enUS) return enUS;

    // 4. Fallback to any English voice (UK, AU, etc.)
    const en = this.voices.find(v => v.lang.startsWith('en'));
    if (en) return en;

    // 5. Fallback to default
    return null;
  }

  public isConfigured(): boolean {
    return true; // Web Speech API works without API keys
  }

  /**
   * Plays a pre-recorded audio file.
   */
  public playAudio(url: string, onStart?: () => void, onEnd?: () => void) {
      this.stop(); // Stop any current TTS or Audio

      // Fix protocol-relative URLs (sometimes API returns //ssl.gstatic...)
      const validUrl = url.startsWith('//') ? `https:${url}` : url;

      const audio = new Audio(validUrl);
      this.currentAudio = audio;
      
      // Apply rate to audio files (HTML5 Audio supports this)
      audio.playbackRate = this.rate;
      // Pitch cannot be easily changed for HTML5 Audio without Web Audio API, so we skip pitch for real audio

      audio.onplay = () => {
          if (onStart) onStart();
      };

      audio.onended = () => {
          this.currentAudio = null;
          if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
          console.error("Audio playback error", e);
          this.currentAudio = null;
          if (onEnd) onEnd();
      };

      audio.play().catch(err => {
          console.error("Failed to play audio:", err);
          if (onEnd) onEnd();
      });
  }

  /**
   * Smart Speak: Tries to fetch real human audio first, falls back to TTS.
   */
  public async speakSmart(
      text: string, 
      callbacks?: { 
          onLoading?: (state: boolean) => void;
          onStart?: () => void; 
          onEnd?: () => void; 
      }
  ) {
      this.stop();

      // Clean the text but keep spaces for phrases like "thank you"
      // Allow apostrophes for words like "don't", "it's"
      const cleanText = text.trim().toLowerCase().replace(/[^a-z0-9\s']/g, '');
      
      // Heuristic: Only attempt to fetch audio for short phrases (up to 4 words)
      // Long sentences won't exist in a dictionary.
      const wordCount = cleanText.split(/\s+/).length;
      const isShortPhrase = wordCount <= 4;

      // If it's a long sentence, go straight to TTS
      if (!isShortPhrase) {
          console.log(`TTS (Long sentence): "${text}"`);
          this.speak(text, callbacks?.onStart, callbacks?.onEnd);
          return;
      }

      // Check cache first
      if (this.audioCache.has(cleanText)) {
          console.log(`Smart Audio (Cache): "${cleanText}"`);
          this.playAudio(this.audioCache.get(cleanText)!, callbacks?.onStart, callbacks?.onEnd);
          return;
      }

      // Fetch from Free Dictionary API
      if (callbacks?.onLoading) callbacks.onLoading(true);
      
      let audioUrl: string | null = null;
      try {
          // console.log(`Fetching audio for: "${cleanText}"...`);
          const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanText)}`);
          if (response.ok) {
              const data = await response.json();
              // Find the first valid audio in phonetics
              if (Array.isArray(data) && data.length > 0) {
                  // Sometimes the audio is in the first entry, sometimes in others
                  for (const entry of data) {
                      const phonetics = entry.phonetics || [];
                      const audioEntry = phonetics.find((p: any) => p.audio && p.audio.length > 0);
                      if (audioEntry) {
                          audioUrl = audioEntry.audio;
                          break;
                      }
                  }
              }
          }
      } catch (err) {
          // Silent fail, proceed to TTS
          // console.warn("Error fetching real audio:", err); 
      }

      if (callbacks?.onLoading) callbacks.onLoading(false);

      if (audioUrl) {
          console.log(`Smart Audio (Found): "${cleanText}"`);
          this.audioCache.set(cleanText, audioUrl);
          this.playAudio(audioUrl, callbacks?.onStart, callbacks?.onEnd);
      } else {
          // Fallback to Robot TTS if no real audio found
          console.log(`TTS (Fallback): "${text}"`);
          this.speak(text, callbacks?.onStart, callbacks?.onEnd);
      }
  }

  /**
   * Speaks text using the browser's TTS engine.
   */
  public speak(text: string, onStart?: () => void, onEnd?: () => void) {
    // Cancel any ongoing speech or audio before starting new one
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance; // Keep reference to prevent garbage collection
    
    const voice = this.getEffectiveVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    // Configure speech characteristics based on saved preferences
    utterance.lang = 'en-US';
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = 1;

    if (onStart) utterance.onstart = onStart;
    
    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      // 'canceled' or 'interrupted' errors happen when we call stop() or speak() while already speaking.
      if (event.error === 'canceled' || event.error === 'interrupted') {
          if (onEnd) onEnd(); 
          return;
      }
      
      console.error("TTS Error:", event.error);
      if (onEnd) onEnd();
      this.currentUtterance = null;
    };

    this.synthesis.speak(utterance);
  }

  public stop() {
    // Stop TTS
    if (this.synthesis.speaking || this.synthesis.pending) {
        this.synthesis.cancel();
    }
    this.currentUtterance = null;

    // Stop Audio File
    if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synthesis.speaking || (this.currentAudio !== null && !this.currentAudio.paused);
  }
}

// Export a singleton instance so the entire app shares one speech manager.
export const speechService = new BrowserSpeechService();
