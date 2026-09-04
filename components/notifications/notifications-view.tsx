'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Bell } from 'lucide-react';
import { markNotificationRead } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function NotificationsView({
  role, userName, userPhone, unreadCount, notifications,
}: any) {
  const router = useRouter();
  const t = useTranslations('notifications');
  const tCommon = useTranslations('common');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleMarkRead = async (id: string) => {
    setLoadingId(id);
    try {
      await markNotificationRead(id);
      toast.success(tCommon('saved'));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || tCommon('error'));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title={t('title')}>
      <div className="bg-[#1e293b] p-5 border border-slate-800 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-400" /> {t('center')}
          </h2>
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title={t('empty')} description={t('emptyDesc')} />
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div
                key={n.id}
                className={`p-4 border rounded-lg flex items-center justify-between gap-3 text-xs transition-colors ${
                  n.read ? 'bg-[#0f172a]/50 border-slate-800 text-slate-400' : 'bg-[#0f172a] border-orange-500/30 text-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{n.title}</span>
                    <span className="text-[10px] bg-slate-800 text-orange-400 px-2 py-0.5 rounded font-bold uppercase">{n.category}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{n.message}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{n.date}</p>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    disabled={loadingId === n.id}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {t('markAsRead')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}