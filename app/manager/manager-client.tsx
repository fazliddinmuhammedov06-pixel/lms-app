'use client';

import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Users, Building, FileText, CreditCard } from 'lucide-react';

export default function ManagerDashboardClient({
  role, userName, userPhone, unreadCount, stats,
}: any) {
  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Панель Менеджера">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/manager/students" className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg hover:border-orange-500/50 transition-colors">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>Ученики</span><Users className="w-4 h-4 text-blue-400" /></div>
          <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
          <p className="text-[10px] text-slate-400 mt-1">Всего в базе</p>
        </Link>

        <Link href="/manager/groups" className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg hover:border-orange-500/50 transition-colors">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>Группы</span><Building className="w-4 h-4 text-orange-400" /></div>
          <p className="text-2xl font-bold text-white">{stats.activeGroups}</p>
          <p className="text-[10px] text-slate-400 mt-1">Активных групп</p>
        </Link>

        <Link href="/manager/applications" className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg hover:border-orange-500/50 transition-colors">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>Заявки</span><FileText className="w-4 h-4 text-purple-400" /></div>
          <p className="text-2xl font-bold text-amber-400">{stats.pendingRequests}</p>
          <p className="text-[10px] text-slate-400 mt-1">Ожидают решения</p>
        </Link>

        <Link href="/manager/payments" className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg hover:border-orange-500/50 transition-colors">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>Платежи</span><CreditCard className="w-4 h-4 text-emerald-400" /></div>
          <p className="text-2xl font-bold text-emerald-400">{stats.pendingPayments}</p>
          <p className="text-[10px] text-slate-400 mt-1">Ожидается оплата</p>
        </Link>
      </div>
    </AppLayout>
  );
}