'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { BookOpen, Calendar, CheckCircle2, Clock, AlertCircle, FileText, Award } from 'lucide-react';
import { CustomSelect } from '@/components/ui/custom-select';

interface Homework {
  id: string;
  homeworkId: string;
  title: string;
  description: string;
  groupName: string;
  deadline: string;
  deadlineTime: string;
  status: string;
  grade: number | null;
  comment: string | null;
  submittedAt: string | null;
  isOverdue: boolean;
}

interface Student {
  id: string;
  name: string;
  groupName: string | null;
  homeworks: Homework[];
}

interface Props {
  role: string;
  userName: string;
  userPhone: string;
  unreadCount: number;
  students: Student[];
}

export default function HomeworkClient({
  role,
  userName,
  userPhone,
  unreadCount,
  students,
}: Props) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  if (!selectedStudent) {
    return (
      <AppLayout
        role={role}
        userName={userName}
        userPhone={userPhone}
        unreadCount={unreadCount}
        title="Домашние задания"
      >
        <div className="bg-[#1e293b] p-6 border border-slate-800 rounded-lg text-center text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Вы пока не записаны в группу. Обратитесь к администрации.</p>
        </div>
      </AppLayout>
    );
  }

  // Filter homeworks
  let filteredHomeworks = selectedStudent.homeworks;
  if (filter === 'active') {
    filteredHomeworks = selectedStudent.homeworks.filter(
      (hw) => hw.status !== 'CHECKED' && hw.status !== 'SUBMITTED'
    );
  } else if (filter === 'completed') {
    filteredHomeworks = selectedStudent.homeworks.filter(
      (hw) => hw.status === 'CHECKED' || hw.status === 'SUBMITTED'
    );
  }

  const getStatusBadge = (hw: Homework) => {
    if (hw.status === 'CHECKED') {
      return (
        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-500/40 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Проверено
        </span>
      );
    }
    if (hw.status === 'SUBMITTED') {
      return (
        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/40 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Сдано
        </span>
      );
    }
    if (hw.isOverdue) {
      return (
        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/40 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Просрочено
        </span>
      );
    }
    return (
      <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold border border-orange-500/40 flex items-center gap-1">
        <Clock className="w-3 h-3" /> В работе
      </span>
    );
  };

  return (
    <AppLayout
      role={role}
      userName={userName}
      userPhone={userPhone}
      unreadCount={unreadCount}
      title="Домашние задания"
    >
      <div className="space-y-4">
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

        <div className="flex gap-2 bg-[#1e293b] p-2 border border-slate-800 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-colors ${
              filter === 'all' ? 'bg-orange-500 text-white' : 'bg-[#0f172a] text-slate-400 hover:text-white'
            }`}
          >
            Все ({selectedStudent.homeworks.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-colors ${
              filter === 'active' ? 'bg-orange-500 text-white' : 'bg-[#0f172a] text-slate-400 hover:text-white'
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-colors ${
              filter === 'completed' ? 'bg-orange-500 text-white' : 'bg-[#0f172a] text-slate-400 hover:text-white'
            }`}
          >
            Выполненные
          </button>
        </div>

        {filteredHomeworks.length === 0 ? (
          <div className="bg-[#1e293b] p-6 border border-slate-800 rounded-lg text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>
              {filter === 'all' && 'Домашних заданий пока нет.'}
              {filter === 'active' && 'Нет активных домашних заданий.'}
              {filter === 'completed' && 'Нет выполненных домашних заданий.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHomeworks.map((hw) => (
              <div
                key={hw.id}
                className={`bg-[#1e293b] border rounded-lg overflow-hidden transition-all ${
                  hw.isOverdue ? 'border-red-500/40' : 'border-slate-800 hover:border-orange-500/30'
                }`}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-400" />
                        {hw.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Группа: {hw.groupName}</p>
                    </div>
                    {getStatusBadge(hw)}
                  </div>
                  <div className="bg-[#0f172a] p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-300 whitespace-pre-wrap">{hw.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">Срок сдачи:</span>
                    <span className={hw.isOverdue ? 'text-red-400 font-bold' : 'text-white font-semibold'}>
                      {hw.deadline} {hw.deadlineTime}
                    </span>
                  </div>
                  {hw.status === 'CHECKED' && hw.grade !== null && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">Оценка: {hw.grade}/100</span>
                      </div>
                      {hw.comment && <p className="text-xs text-slate-300">{hw.comment}</p>}
                    </div>
                  )}
                  {hw.submittedAt && (
                    <div className="text-xs text-slate-400">Сдано: {hw.submittedAt}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
