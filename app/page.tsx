'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Step = 'phone' | 'otp';

const ROLE_REDIRECT: Record<string, string> = {
  DIRECTOR: '/director',
  TEACHER: '/teacher',
  PARENT: '/student',
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  function handlePhoneChange(val: string) {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('998')) digits = digits.slice(3);
    digits = digits.slice(0, 9);
    setPhone('+998' + digits);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (phone.length < 13) {
      setError('Введите полный номер телефона (+998 XX XXX XX XX)');
      return;
    }
    setLoading(true);
    try {
      const cr = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const cd = (await cr.json()) as { exists?: boolean };
      if (!cd.exists) {
        setError('Номер не найден. Обратитесь к администратору или зарегистрируйтесь.');
        return;
      }
      const r = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const d = (await r.json()) as { error?: string };
      if (!r.ok) {
        setError(d.error ?? 'Ошибка при отправке кода');
        return;
      }
      setInfo('Код отправлен в консоль сервера. Введите его ниже.');
      setStep('otp');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('phone-otp', { phone, otp, redirect: false });
      if (result?.error) {
        setError('Неверный или истёкший код.');
        return;
      }
      const sr = await fetch('/api/auth/session');
      const ss = (await sr.json()) as { user?: { role?: string } };
      router.replace(ROLE_REDIRECT[ss?.user?.role ?? ''] ?? '/student');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-orange-500 flex items-center justify-center font-bold text-white text-sm">
            F
          </div>
          <span className="text-white text-xl font-bold tracking-wide">Friday Education</span>
        </div>
        <p className="text-slate-400 text-sm">Система управления учебным центром</p>
      </div>

      <div className="w-full max-w-sm border border-slate-700 bg-[#1e293b] p-8">
        <h1 className="text-white text-xl font-semibold mb-1">
          {step === 'phone' ? 'Вход в систему' : 'Подтверждение'}
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          {step === 'phone' ? 'Введите номер телефона для входа' : `Код отправлен на ${phone}`}
        </p>

        {error && (
          <div className="mb-4 border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-rose-400 text-sm">
            {error}
          </div>
        )}
        {info && !error && (
          <div className="mb-4 border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-emerald-400 text-sm">
            {info}
          </div>
        )}

        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
<label className="block text-slate-300 text-sm mb-1">Номер телефона</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2-translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+998 XX XXX XX XX"
                  className="w-full bg-[#0f172a] border border-slate-600 text-white pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                  autoFocus
                  autoComplete="tel"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-medium py-2.5 px-4 flex items-center justify-center gap-2 transition-colors text-sm">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Получить код</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1">Код подтверждения</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-значный код"
                  className="w-full bg-[#0f172a] border border-slate-600 text-white pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors tracking-widest"
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-medium py-2.5 px-4 flex items-center justify-center gap-2 transition-colors text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Войти</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
                setInfo('');
              }}
              className="w-full text-slate-400 hover:text-slate-300 text-sm py-1 transition-colors"
            >
              ← Изменить номер
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            Нет аккаунта?{' '}
            <Link
              href="/register"
              className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-8 text-slate-600 text-xs">© 2025 Friday Education. Все права защищены.</p>
    </div>
  );
}
