'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from 'next-intl';

const ROLE_REDIRECT: Record<string, string> = {
  DIRECTOR: '/director',
  MANAGER: '/manager',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/student',
};

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('login');
  const tCommon = useTranslations('common');
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
      setError(t('errPhone'));
      return;
    }
    if (!password) {
      setError(t('errPassword'));
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('credentials', { phone, password, redirect: false });
      if (result?.error) {
        setError(t('errAuth'));
        return;
      }
      const sr = await fetch('/api/auth/session');
      const ss = (await sr.json()) as { user?: { role?: string } };
      router.replace(ROLE_REDIRECT[ss?.user?.role ?? ''] ?? '/student');
    } catch (err: any) {
      console.error('Login exception:', err);
      setError(t('errAuth'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 relative">
      {/* Top right language switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo-star.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-white text-xl font-bold tracking-wide">{tCommon('appName')}</span>
        </div>
        <p className="text-slate-400 text-sm">{tCommon('systemDesc')}</p>
      </div>

      <div className="w-full max-w-sm border border-slate-700 bg-[#1e293b] p-8 rounded-lg shadow-xl">
        <h1 className="text-white text-xl font-semibold mb-1">
          {t('title')}
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          {t('subtitle')}
        </p>

        {error && (
          <div className="mb-4 border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-rose-400 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">{t('phoneLabel')}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder={t('phonePlaceholder')}
                className="w-full bg-[#0f172a] border border-slate-600 text-white pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors rounded"
                autoFocus
                autoComplete="tel"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">{t('passwordLabel')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
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
                <span>{t('submit')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-slate-600 text-xs">{t('copyright')}</p>
    </div>
  );
}
