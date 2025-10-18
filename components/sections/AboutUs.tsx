
import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-center lg:text-right">
            <h2 className="text-base text-sky-600 font-semibold tracking-wide uppercase">من نحن</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">O'n Academy</p>
            <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0">
              نساعدك على تعلم اللغة الإنجليزية بطريقة ممتعة وتفاعلية. مهمتنا هي جعل التعليم متاحًا وجذابًا للجميع، من خلال أدوات مبتكرة ومحتوى عالي الجودة يركز على الاستخدام العملي للغة.
            </p>
          </div>
          <div className="lg:w-1/2">
            <img 
              className="rounded-3xl shadow-2xl" 
              src="https://picsum.photos/seed/about/600/400" 
              alt="Team working" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
