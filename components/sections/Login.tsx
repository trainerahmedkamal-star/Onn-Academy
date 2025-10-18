import React, { useState } from 'react';
import Button from '../Button';
import { useAuth } from '../../contexts/AuthContext';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('الرجاء إدخال بريد إلكتروني صالح.');
      return;
    }
    if (password.length < 6) {
      setError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
      return;
    }

    // Simulate successful login/signup
    login(email);
    onLoginSuccess();
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800">
          {isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </h2>
        <p className="mt-4 text-xl text-slate-600">
          لمتابعة تقدمك في تعلم اللغة الإنجليزية.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-2xl">
        {!isLoginView && (
             <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">الاسم</label>
                <div className="mt-1">
                    <input
                    type="text"
                    name="name"
                    id="name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
                    placeholder="اسمك الكامل"
                    />
                </div>
            </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">كلمة المرور</label>
          <div className="mt-1">
            <input
              type="password"
              name="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="text-center">
          <Button type="submit" className="w-full">
            {isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </Button>
        </div>

        <div className="text-center">
            <button type="button" onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-sky-600 hover:underline">
                {isLoginView ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
