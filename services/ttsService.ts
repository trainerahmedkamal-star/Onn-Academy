
/**
 * A service class to handle Text-to-Speech (TTS) using the browser's native Web Speech API
 * AND pre-recorded audio files playback.
 */

export type EnglishAccent = 'US' | 'UK';

class BrowserSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoiceName: string | null = null;
  // Default values: Rate 0.9 (slightly slow for learning), Pitch 1 (normal)
  private rate: number = 0.9; 
  private pitch: number = 1;
  private accent: EnglishAccent = 'US'; // Default to American English
  
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

    const savedAccent = localStorage.getItem('voiceAccent');
    if (savedAccent && (savedAccent === 'US' || savedAccent === 'UK')) {
        this.accent = savedAccent as EnglishAccent;
    }

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

  public setAccent(accent: EnglishAccent) {
      this.accent = accent;
      localStorage.setItem('voiceAccent', accent);
      // Reset preferred voice if specific manual override wasn't set to ensure new accent takes effect automatically
      if (!localStorage.getItem('preferredVoice')) {
          this.selectedVoiceName = null; 
      }
  }

  public getAccent(): EnglishAccent {
      return this.accent;
  }

  private getEffectiveVoice(): SpeechSynthesisVoice | null {
    // 1. Try to use the user's selected voice
    if (this.selectedVoiceName) {
        const selected = this.voices.find(v => v.name === this.selectedVoiceName);
        if (selected) return selected;
    }

    // 2. Filter by Accent (Region)
    const targetRegion = this.accent === 'US' ? 'en-US' : 'en-GB';
    const regionVoices = this.voices.filter(v => v.lang === targetRegion);

    // 3. Priority List for Auto-Selection within Region
    
    // A. "Google" voices for that region
    const googleVoice = regionVoices.find(v => v.name.includes('Google'));
    if (googleVoice) return googleVoice;

    // B. "Natural" / "Premium" voices
    const premiumVoice = regionVoices.find(v => v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Enhanced'));
    if (premiumVoice) return premiumVoice;

    // C. Any voice from that region
    if (regionVoices.length > 0) return regionVoices[0];

    // 4. Fallback: Any English voice (if preferred region not found)
    const anyEnglish = this.voices.find(v => v.lang.startsWith('en'));
    if (anyEnglish) return anyEnglish;

    // 5. Fallback to default
    return null;
  }

  public isConfigured(): boolean {
    return true; // Web Speech API works without API keys
  }

  /**
   * Plays a pre-recorded audio file.
   */
  public playAudio(url: string, onStart?: () => void, onEnd?: () => void, rateOverride?: number) {
      this.stop(); // Stop any current TTS or Audio

      // Fix protocol-relative URLs (sometimes API returns //ssl.gstatic...)
      const validUrl = url.startsWith('//') ? `https:${url}` : url;

      const audio = new Audio(validUrl);
      this.currentAudio = audio;
      
      // Apply rate to audio files (HTML5 Audio supports this)
      audio.playbackRate = rateOverride !== undefined ? rateOverride : this.rate;
      
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
      },
      rateOverride?: number
  ) {
      this.stop();

      const cleanText = text.trim().toLowerCase().replace(/[^a-z0-9\s']/g, '');
      const wordCount = cleanText.split(/\s+/).length;
      const isShortPhrase = wordCount <= 4;

      // If it's a long sentence, go straight to TTS
      if (!isShortPhrase) {
          console.log(`TTS (Long sentence): "${text}"`);
          this.speak(text, callbacks?.onStart, callbacks?.onEnd, rateOverride);
          return;
      }

      // Generate a cache key that includes the accent preference
      const cacheKey = `${cleanText}_${this.accent}`;

      // Check cache first
      if (this.audioCache.has(cacheKey)) {
          console.log(`Smart Audio (Cache): "${cleanText}" (${this.accent})`);
          this.playAudio(this.audioCache.get(cacheKey)!, callbacks?.onStart, callbacks?.onEnd, rateOverride);
          return;
      }

      // Fetch from Free Dictionary API
      if (callbacks?.onLoading) callbacks.onLoading(true);
      
      let audioUrl: string | null = null;
      try {
          const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanText)}`);
          if (response.ok) {
              const data = await response.json();
              
              if (Array.isArray(data) && data.length > 0) {
                  // Iterate through entries to find the best matching audio for the accent
                  for (const entry of data) {
                      const phonetics = entry.phonetics || [];
                      
                      // Filter for audio that exists
                      const validPhonetics = phonetics.filter((p: any) => p.audio && p.audio.length > 0);
                      
                      // Try to find exact accent match first
                      // US usually has '-us.mp3', UK usually has '-uk.mp3'
                      const targetTag = this.accent === 'US' ? '-us.mp3' : '-uk.mp3';
                      const preferredAudio = validPhonetics.find((p: any) => p.audio.includes(targetTag));

                      if (preferredAudio) {
                          audioUrl = preferredAudio.audio;
                          break; // Found perfect match
                      } else if (validPhonetics.length > 0 && !audioUrl) {
                          // Fallback to first available if we haven't found anything yet
                          audioUrl = validPhonetics[0].audio;
                      }
                  }
              }
          }
      } catch (err) {
          // Silent fail
      }

      if (callbacks?.onLoading) callbacks.onLoading(false);

      if (audioUrl) {
          console.log(`Smart Audio (Found): "${cleanText}"`);
          this.audioCache.set(cacheKey, audioUrl);
          this.playAudio(audioUrl, callbacks?.onStart, callbacks?.onEnd, rateOverride);
      } else {
          // Fallback to Robot TTS if no real audio found
          console.log(`TTS (Fallback): "${text}"`);
          this.speak(text, callbacks?.onStart, callbacks?.onEnd, rateOverride);
      }
  }

  /**
   * Speaks text using the browser's TTS engine.
   */
  public speak(text: string, onStart?: () => void, onEnd?: () => void, rateOverride?: number) {
    // Cancel any ongoing speech or audio before starting new one
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance; // Keep reference to prevent garbage collection
    
    const voice = this.getEffectiveVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    // Configure speech characteristics
    utterance.lang = this.accent === 'US' ? 'en-US' : 'en-GB';
    
    // Use override if provided, otherwise use saved preference
    utterance.rate = rateOverride !== undefined ? rateOverride : this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = 1;

    if (onStart) utterance.onstart = onStart;
    
    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
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
