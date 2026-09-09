'use client';

import { useEffect } from 'react';
import { RotateCcw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30">
        <AlertTriangle className="w-10 h-10 text-rose-400" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Что-то пошло не так</h1>
      <p className="text-slate-400 text-sm max-w-xs mb-2">
        Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
      </p>

      {error?.digest && (
        <p className="text-slate-600 text-xs mb-6 font-mono">
          ID ошибки: {error.digest}
        </p>
      )}

      {!error?.digest && <div className="mb-6" />}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-medium py-2.5 px-6 rounded transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Попробовать снова
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-medium py-2.5 px-6 rounded transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          На главную
        </Link>
      </div>
    </div>
  );
}
