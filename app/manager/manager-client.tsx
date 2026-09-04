'use client';

import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Users, Building, FileText, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ManagerDashboardClient({
  role, userName, userPhone, unreadCount, stats,
}: any) {
  const t = useTranslations('manager');
  const tCommon = useTranslations('common');

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title={t('dashboard')}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/manager/students" className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg hover:border-orange-500/50 transition-colors">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>{tCommon('students')}</span><Users className="w-4 h-4 text-blue-400" /></div>
          <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
          <p className="text-[10px] text-slate-400 mt-1">{t('totalInBase')}</p>
        </Link>

        <Link href="/manager/groups" className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg hover:border-orange-500/50 transition-colors">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>{tCommon('groups')}</span><Building className="w-4 h-4 text-orange-400" /></div>
          <p className="text-2xl font-bold text-white">{stats.activeGroups}</p>
          <p className="text-[10px] text-slate-400 mt-1">{t('activeGroups')}</p>
        </Link>

        <Link href="/manager/applications" className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg hover:border-orange-500/50 transition-colors">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>{t('applications')}</span><FileText className="w-4 h-4 text-purple-400" /></div>
          <p className="text-2xl font-bold text-amber-400">{stats.pendingRequests}</p>
          <p className="text-[10px] text-slate-400 mt-1">{t('pending')}</p>
        </Link>

        <Link href="/manager/payments" className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg hover:border-orange-500/50 transition-colors">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>{t('payments')}</span><CreditCard className="w-4 h-4 text-emerald-400" /></div>
          <p className="text-2xl font-bold text-emerald-400">{stats.pendingPayments}</p>
          <p className="text-[10px] text-slate-400 mt-1">{t('awaitingPayment')}</p>
        </Link>
      </div>
    </AppLayout>
  );
}