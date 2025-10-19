import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dailyWordsData } from '../../data/words';
import type { Word } from '../../types';
import Button from '../Button';
import { useAuth } from '../../contexts/AuthContext';

// 🔊 دالة النطق باستخدام Google Translate TTS
async function speakTextWithGoogle(text: string, audioContext: AudioContext) {
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodedText}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Google TTS request failed");

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.error("Google TTS Error:", error);
    alert("حدث خطأ أثناء تشغيل الصوت. حاول مرة أخرى.");
  }
}

// 🎧 أيقونة السماعة
const SpeakerIcon = ({ onClick, isLoading }: { onClick: () => void, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="h-6 w-6 flex items-center justify-center">
        <svg className="animate-spin h-5 w-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
      disabled={isLoading}
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
  loadingAudio: string | null;
}> = React.memo(({ word, speak, loadingAudio }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800" lang="en">{word.word}</h3>
            <p className="text-lg text-sky-600 font-semibold">{word.translation}</p>
          </div>
          <SpeakerIcon onClick={() => speak(word.word)} isLoading={loadingAudio === word.word} />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-200">
        <ul className="space-y-3 text-slate-600" lang="en">
          {word.examples.map((example, index) => (
            <li key={index} className="flex items-center gap-3">
              <span className="text-sky-500 text-lg">•</span>
              <span className="flex-1">{example}</span>
              <SpeakerIcon onClick={() => speak(example)} isLoading={loadingAudio === example} />
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
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

  const speak = useCallback(async (text: string) => {
    if (loadingAudio) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    setLoadingAudio(text);
    try {
      await speakTextWithGoogle(text, audioContextRef.current);
    } finally {
      setLoadingAudio(null);
    }
  }, [loadingAudio]);

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
            <WordCard key={word.word} word={word} speak={speak} loadingAudio={loadingAudio} />
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
