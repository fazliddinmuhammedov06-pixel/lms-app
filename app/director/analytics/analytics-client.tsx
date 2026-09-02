'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { BarChart3, Users, CheckCircle, DollarSign, Building } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';

export default function AnalyticsClient({
  role, userName, userPhone, unreadCount, analyticsData,
}: any) {
  const { students, attendance, finances, counts } = analyticsData;

  const attRate = attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : 100;
  const absRate = attendance.total > 0 ? Math.round((attendance.absent / attendance.total) * 100) : 0;
  const lateRate = attendance.total > 0 ? Math.round((attendance.late / attendance.total) * 100) : 0;

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Аналитика Учебного Центра">
      {/* 1. STUDENTS ANALYTICS */}
      <div className="bg-[#1e293b] p-5 border border-slate-800 rounded-lg space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" /> Аналитика по ученикам
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-[#0f172a] p-3 rounded border border-slate-800">
            <span className="text-slate-400 text-[10px]">Всего учеников</span>
            <p className="text-xl font-bold text-white mt-1">{students.total}</p>
          </div>
          <div className="bg-[#0f172a] p-3 rounded border border-slate-800">
            <span className="text-slate-400 text-[10px]">Активные</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">{students.active}</p>
          </div>
          <div className="bg-[#0f172a] p-3 rounded border border-slate-800">
            <span className="text-slate-400 text-[10px]">Новые за месяц</span>
            <p className="text-xl font-bold text-blue-400 mt-1">{students.new}</p>
          </div>
          <div className="bg-[#0f172a] p-3 rounded border border-slate-800">
            <span className="text-slate-400 text-[10px]">Ушедшие</span>
            <p className="text-xl font-bold text-slate-400 mt-1">{students.left}</p>
          </div>
        </div>
      </div>

      {/* 2. ATTENDANCE & FINANCES ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] p-5 border border-slate-800 rounded-lg space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" /> Посещаемость
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-slate-300 font-medium">
                <span>Присутствовали ({attendance.present})</span>
                <span className="font-bold text-emerald-400">{attRate}%</span>
              </div>
              <ProgressBar value={attRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-slate-300 font-medium">
                <span>Пропустили ({attendance.absent})</span>
                <span className="font-bold text-rose-400">{absRate}%</span>
              </div>
              <div className="w-full bg-[#0f172a] h-2 rounded overflow-hidden">
                <div style={{ width: `${absRate}%` }} className="bg-rose-500 h-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-slate-300 font-medium">
                <span>Опоздали ({attendance.late})</span>
                <span className="font-bold text-amber-400">{lateRate}%</span>
              </div>
              <div className="w-full bg-[#0f172a] h-2 rounded overflow-hidden">
                <div style={{ width: `${lateRate}%` }} className="bg-amber-500 h-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-5 border border-slate-800 rounded-lg space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-400" /> Финансы
          </h2>
          <div className="space-y-2 text-xs">
            <div className="bg-[#0f172a] p-3 rounded border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300">Фактически оплачено:</span>
              <span className="font-bold text-emerald-400 text-sm">{finances.paid.toLocaleString()} UZS</span>
            </div>
            <div className="bg-[#0f172a] p-3 rounded border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300">Ожидаемые поступления:</span>
              <span className="font-bold text-amber-400 text-sm">{finances.pending.toLocaleString()} UZS</span>
            </div>
            <div className="bg-[#0f172a] p-3 rounded border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300">Просроченная задолженность:</span>
              <span className="font-bold text-rose-400 text-sm">{finances.overdue.toLocaleString()} UZS</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}