'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Award, TrendingUp, TrendingDown, Calendar, User, Sparkles } from 'lucide-react';
import { CustomSelect } from '@/components/ui/custom-select';

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  teacherName: string;
  date: string;
  time: string;
}

interface Student {
  id: string;
  name: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: Transaction[];
}

interface Props {
  role: string;
  userName: string;
  userPhone: string;
  unreadCount: number;
  students: Student[];
}

export default function StarsClient({
  role,
  userName,
  userPhone,
  unreadCount,
  students,
}: Props) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  if (!selectedStudent) {
    return (
      <AppLayout
        role={role}
        userName={userName}
        userPhone={userPhone}
        unreadCount={unreadCount}
        title="Мои Звёзды"
      >
        <div className="bg-[#1e293b] p-6 border border-slate-800 rounded-lg text-center text-slate-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Вы пока не записаны в группу. Обратитесь к администрации.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      role={role}
      userName={userName}
      userPhone={userPhone}
      unreadCount={unreadCount}
      title="Мои Звёзды"
    >
      <div className="space-y-4">
        {/* Student selector */}
        {students.length > 1 && (
          <div className="flex items-center justify-between bg-[#1e293b] p-3 border border-slate-800 rounded-lg">
            <span className="text-slate-300 text-sm font-medium">Ученик:</span>
            <CustomSelect
              value={selectedStudentId}
              onChange={(v: string | null) => v && setSelectedStudentId(v)}
              options={students.map((s) => ({ value: s.id, label: s.name }))}
              className="w-[200px] text-slate-900"
            />
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/40 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase">Текущий баланс</span>
            </div>
            <div className="text-3xl font-bold text-white">⭐ {selectedStudent.currentBalance}</div>
          </div>

          <div className="bg-[#1e293b] border border-slate-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase">Всего заработано</span>
            </div>
            <div className="text-2xl font-bold text-white">⭐ {selectedStudent.totalEarned}</div>
          </div>

          <div className="bg-[#1e293b] border border-slate-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <TrendingDown className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase">Всего потрачено</span>
            </div>
            <div className="text-2xl font-bold text-white">⭐ {selectedStudent.totalSpent}</div>
          </div>
        </div>

        {/* Transactions history */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-lg overflow-hidden">
          <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-400" />
              История транзакций
            </h3>
          </div>

          {selectedStudent.transactions.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>История транзакций пуста.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {selectedStudent.transactions.map((tr) => (
                <div key={tr.id} className="p-4 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-bold ${
                            tr.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {tr.amount > 0 ? '+' : ''}{tr.amount} ⭐
                        </span>
                        <span className="text-xs text-slate-400">
                          {tr.date} в {tr.time}
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium">{tr.reason}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <User className="w-3 h-3" />
                        <span>{tr.teacherName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
