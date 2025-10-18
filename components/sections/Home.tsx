import React from 'react';
import Button from '../Button';
import KemetTheIbis from '../KemetTheIbis';

interface HomeProps {
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <div className="bg-white">
      <div className="container mx-auto min-h-[calc(100vh-64px)] px-6 py-12 flex flex-col lg:flex-row items-center justify-center">
        {/* Text Content Column */}
        <div className="lg:w-1/2 text-center lg:text-right mb-12 lg:mb-0">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 mb-6 leading-tight animate-fade-in-down">
            أتقِن أهم 1000 كلمة وتحدث الإنجليزية <span className="text-sky-500">بثقة.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg mx-auto lg:mx-0 animate-fade-in-up delay-200">
            انضم لآلاف المتعلمين وابدأ رحلتك نحو الطلاقة بخمس كلمات جديدة كل يوم. التعلم أصبح أسهل وأكثر متعة من أي وقت مضى.
          </p>
          <div className="animate-fade-in-up delay-400">
            <Button onClick={onStart} className="animate-pulse">
              ابدأ التعلم مجاناً
            </Button>
          </div>
        </div>

        {/* Mascot Column */}
        <div className="lg:w-1/2 flex justify-center lg:justify-start animate-fade-in-left">
           <KemetTheIbis className="w-64 h-64 md:w-96 md:h-96" />
        </div>
      </div>
    </div>
  );
};

export default Home;