import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../../types';
import Button from '../Button';
import { getGeminiResponse } from '../../services/geminiService';

const ConversationPractice: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hello! I am your virtual tutor. Ask me anything to practice your English.', sender: 'bot' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    const botResponseText = await getGeminiResponse(newMessages);

    const botMessage: Message = {
      id: Date.now() + 1,
      text: botResponseText,
      sender: 'bot',
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-slate-800">ممارسة المحادثة</h2>
        <p className="mt-4 text-xl text-slate-600">تحدث مع المدرس الافتراضي لتحسين مهاراتك.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl h-[60vh] flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
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