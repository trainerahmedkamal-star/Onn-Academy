
export type Section = 'home' | 'daily-words' | 'conversation' | 'videos' | 'about' | 'contact' | 'login' | 'subscription';

export interface Word {
  word: string;
  translation: string;
  examples: string[];
  audioUrl?: string; // Optional URL for pre-recorded high-quality audio
}

export interface DailyWordsSet {
  day: number;
  words: Word[];
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export interface User {
  email: string;
}
