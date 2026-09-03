'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';

const ROLE_REDIRECT: Record<string, string> = {
  DIRECTOR: '/director',
  MANAGER: '/manager',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/student',
};

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handlePhoneChange(val: string) {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('998')) digits = digits.slice(3);
    digits = digits.slice(0, 9);
    setPhone('+998' + digits);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (phone.length < 13) {
      setError('Введите полный номер телефона (+998 XX XXX XX XX)');
      return;
    }
    if (!password) {
      setError('Введите пароль');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('credentials', { phone, password, redirect: false });
      if (result?.error) {
        setError('Неверный номер телефона или пароль.');
        return;
      }
      const sr = await fetch('/api/auth/session');
      const ss = (await sr.json()) as { user?: { role?: string } };
      router.replace(ROLE_REDIRECT[ss?.user?.role ?? ''] ?? '/student');
    } catch (err: any) {
      console.error('Login exception:', err);
      setError('Неверный номер телефона или пароль.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo-star.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-white text-xl font-bold tracking-wide">Friday Education</span>
        </div>
        <p className="text-slate-400 text-sm">Система управления учебным центром</p>
      </div>

      <div className="w-full max-w-sm border border-slate-700 bg-[#1e293b] p-8 rounded-lg shadow-xl">
        <h1 className="text-white text-xl font-semibold mb-1">
          Вход в систему
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Введите номер телефона и пароль для входа
        </p>

        {error && (
          <div className="mb-4 border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-rose-400 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Номер телефона</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+998 XX XXX XX XX"
                className="w-full bg-[#0f172a] border border-slate-600 text-white pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors rounded"
                autoFocus
                autoComplete="tel"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ваш пароль"
                className="w-full bg-[#0f172a] border border-slate-600 text-white pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors rounded"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-medium py-2.5 px-4 flex items-center justify-center gap-2 transition-colors text-sm rounded cursor-pointer mt-2"
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
        </form>
      </div>

      <p className="mt-8 text-slate-600 text-xs">© 2025 Friday Education. Все права защищены.</p>
    </div>
  );
}
