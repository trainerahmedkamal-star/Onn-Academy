import React from 'react';

interface KemetTheIbisProps {
  className?: string;
}

const KemetTheIbis: React.FC<KemetTheIbisProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-labelledby="kemet-title"
      role="img"
    >
      <title id="kemet-title">Kemet the Ibis Mascot</title>
      <defs>
        <linearGradient id="kemet-collar-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#ca8a04' }} />
          <stop offset="50%" style={{ stopColor: '#facc15' }} />
          <stop offset="100%" style={{ stopColor: '#ca8a04' }} />
        </linearGradient>
      </defs>

      {/* Body */}
      <path d="M 100,180 C 70,160 50,120 60,80 C 70,40 130,40 140,80 C 150,120 130,160 100,180 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />

      {/* Head */}
      <path d="M 115,45 C 100,20 70,20 55,45 C 45,60 50,80 65,85 L 105,85 C 120,80 125,60 115,45 Z" fill="#1e293b" />
      <circle cx="85" cy="65" r="10" fill="white" />
      <circle cx="82" cy="67" r="5" fill="#1e293b" />
      
      {/* Beak */}
      <path d="M 55,50 C 10,60 10,90 50,80" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />

      {/* Collar */}
      <path d="M 65,95 Q 100,115 135,95 A 50 50 0 0 0 65,95" fill="url(#kemet-collar-gradient)" stroke="#ca8a04" strokeWidth="1" />
      <path d="M 72,100 Q 100,110 128,100 A 40 40 0 0 0 72,100" fill="none" stroke="#0ea5e9" strokeWidth="3" />


      {/* Left Wing (Waving) */}
      <path d="M 60,100 C 20,110 25,160 63,140 Q 60,120 60,100 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" transform="rotate(10, 60, 130)" />

      {/* Right Wing with Reed Pen */}
      <g>
        <path d="M 140,100 C 180,110 175,160 137,140 Q 140,120 140,100 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        {/* Reed Pen */}
        <line x1="145" y1="110" x2="180" y2="90" stroke="#854d0e" strokeWidth="4" strokeLinecap="round" />
        <polygon points="180,90 177,93 175,88" fill="#1e293b" />
      </g>
      
      {/* Feet */}
      <g fill="#f97316">
          <path d="M 80,175 l -5,10 l 5,0 l -5,10" stroke="#c2410c" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 120,175 l -5,10 l 5,0 l -5,10" stroke="#c2410c" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

    </svg>
  );
};

export default KemetTheIbis;
