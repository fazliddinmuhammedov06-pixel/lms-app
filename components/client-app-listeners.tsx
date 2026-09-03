'use client';

import { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { WifiOff, RefreshCw } from 'lucide-react';

export function ClientAppListeners() {
  const [isOffline, setIsOffline] = useState(false);

  // 1. Обработка кнопки "Назад" Android (Capacitor)
  useEffect(() => {
    let handler: { remove: () => void } | null = null;

    async function setupBackButton() {
      try {
        handler = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack && window.location.pathname !== '/' && window.location.pathname !== '/student' && window.location.pathname !== '/director' && window.location.pathname !== '/teacher') {
            window.history.back();
          } else {
            CapacitorApp.exitApp();
          }
        });
      } catch {
        // Запуск в браузере — игнорируем ошибку вызова нативного API
      }
    }

    setupBackButton();

    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, []);

  // 2. Обработка подключения к интернету (Offline / Online)
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOffline(false);
      window.location.reload();
    }
  };

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-600 text-white px-4 py-2.5 shadow-lg flex items-center justify-between text-xs sm:text-sm animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2 font-medium">
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
        <span>Нет подключения к интернету. Проверьте сеть.</span>
      </div>
      <button
        onClick={handleRetry}
        className="flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Обновить</span>
      </button>
    </div>
  );
}
