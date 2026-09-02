'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Phone, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type Step = 'form' | 'otp';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  function handlePhoneChange(val: string) {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('998')) digits = digits.slice(3);
    digits = digits.slice(0, 9);
    setPhone('+998' + digits);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error('Введите полное имя (минимум 2 символа)');
      return;
    }
    if (phone.length < 13) {
      toast.error('Введите полный номер телефона (+998 XX XXX XX XX)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name: name.trim() }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        toast.error(data.error ?? 'Ошибка при регистрации');
        return;
      }
      toast.success(data.message ?? 'Код подтверждения отправлен в консоль сервера');
      setStep('otp');
    } catch {
      toast.error('Сетевая ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Введите 6-значный код');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('phone-otp', { phone, otp, redirect: false });
      if (result?.error) {
        toast.error('Неверный или истёкший код');
        return;
      }
      toast.success('Регистрация завершена!');
      router.replace('/student');
    } catch {
      toast.error('Ошибка входа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-orange-500 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-orange-500/20">F</div>
          <span className="text-white text-2xl font-bold tracking-wide">Friday Education</span>
        </div>
        <p className="text-slate-400 text-sm">Система управления учебным центром</p>
      </div>

      <div className="w-full max-w-sm border border-slate-700 bg-[#1e293b] p-6 sm:p-8 transition-all duration-200 hover:border-slate-600">
        <h1 className="text-white text-xl font-semibold mb-1">
          {step === 'form' ? 'Регистрация' : 'Подтверждение'}
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          {step === 'form' ? 'Создайте аккаунт для доступа к системе' : `Код отправлен на ${phone}`}
        </p>

        {step === 'form' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1.5 font-medium">Полное имя</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full min-h-[44px] bg-[#0f172a] border border-slate-600 text-white pl-11 pr-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                  autoFocus
                  autoComplete="name"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1.5 font-medium">Номер телефона</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+998 XX XXX XX XX"
                  className="w-full min-h-[44px] bg-[#0f172a] border border-slate-600 text-white pl-11 pr-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                  autoComplete="tel"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:opacity-50 text-white font-medium px-4 flex items-center justify-center gap-2 transition-all duration-150 text-sm cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Зарегистрироваться</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1.5 font-medium">Код подтверждения</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-значный код"
                  className="w-full min-h-[44px] bg-[#0f172a] border border-slate-600 text-white pl-11 pr-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors tracking-widest"
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:opacity-50 text-white font-medium px-4 flex items-center justify-center gap-2 transition-all duration-150 text-sm cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Подтвердить</span><ArrowRight className="w-4 h-4" /></>}
            </button>
            <button
              type="button"
              onClick={() => { setStep('form'); setOtp(''); }}
              className="w-full min-h-[44px] text-slate-400 hover:text-slate-300 text-sm transition-colors cursor-pointer"
            >
              ← Назад
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            Уже есть аккаунт?{' '}
            <Link href="/" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">Войти</Link>
          </p>
        </div>
      </div>

      <p className="mt-8 text-slate-600 text-xs">© 2025 Friday Education. Все права защищены.</p>
    </div>
  );
}
