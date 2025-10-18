
import React, { useState } from 'react';
import Button from '../Button';

const ContactUs: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle form submission here.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-24 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-slate-800">شكراً لك!</h2>
        <p className="mt-4 text-lg text-slate-600">تم استلام رسالتك بنجاح. سنتواصل معك قريباً.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-slate-800">تواصل معنا</h2>
        <p className="mt-4 text-xl text-slate-600">لديك سؤال أو اقتراح؟ نود أن نسمع منك.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-2xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">الاسم</label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700">الرسالة</label>
          <div className="mt-1">
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
            ></textarea>
          </div>
        </div>
        <div className="text-center">
          <Button type="submit">
            إرسال الرسالة
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactUs;
