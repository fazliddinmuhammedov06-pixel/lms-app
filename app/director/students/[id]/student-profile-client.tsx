'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Avatar } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

export default function StudentProfileClient({ role, userName, userPhone, unreadCount, student }: any) {
  const [tab, setTab] = useState<'overview' | 'attendance' | 'grades' | 'homework' | 'payments' | 'stars'>('overview');

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title={`Профиль: ${student.name}`}>
      <div className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg flex flex-col sm:flex-row justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <Avatar name={student.name} size={44} />
          <div>
            <h1 className="text-base font-bold text-white">{student.name}</h1>
            <p className="text-orange-400 font-semibold">Уровень {student.levelInfo.level}: {student.levelInfo.levelName}</p>
            <p className="text-slate-400 text-[10px]">Группа: {student.groupName} • Родитель: {student.parentName} ({student.parentPhone})</p>
          </div>
        </div>
        <div className="bg-[#0f172a] p-2 border border-slate-800 rounded text-right shrink-0">
          <span className="text-[10px] text-slate-400 block">Баланс</span>
          <span className="text-lg font-bold text-orange-400 flex items-center gap-1"><Star className="w-4 h-4 fill-orange-400" /> {student.stars} ⭐</span>
        </div>
      </div>

      <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto text-xs my-2">
        {[
          { id: 'overview', label: 'Обзор' },
          { id: 'attendance', label: `Посещаемость (${student.attendanceHistory.length})` },
          { id: 'grades', label: `Оценки (${student.gradesHistory.length})` },
          { id: 'homework', label: `Домашки (${student.homeworkHistory.length})` },
          { id: 'payments', label: `Платежи (${student.paymentsHistory.length})` },
          { id: 'stars', label: `Звёзды (${student.starsHistory.length})` },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={`px-3 py-1.5 font-bold border-b-2 cursor-pointer ${tab === t.id ? 'border-orange-500 text-orange-400 bg-[#1e293b]' : 'border-transparent text-slate-400'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#1e293b] p-3 border border-slate-800 rounded">
            <span className="text-slate-400">Прогресс</span>
            <div className="w-full bg-[#0f172a] h-2 rounded mt-2 overflow-hidden"><div style={{ width: `${student.levelInfo.progressPercent}%` }} className="bg-orange-500 h-full" /></div>
          </div>
          <div className="bg-[#1e293b] p-3 border border-slate-800 rounded text-center"><span className="text-slate-400">Посещаемость</span><p className="text-xl font-bold text-emerald-400 mt-1">{student.attRate}%</p></div>
          <div className="bg-[#1e293b] p-3 border border-slate-800 rounded text-center"><span className="text-slate-400">Долг</span><p className="text-xl font-bold text-rose-400 mt-1">{student.totalOverdue.toLocaleString()} UZS</p></div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="bg-[#1e293b] border border-slate-800 rounded p-3 space-y-1 text-xs">
          {student.attendanceHistory.map((a: any) => (
            <div key={a.id} className="p-2 border-b border-slate-800 flex justify-between"><span>{a.date} ({a.groupName})</span><span className="font-bold text-emerald-400">{a.status}</span></div>
          ))}
        </div>
      )}

      {tab === 'grades' && (
        <div className="bg-[#1e293b] border border-slate-800 rounded p-3 space-y-2 text-xs">
          {student.gradesHistory.map((g: any) => (
            <div key={g.id} className="bg-[#0f172a] p-2 border border-slate-800 rounded flex justify-between">
              <div><span className="font-bold text-orange-400">Оценка: {g.grade}</span><p className="text-slate-300">{g.comment}</p></div>
            </div>
          ))}
        </div>
      )}

      {tab === 'homework' && (
        <div className="bg-[#1e293b] border border-slate-800 rounded p-3 space-y-2 text-xs">
          {student.homeworkHistory.map((hw: any) => (
            <div key={hw.id} className="bg-[#0f172a] p-2 border border-slate-800 rounded flex justify-between items-center">
              <div><p className="font-bold text-white">{hw.title}</p><p className="text-[10px] text-slate-400">Дедлайн: {hw.deadline}</p></div>
              <span className="bg-slate-800 text-orange-400 font-bold px-2 py-0.5 rounded text-[10px]">{hw.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'payments' && (
        <div className="bg-[#1e293b] border border-slate-800 rounded p-3 space-y-1 text-xs">
          {student.paymentsHistory.map((p: any) => (
            <div key={p.id} className="p-2 border-b border-slate-800 flex justify-between"><span>{p.date} - {p.amount.toLocaleString()} UZS</span><span className="font-bold text-emerald-400">{p.status}</span></div>
          ))}
        </div>
      )}

      {tab === 'stars' && (
        <div className="bg-[#1e293b] border border-slate-800 rounded p-3 space-y-2 text-xs">
          {student.starsHistory.map((st: any) => (
            <div key={st.id} className="bg-[#0f172a] p-2 border border-slate-800 rounded flex justify-between items-center">
              <div><p className="font-semibold text-white">{st.reason}</p><p className="text-[10px] text-slate-500">{st.teacherName} • {st.date}</p></div>
              <span className={`font-bold ${st.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{st.amount > 0 ? `+${st.amount}` : st.amount} ⭐</span>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}