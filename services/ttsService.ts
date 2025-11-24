/**
 * A service class to handle Text-to-Speech (TTS) using the browser's native Web Speech API.
 * This is free, unlimited, and works offline.
 */

class BrowserSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoiceName: string | null = null;
  private onVoicesChangedCallbacks: ((voices: SpeechSynthesisVoice[]) => void)[] = [];

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Load saved preference
    this.selectedVoiceName = localStorage.getItem('preferredVoice');

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

  private getEffectiveVoice(): SpeechSynthesisVoice | null {
    // 1. Try to use the user's selected voice
    if (this.selectedVoiceName) {
        const selected = this.voices.find(v => v.name === this.selectedVoiceName);
        if (selected) return selected;
    }

    // 2. Try to find a specific high-quality Google US English voice
    const googleUS = this.voices.find(v => v.name === 'Google US English');
    if (googleUS) return googleUS;

    // 3. Try to find any US English voice
    const enUS = this.voices.find(v => v.lang === 'en-US');
    if (enUS) return enUS;

    // 4. Fallback to any English voice
    const en = this.voices.find(v => v.lang.startsWith('en'));
    if (en) return en;

    // 5. Fallback to default
    return null;
  }

  public isConfigured(): boolean {
    return true; // Web Speech API works without API keys
  }

  public speak(text: string, onStart?: () => void, onEnd?: () => void) {
    if (this.synthesis.speaking) {
       this.stop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voice = this.getEffectiveVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    // Configure speech characteristics
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1;
    utterance.volume = 1;

    if (onStart) utterance.onstart = onStart;
    
    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.error("TTS Error:", event);
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  public stop() {
    if (this.synthesis.speaking || this.synthesis.pending) {
        this.synthesis.cancel();
    }
  }

  public isSpeaking(): boolean {
    return this.synthesis.speaking;
  }
}

// Export a singleton instance so the entire app shares one speech manager.
export const speechService = new BrowserSpeechService();