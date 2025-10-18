import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dailyWordsData } from '../../data/words';
import type { Word } from '../../types';
import Button from '../Button';
import { useAuth } from '../../contexts/AuthContext';

const SpeakerIcon = ({ onClick, isSpeaking }: { onClick: () => void, isSpeaking: boolean }) => {
  if (isSpeaking) {
    return (
      <div className="h-6 w-6 flex items-center justify-center cursor-pointer" onClick={onClick}>
         <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
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
  
  // Voice selection state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  
  const storageKey = user ? `completedDays_${user.email}` : 'completedDays_guest';
  const voiceStorageKey = 'preferredVoiceURI';

  // Load progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setCompletedDays(saved ? new Set(JSON.parse(saved)) : new Set());
    } catch (error) {
      console.error("Failed to parse completed days from localStorage", error);
    }
  }, [storageKey]);

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(completedDays)));
    } catch (error) {
      console.error("Failed to save completed days to localStorage", error);
    }
  }, [completedDays, storageKey]);
  
  // Load voices and saved voice preference
  useEffect(() => {
    const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
            .filter(voice => voice.lang.startsWith('en'));
        setVoices(availableVoices);

        if (availableVoices.length > 0) {
            const savedVoiceURI = localStorage.getItem(voiceStorageKey);
            if (savedVoiceURI && availableVoices.some(v => v.voiceURI === savedVoiceURI)) {
                setSelectedVoiceURI(savedVoiceURI);
            } else {
                // Auto-select best available voice
                let bestVoice = 
                    availableVoices.find(v => v.name === 'Google US English' && v.localService) ||
                    availableVoices.find(v => v.localService && v.lang === 'en-US') ||
                    availableVoices.find(v => v.name === 'Google US English') ||
                    availableVoices.find(v => v.name === 'Microsoft Zira - English (United States)') ||
                    availableVoices.find(v => v.default && v.lang === 'en-US') ||
                    availableVoices[0];
                setSelectedVoiceURI(bestVoice.voiceURI);
            }
        }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Initial call

    return () => {
        window.speechSynthesis.onvoiceschanged = null;
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    };
  }, []);
  
  const handleVoiceChange = (voiceURI: string) => {
    setSelectedVoiceURI(voiceURI);
    localStorage.setItem(voiceStorageKey, voiceURI);
    setShowVoiceSettings(false);
  }

  const speak = useCallback((text: string) => {
    if (!text) return;
    
    // If the same text is speaking, cancel it. Otherwise, cancel previous and speak new.
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speakingText === text) {
        setSpeakingText(null);
        return;
      }
    }
    
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onstart = () => setSpeakingText(text);
        utterance.onend = () => setSpeakingText(null);
        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e.error);
            setSpeakingText(null);
        };
        
        window.speechSynthesis.speak(utterance);
    }, 50);

  }, [speakingText, selectedVoiceURI, voices]);

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
        <div className="flex justify-center items-center gap-3">
            <h2 className="text-4xl font-extrabold text-slate-800">الكلمات اليومية</h2>
            <div className="relative">
                <button 
                    onClick={() => setShowVoiceSettings(s => !s)} 
                    className="text-slate-500 hover:text-sky-600 transition-colors"
                    title="إعدادات الصوت"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.96.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                </button>
                {showVoiceSettings && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-10 border border-slate-200">
                        <div className="p-4">
                            <h4 className="font-bold text-slate-700 text-right">اختر صوت النطق</h4>
                            <p className="text-sm text-slate-500 mb-3 text-right">قد تختلف جودة الأصوات حسب جهازك.</p>
                            <select
                                value={selectedVoiceURI || ''}
                                onChange={(e) => handleVoiceChange(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md"
                            >
                                {voices.map(voice => (
                                    <option key={voice.voiceURI} value={voice.voiceURI}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
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
