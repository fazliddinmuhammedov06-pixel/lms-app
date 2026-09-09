import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/30">
        <AlertCircle className="w-10 h-10 text-orange-400" />
      </div>

      <h1 className="text-6xl font-bold text-white mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-200 mb-3">Страница не найдена</h2>
      <p className="text-slate-400 text-sm max-w-xs mb-8">
        Запрошенная страница не существует или была перемещена. Проверьте адрес или вернитесь на главную.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-medium py-2.5 px-6 rounded transition-colors text-sm"
      >
        <Home className="w-4 h-4" />
        Вернуться на главную
      </Link>
    </div>
  );
}
