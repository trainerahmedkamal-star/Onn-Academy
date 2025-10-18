import React from 'react';
import Button from '../Button';

const plans = [
    {
        name: 'الخطة الشهرية',
        price: '9.99',
        currency: 'USD',
        period: '/ شهر',
        features: [
            'وصول كامل للكلمات اليومية',
            'ممارسة محادثة غير محدودة',
            'مكتبة فيديوهات حصرية',
            'دعم عبر البريد الإلكتروني',
        ],
        primary: false,
    },
    {
        name: 'الخطة السنوية',
        price: '99.99',
        currency: 'USD',
        period: '/ سنة',
        features: [
            'كل مميزات الخطة الشهرية',
            'خصم 20% على السعر السنوي',
            'وصول مبكر للميزات الجديدة',
            'دعم ذو أولوية',
        ],
        primary: true,
    },
];


const SubscriptionCard: React.FC<{ plan: typeof plans[0] }> = ({ plan }) => {
    const handleSubscribe = () => {
        alert(`شكراً لاشتراكك في ${plan.name}! (هذه محاكاة لعملية الدفع)`);
    }

    return (
        <div className={`border rounded-2xl p-8 flex flex-col ${plan.primary ? 'border-sky-500 border-2' : 'border-slate-300'}`}>
            <h3 className="text-2xl font-bold text-slate-800">{plan.name}</h3>
            <div className="mt-4">
                <span className="text-5xl font-extrabold text-slate-900">${plan.price}</span>
                <span className="text-lg font-medium text-slate-500">{plan.period}</span>
            </div>
            <p className="mt-4 text-slate-600">
                مثالية للطلاب الملتزمين بتحقيق الطلاقة.
            </p>
            <ul className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-auto pt-8">
                 <Button onClick={handleSubscribe} variant={plan.primary ? 'primary' : 'secondary'} className="w-full">
                    اشترك الآن
                </Button>
            </div>
        </div>
    );
};


const Subscription: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-slate-800">خطط الاشتراك</h2>
        <p className="mt-4 text-xl text-slate-600">اختر الخطة التي تناسبك واطلق العنان لإمكانياتك الكاملة.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {plans.map(plan => (
            <SubscriptionCard key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  );
};

export default Subscription;
