'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Building, Plus, Search, Users, Calendar } from 'lucide-react';
import { AddGroupModal } from './add-group-modal';

export default function GroupsClient({
  role, userName, userPhone, unreadCount, groups, teachers,
}: any) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = groups.filter((g: any) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.teacherName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Группы Обучения">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-2 flex-1 w-full bg-[#0f172a] border border-slate-700 px-3 py-2 rounded">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию или учителю..." className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#0f172a] border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded">
            <option value="ALL">Все статусы</option>
            <option value="ACTIVE">Активные</option>
            <option value="RECRUITING">Набираются</option>
            <option value="COMPLETED">Завершённые</option>
          </select>
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" /><span>+ Создать группу</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-[#1e293b] p-8 border border-slate-800 rounded-lg">
            <EmptyState icon={Building} title="Группы не найдены" description="Создайте новую учебную группу." />
          </div>
        ) : (
          filtered.map((g: any) => (
            <div key={g.id} className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-sm">{g.name}</h3>
                  <p className="text-orange-400 text-xs font-semibold mt-0.5">{g.subject} • {g.level}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  g.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {g.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <p>Учитель: <strong className="text-white">{g.teacherName}</strong></p>
                <p>Кабинет: <span className="text-slate-400">{g.room}</span></p>
                <p>Оплата: <span className="text-emerald-400 font-bold">{g.monthlyPrice.toLocaleString()} UZS / мес</span></p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-800">
                <div className="bg-[#0f172a] p-2 rounded border border-slate-800 flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold text-white">{g.studentsCount} учеников</span>
                </div>
                <div className="bg-[#0f172a] p-2 rounded border border-slate-800 flex items-center justify-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-white">{g.lessonsCount} занятий</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && <AddGroupModal teachers={teachers} onClose={() => setIsModalOpen(false)} />}
    </AppLayout>
  );
}