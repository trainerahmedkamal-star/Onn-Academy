
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dailyWordsData } from '../../data/words';
import type { Word } from '../../types';
import Button from '../Button';
import { useAuth } from '../../contexts/AuthContext';
import { speechService } from '../../services/ttsService';
import { assessPronunciation } from '../../services/pronunciationService';


const SpeakerIcon = ({ onClick, isSpeaking, isLoading }: { onClick: () => void, isSpeaking: boolean, isLoading: boolean }) => {
  if (isLoading) {
      return (
        <div className="h-6 w-6 flex items-center justify-center">
             <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" title="جاري تحميل الصوت البشري..."></div>
        </div>
      );
  }
  
  if (isSpeaking) {
    return (
      <button className="h-6 w-6 flex items-center justify-center cursor-pointer" onClick={onClick} title="إيقاف">
         <svg className="h-6 w-6 text-red-500 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
        </svg>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={'text-sky-500 hover:text-sky-700 transition-colors focus:outline-none'}
      aria-label="الاستماع للنطق"
      title={'استمع (نطق بشري حقيقي)'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    </button>
  );
};

const MicIcon = ({ onClick, isRecording }: { onClick: () => void, isRecording: boolean }) => {
  return (
    <button
      onClick={onClick}
      className={`transition-colors focus:outline-none ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-sky-600'}`}
      aria-label={isRecording ? 'إيقاف التسجيل' : 'تدرب على النطق'}
      title={isRecording ? 'إيقاف التسجيل' : 'تدرب على النطق'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        {isRecording 
          ? <path d="M12 14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2s-2 .9-2 2v6c0 1.1.9 2 2 2zm-2-6c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V8zm10-1h-1V5h-2v2h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v2h2V9h1c.55 0 1-.45 1-1s-.45-1-1-1zM4 11.17V13c0 2.79 2.21 5.03 5 5.82V21h2v-2.18c2.79-.79 5-3.03 5-5.82v-1.83l-2 2V13c0 2.21-1.79 4-4 4s-4-1.79-4-4v-.83l-2-2z"/> 
          : <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
        }
      </svg>
    </button>
  );
};

interface PronunciationFeedback {
    status: 'idle' | 'assessing' | 'success' | 'average' | 'failure';
    message: string;
}

interface WordCardProps {
  word: Word;
  speak: (text: string, audioUrl?: string) => void;
  speakingText: string | null;
  loadingWord: string | null;
  practice: () => void;
  isRecording: boolean;
  feedback: PronunciationFeedback;
}

const WordCard: React.FC<WordCardProps> = React.memo(({ word, speak, speakingText, loadingWord, practice, isRecording, feedback }) => {
  
  const getFeedbackStyles = () => {
    switch(feedback.status) {
        case 'success': return 'bg-green-100 text-green-800';
        case 'average': return 'bg-yellow-100 text-yellow-800';
        case 'failure': return 'bg-red-100 text-red-800';
        case 'assessing': return 'bg-sky-100 text-sky-800';
        default: return 'bg-transparent h-0 py-0 opacity-0';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800" lang="en">{word.word}</h3>
            <p className="text-lg text-sky-600 font-semibold">{word.translation}</p>
          </div>
          <SpeakerIcon 
             onClick={() => speak(word.word, word.audioUrl)} 
             isSpeaking={speakingText === word.word}
             isLoading={loadingWord === word.word}
          />
          <MicIcon onClick={practice} isRecording={isRecording} />
        </div>
      </div>
      {feedback.status !== 'idle' && (
          <div className={`mt-2 p-2 rounded-lg text-center text-sm font-semibold transition-all duration-300 ${getFeedbackStyles()}`}>
              {feedback.message}
          </div>
      )}
      <div className="pt-4 border-t border-slate-200">
        <ul className="space-y-3 text-slate-600" lang="en">
          {word.examples.map((example, index) => (
            <li key={index} className="flex items-center gap-3">
               <span className="text-sky-500 text-lg">•</span>
               <span className="flex-1">{example}</span>
               {/* Examples are sentences, so they will likely use TTS, but speakSmart handles this logic */}
               <SpeakerIcon 
                  onClick={() => speak(example)} 
                  isSpeaking={speakingText === example} 
                  isLoading={loadingWord === example}
               />
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
  const [loadingWord, setLoadingWord] = useState<string | null>(null);
  const [recordingForWord, setRecordingForWord] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, PronunciationFeedback>>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const storageKey = user ? `completedDays_${user.email}` : 'completedDays_guest';
  
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
  
  // Cleanup audio/mic on component unmount
  useEffect(() => {
    return () => {
      speechService.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const speak = useCallback((text: string, audioUrl?: string) => {
    // If the clicked text is already speaking, stop it.
    if (speechService.isSpeaking() && speakingText === text) {
      speechService.stop();
      return;
    }
    
    // If explicitly provided audioUrl (from local data), use it directly
    if (audioUrl) {
         speechService.playAudio(audioUrl, () => setSpeakingText(text), () => setSpeakingText(null));
         return;
    }

    // Use Smart Speak (Fetches Real Audio -> Falls back to TTS)
    speechService.speakSmart(text, {
        onLoading: (isLoading) => setLoadingWord(isLoading ? text : null),
        onStart: () => setSpeakingText(text),
        onEnd: () => {
            setSpeakingText(null);
            setLoadingWord(null);
        }
    });

  }, [speakingText]);

  const togglePractice = async (word: Word) => {
    // If we are recording this word, stop it.
    if (recordingForWord === word.word) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setRecordingForWord(null);
        return;
    }
    
    // If recording another word, do nothing.
    if (recordingForWord !== null) return;
    
    // Start new recording
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        setFeedbacks(prev => ({ ...prev, [word.word]: { status: 'idle', message: '' }}));

        recorder.ondataavailable = event => {
            audioChunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
            stream.getTracks().forEach(track => track.stop()); // Clean up mic access
            
            setFeedbacks(prev => ({...prev, [word.word]: { status: 'assessing', message: 'جارٍ التقييم...' }}));

            const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
            
            const assessment = await assessPronunciation(audioBlob, word.word);

            let status: PronunciationFeedback['status'];
            if (assessment.score > 0.85) status = 'success';
            else if (assessment.score > 0.6) status = 'average';
            else status = 'failure';

            setFeedbacks(prev => ({...prev, [word.word]: { status: status, message: assessment.message }}));
            setTimeout(() => setFeedbacks(prev => ({...prev, [word.word]: { status: 'idle', message: '' }})), 5000);
            setRecordingForWord(null);
        };

        recorder.start();
        setRecordingForWord(word.word);
    } catch (err) {
        console.error("Microphone access denied or error:", err);
        setFeedbacks(prev => ({...prev, [word.word]: { status: 'failure', message: 'لم نتمكن من الوصول للميكروفون.' }}));
    }
  };

  const currentSet = dailyWordsData[currentDayIndex];
  const totalDays = dailyWordsData.length;
  const progressPercentage = totalDays > 0 ? (completedDays.size / totalDays) * 100 : 0;
  const isCurrentDayCompleted = completedDays.has(currentSet.day);

  const handleMarkAsComplete = () => {
    setCompletedDays(prev => new Set(prev).add(currentSet.day));
  };

  const goToNextDay = () => setCurrentDayIndex((prev) => (prev + 1) % totalDays);
  const goToPrevDay = () => setCurrentDayIndex((prev) => (prev - 1 + totalDays) % totalDays);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800">الكلمات اليومية</h2>
        <p className="mt-4 text-xl text-slate-600">
           تعلم 5 كلمات جديدة كل يوم، وتدرب على نطقها واحصل على تقييم فوري.
        </p>
      </div>
      
       {!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && (
        <div className="mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-bold">تنبيه:</p>
          <p>ميزة التدرب على النطق غير مدعومة في متصفحك الحالي لأنه لا يدعم الوصول للميكروفون.</p>
        </div>
      )}

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
        <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            اليوم {currentSet.day}
        </h3>
        
        <div className="space-y-6">
          {currentSet.words.map(word => (
            <WordCard 
              key={word.word} 
              word={word} 
              speak={speak} 
              speakingText={speakingText}
              loadingWord={loadingWord}
              practice={() => togglePractice(word)}
              isRecording={recordingForWord === word.word}
              feedback={feedbacks[word.word] || { status: 'idle', message: '' }}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          {!isCurrentDayCompleted ? (
            <Button onClick={handleMarkAsComplete}>
              وضع علامة كمكتمل
            </Button>
          ) : (
            <p className="text-green-600 font-semibold">✓ مكتمل</p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={goToPrevDay} variant="secondary">
           اليوم السابق &rarr;
        </Button>
        <Button onClick={goToNextDay} variant="secondary">
          &larr; اليوم التالي
        </Button>
      </div>
    </div>
  );
};

export default DailyWords;
