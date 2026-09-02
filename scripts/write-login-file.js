const fs = require('fs');

const part1 = `'use client';

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
    let digits = val.replace(/\\D/g, '');
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
`;
