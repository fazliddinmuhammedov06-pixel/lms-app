'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { DollarSign, Plus, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { AddPaymentModal } from './add-payment-modal';

export default function FinancesClient({
  role, userName, userPhone, unreadCount, payments, students, stats,
}: any) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = payments.filter((p: any) => {
    const matchSearch = p.studentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Финансы и Оплаты">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Оплачено</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{stats.paidPaid.toLocaleString()} UZS</p>
        </div>
        <div className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" /> Ожидается</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{stats.paidPending.toLocaleString()} UZS</p>
        </div>
        <div className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-rose-400" /> Просрочено</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{stats.paidOverdue.toLocaleString()} UZS</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-2 flex-1 w-full bg-[#0f172a] border border-slate-700 px-3 py-2 rounded">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск платежа..." className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#0f172a] border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded">
            <option value="ALL">Все статусы</option>
            <option value="PAID">Оплачено</option>
            <option value="PENDING">Ожидается</option>
            <option value="OVERDUE">Просрочено</option>
          </select>
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" /><span>+ Оплата</span>
          </button>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-800 rounded-lg overflow-hidden">
        {filtered.length === 0 ? <div className="p-8"><EmptyState icon={DollarSign} title="Платежи не найдены" description="Добавьте новую запись." /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr><th className="p-3">Ученик</th><th className="p-3">Группа</th><th className="p-3">Сумма</th><th className="p-3">Дата</th><th className="p-3">Метод</th><th className="p-3">Статус</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#0f172a]/50">
                    <td className="p-3 font-bold text-white">{p.studentName}</td>
                    <td className="p-3 text-slate-400">{p.groupName}</td>
                    <td className="p-3 font-bold text-emerald-400">{p.amount.toLocaleString()} UZS</td>
                    <td className="p-3 text-slate-400">{p.date}</td>
                    <td className="p-3 text-slate-300">{p.paymentMethod}</td>
                    <td className="p-3"><span className="font-bold text-emerald-400">{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && <AddPaymentModal students={students} onClose={() => setIsModalOpen(false)} />}
    </AppLayout>
  );
}