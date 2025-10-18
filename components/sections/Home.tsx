
import React from 'react';
import Button from '../Button';

interface HomeProps {
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-white">
      <div className="text-center p-8">
        <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-4 animate-fade-in-down">
          مرحباً بك في <span className="text-sky-500">O'n English Practice</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto animate-fade-in-up">
          طريقك الممتع والتفاعلي لتعلم أهم 1000 كلمة في اللغة الإنجليزية واستخدامها في حياتك اليومية.
        </p>
        <Button onClick={onStart} className="animate-bounce">
          ابدأ الآن
        </Button>
      </div>
    </div>
  );
};

export default Home;
