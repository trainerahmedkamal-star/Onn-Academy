
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = 'px-8 py-3 font-bold rounded-full transition-transform transform hover:scale-105 shadow-lg';
  const variantClasses = variant === 'primary' 
    ? 'bg-sky-500 text-white hover:bg-sky-600' 
    : 'bg-slate-200 text-slate-800 hover:bg-slate-300';
  
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
