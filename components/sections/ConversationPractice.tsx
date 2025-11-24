
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '../../types';
import Button from '../Button';
import { getGeminiResponse } from '../../services/geminiService';
import { dailyWordsData } from '../../data/words';
import { speechService } from '../../services/ttsService';

const SpeakerIcon = ({ onClick, isSpeaking, isLoading }: { onClick: () => void, isSpeaking: boolean, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="h-6 w-6 flex items-center justify-center" title="جاري البحث عن صوت بشري...">
           <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (isSpeaking) {
    return (
      <div className="h-6 w-6 flex items-center justify-center cursor-pointer text-sky-500" onClick={onClick} title="إيقاف">
         <svg className="h-5 w-5 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
        </svg>
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className={'text-slate-400 hover:text-sky-500 transition-colors focus:outline-none'}
      aria-label="الاستماع للنطق"
      title={'استمع'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    </button>
  );
};


const ConversationPractice: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! Let's practice with the words you learned. How are you today?", sender: 'bot' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const learnedWords = dailyWordsData.flatMap(daySet => daySet.words.map(word => word.word.toLowerCase()));

  const speak = useCallback((text: string) => {
    // Stop if clicking the same text while it's speaking
    if (speechService.isSpeaking() && speakingText === text) {
      speechService.stop();
      return;
    }
    
    speechService.speakSmart(
      text,
      {
        onLoading: (isLoading) => setLoadingText(isLoading ? text : null),
        onStart: () => setSpeakingText(text),
        onEnd: () => {
            setSpeakingText(null);
            setLoadingText(null);
        }
      }
    );
  }, [speakingText]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-speak the first message
  useEffect(() => {
    if (speechService.isConfigured()) {
        // Small delay to ensure interaction is possible
        const timer = setTimeout(() => speak(messages[0].text), 500);
        return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);
  

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '' || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    const botResponseText = await getGeminiResponse(newMessages, learnedWords);

    const botMessage: Message = {
      id: Date.now() + 1,
      text: botResponseText,
      sender: 'bot',
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
    speak(botResponseText); // Auto-play the bot's response
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-slate-800">ممارسة المحادثة</h2>
        <p className="mt-4 text-xl text-slate-600">تحدث مع المدرس الافتراضي وتدرب على الكلمات التي تعلمتها.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl h-[60vh] flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end mb-4 gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.sender === 'bot' && (
                <SpeakerIcon 
                  onClick={() => speak(msg.text)} 
                  isSpeaking={speakingText === msg.text} 
                  isLoading={loadingText === msg.text}
                />
              )}

              <div
                className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-sky-500 text-white rounded-br-none'
                    : 'bg-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                <p lang="en">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start mb-4">
               <div className="bg-slate-200 text-slate-800 p-3 rounded-2xl rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-300"></span>
                </div>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center bg-slate-50 rounded-b-2xl">
          <input
            type="text"
            lang="en"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <Button type="submit" className="mr-3" disabled={isTyping}>
            إرسال
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConversationPractice;
