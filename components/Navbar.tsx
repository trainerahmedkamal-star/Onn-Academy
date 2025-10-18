import React, { useState } from 'react';
import type { Section } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onNavigate: (section: Section) => void;
  activeSection: Section;
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

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeSection }) => {
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
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map(item => (
                <NavLink key={item.section} section={item.section} activeSection={activeSection} onClick={handleNavClick}>
                  {item.label}
                </NavLink>
              ))}
               {user ? (
                <div className="flex items-center gap-4">
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