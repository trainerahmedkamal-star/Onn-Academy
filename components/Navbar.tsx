import React, { useState } from 'react';
import type { Section } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onNavigate: (section: Section) => void;
  activeSection: Section;
  onOpenSettings: () => void;
}

const NavLink: React.FC<{
  section: Section;
  activeSection: Section;
  onClick: (section: Section) => void;
  children: React.ReactNode;
}> = ({ section, activeSection, onClick, children }) => {
  const isActive = section === activeSection;
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick(section);
      }}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-sky-500 text-white'
          : 'text-slate-700 hover:bg-sky-100'
      }`}
    >
      {children}
    </a>
  );
};

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeSection, onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems: { section: Section; label: string }[] = [
    { section: 'home', label: 'الرئيسية' },
    { section: 'daily-words', label: 'الكلمات اليومية' },
    { section: 'conversation', label: 'ممارسة المحادثة' },
    { section: 'videos', label: 'فيديوهات تعليمية' },
    { section: 'subscription', label: 'الاشتراك' },
  ];

  const handleNavClick = (section: Section) => {
    onNavigate(section);
    setIsOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    onNavigate('home');
    setIsOpen(false);
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="#" onClick={(e) => {e.preventDefault(); handleNavClick('home')}} className="text-2xl font-bold text-sky-600">
              O'n English
            </a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map(item => (
                <NavLink key={item.section} section={item.section} activeSection={activeSection} onClick={handleNavClick}>
                  {item.label}
                </NavLink>
              ))}
              
              {/* Settings Button */}
              <button 
                onClick={onOpenSettings}
                className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
                title="إعدادات الصوت"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

               {user ? (
                <div className="flex items-center gap-4 border-r border-slate-200 pr-4 mr-2">
                  <span className="text-sm font-medium text-slate-600">{user.email}</span>
                  <button onClick={handleLogout} className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-slate-200 text-slate-800 hover:bg-slate-300">
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <NavLink section="login" activeSection={activeSection} onClick={handleNavClick}>
                  تسجيل الدخول
                </NavLink>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-sky-100 inline-flex items-center justify-center p-2 rounded-md text-sky-600 hover:text-white hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-100 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <a
                key={item.section}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.section);
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  activeSection === item.section
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-700 hover:bg-sky-100'
                }`}
              >
                {item.label}
              </a>
            ))}
             
             {/* Mobile Settings Link */}
             <a 
                href="#" 
                onClick={(e) => {e.preventDefault(); onOpenSettings(); setIsOpen(false);}}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-sky-100 flex items-center gap-2"
             >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                إعدادات الصوت
             </a>

             {user ? (
                <div className="border-t border-slate-200 mt-3 pt-3 px-2 space-y-2">
                    <span className="block text-base font-medium text-slate-500">{user.email}</span>
                    <a href="#" onClick={(e)=>{e.preventDefault(); handleLogout()}} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-sky-100">تسجيل الخروج</a>
                </div>
              ) : (
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleNavClick('login'); }}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                    activeSection === 'login'
                        ? 'bg-sky-500 text-white'
                        : 'text-slate-700 hover:bg-sky-100'
                    }`}
                >
                    تسجيل الدخول
                </a>
              )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;