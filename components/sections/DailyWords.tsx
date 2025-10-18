import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dailyWordsData } from '../../data/words';
import type { Word } from '../../types';
import Button from '../Button';
import { useAuth } from '../../contexts/AuthContext';

// Speaker Icon Component updated for a "speaking" state
const SpeakerIcon = ({ onClick, isSpeaking }: { onClick: () => void, isSpeaking: boolean }) => {
  if (isSpeaking) {
    return (
      <div className="h-6 w-6 flex items-center justify-center">
        {/* Using a simple pulse animation to indicate speaking */}
        <svg className="animate-pulse h-6 w-6 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3.5c-4.69 0-8.5 3.81-8.5 8.5s3.81 8.5 8.5 8.5 8.5-3.81 8.5-8.5-3.81-8.5-8.5-8.5zM12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"></path><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
        </svg>
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className="text-sky-500 hover:text-sky-700 transition-colors focus:outline-none"
      aria-label="Listen to pronunciation"
      title="Listen"
      disabled={isSpeaking}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    </button>
  );
};

const WordCard: React.FC<{
  word: Word;
  speak: (text: string) => void;
  speakingText: string | null;
}> = React.memo(({ word, speak, speakingText }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800" lang="en">{word.word}</h3>
            <p className="text-lg text-sky-600 font-semibold">{word.translation}</p>
          </div>
          <SpeakerIcon onClick={() => speak(word.word)} isSpeaking={speakingText === word.word} />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-200">
        <ul className="space-y-3 text-slate-600" lang="en">
          {word.examples.map((example, index) => (
            <li key={index} className="flex items-center gap-3">
               <span className="text-sky-500 text-lg">•</span>
               <span className="flex-1">{example}</span>
               <SpeakerIcon onClick={() => speak(example)} isSpeaking={speakingText === example} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const DailyWords: React.FC = () => {
  const { user } = useAuth();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  
  const storageKey = user ? `completedDays_${user.email}` : 'completedDays_guest';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setCompletedDays(saved ? new Set(JSON.parse(saved)) : new Set());
    } catch (error) {
      console.error("Failed to parse completed days from localStorage", error);
      setCompletedDays(new Set());
    }
  }, [storageKey]);


  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(completedDays)));
    } catch (error) {
      console.error("Failed to save completed days to localStorage", error);
    }
  }, [completedDays, storageKey]);
  
  useEffect(() => {
    const loadAndSetVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;

        let bestVoice: SpeechSynthesisVoice | undefined;
        
        // Find a high-quality voice, preferring specific ones known for quality.
        const preferredVoices = ['Google US English', 'Microsoft Zira - English (United States)', 'Alex'];
        for (const name of preferredVoices) {
            bestVoice = voices.find(voice => voice.name === name && voice.lang.startsWith('en'));
            if (bestVoice) break;
        }

        // Fallback to the default US English voice or any US English voice.
        if (!bestVoice) bestVoice = voices.find(voice => voice.lang === 'en-US' && voice.default);
        if (!bestVoice) bestVoice = voices.find(voice => voice.lang === 'en-US');
        if (!bestVoice) bestVoice = voices.find(voice => voice.lang.startsWith('en'));

        selectedVoiceRef.current = bestVoice || null;
    };

    window.speechSynthesis.onvoiceschanged = loadAndSetVoice;
    loadAndSetVoice();

    return () => {
        window.speechSynthesis.onvoiceschanged = null;
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (speakingText === text || !text) return;
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        if (selectedVoiceRef.current) {
            utterance.voice = selectedVoiceRef.current;
        }
        
        utterance.lang = 'en-US';
        utterance.rate = 0.95; // Slightly slower for clarity
        utterance.pitch = 1.0;

        utterance.onstart = () => setSpeakingText(text);
        utterance.onend = () => setSpeakingText(null);
        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            setSpeakingText(null);
        };
        
        window.speechSynthesis.speak(utterance);
    }, 50);

  }, [speakingText]);

  const currentSet = dailyWordsData[currentDayIndex];
  const totalDays = dailyWordsData.length;
  const progressPercentage = totalDays > 0 ? (completedDays.size / totalDays) * 100 : 0;
  const isCurrentDayCompleted = completedDays.has(currentSet.day);

  const handleMarkAsComplete = () => {
    setCompletedDays(prev => new Set(prev).add(currentSet.day));
  };

  const goToNextDay = () => {
    setCurrentDayIndex((prev) => (prev + 1) % totalDays);
  };

  const goToPrevDay = () => {
    setCurrentDayIndex((prev) => (prev - 1 + totalDays) % totalDays);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800">الكلمات اليومية</h2>
        <p className="mt-4 text-xl text-slate-600">
          تعلم 5 كلمات جديدة كل يوم لبناء مفرداتك.
        </p>
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-2">
           <h3 className="font-bold text-slate-700">تقدمك</h3>
           <span className="text-sky-600 font-semibold">{completedDays.size} / {totalDays} أيام مكتملة</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-sky-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-slate-100 p-8 rounded-2xl shadow-inner">
        <h3 className="text-2xl font-bold text-center text-slate-700 mb-6">
          اليوم {currentSet.day}
        </h3>
        <div className="space-y-6">
          {currentSet.words.map((word) => (
            <WordCard key={word.word} word={word} speak={speak} speakingText={speakingText} />
          ))}
        </div>
        
        <div className="mt-8 text-center">
            <Button onClick={handleMarkAsComplete} disabled={isCurrentDayCompleted}>
                {isCurrentDayCompleted ? 'مكتمل ✓' : 'وضع علامة كمكتمل'}
            </Button>
        </div>
      </div>

      <div className="mt-10 flex justify-center items-center gap-4">
        <Button onClick={goToPrevDay} variant="secondary">
          اليوم السابق
        </Button>
        <span className="text-slate-500 font-semibold">
          اليوم {currentDayIndex + 1} / {totalDays}
        </span>
        <Button onClick={goToNextDay}>
          اليوم التالي
        </Button>
      </div>
    </div>
  );
};

export default DailyWords;