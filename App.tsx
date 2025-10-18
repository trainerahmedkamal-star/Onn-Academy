import React, { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Home from './components/sections/Home';
import DailyWords from './components/sections/DailyWords';
import ConversationPractice from './components/sections/ConversationPractice';
import LearningVideos from './components/sections/LearningVideos';
import AboutUs from './components/sections/AboutUs';
import ContactUs from './components/sections/ContactUs';
import Login from './components/sections/Login';
import Subscription from './components/sections/Subscription';
import { Section } from './types';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('home');

  const handleNavigate = useCallback((section: Section) => {
    setActiveSection(section);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home onStart={() => handleNavigate('daily-words')} />;
      case 'daily-words':
        return <DailyWords />;
      case 'conversation':
        return <ConversationPractice />;
      case 'videos':
        return <LearningVideos />;
      case 'about':
        return <AboutUs />;
      case 'contact':
        return <ContactUs />;
      case 'login':
        return <Login onLoginSuccess={() => handleNavigate('daily-words')} />;
      case 'subscription':
        return <Subscription />;
      default:
        return <Home onStart={() => handleNavigate('daily-words')} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-gray-800">
      <Navbar onNavigate={handleNavigate} activeSection={activeSection} />
      <main>
        {renderSection()}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} O'n Academy. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};

export default App;