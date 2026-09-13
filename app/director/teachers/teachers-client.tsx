'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { GraduationCap, UserPlus, UserMinus, Search } from 'lucide-react';
import { AddTeacherModal } from './add-teacher-modal';
import { TeacherAddStudentModal } from './teacher-add-student-modal';
import { TeacherRemoveStudentModal } from './teacher-remove-student-modal';

export default function TeachersClient({
  role, userName, userPhone, unreadCount, teachers, availableStudents = [],
}: any) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addStudentTeacherId, setAddStudentTeacherId] = useState<string | null>(null);
  const [removeStudentTeacherId, setRemoveStudentTeacherId] = useState<string | null>(null);

  const filtered = teachers.filter((t: any) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const activeAddTeacher = teachers.find((t: any) => t.id === addStudentTeacherId);
  const activeRemoveTeacher = teachers.find((t: any) => t.id === removeStudentTeacherId);

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Учителя Преподаватели">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-2 flex-1 w-full bg-[#0f172a] border border-slate-700 px-3 py-2 rounded">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по имени или предмету..." className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full" />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer shrink-0">
          <UserPlus className="w-4 h-4" /><span>+ Добавить учителя</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-[#1e293b] p-8 border border-slate-800 rounded-lg">
            <EmptyState icon={GraduationCap} title="Учителя не найдены" description="Добавьте нового преподавателя." />
          </div>
        ) : (
          filtered.map((t: any) => (
            <div key={t.id} className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name={t.name} size={40} />
                <div>
                  <h3 className="font-bold text-white text-sm">{t.name}</h3>
                  <p className="text-orange-400 text-xs font-semibold">{t.subject}</p>
                  <p className="text-[10px] text-slate-400">{t.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                <div className="bg-[#0f172a] p-2 rounded border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px]">Групп</span>
                  <p className="font-bold text-white text-sm mt-0.5">{t.groupsCount}</p>
                </div>
                <div className="bg-[#0f172a] p-2 rounded border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px]">Учеников</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setAddStudentTeacherId(t.id)}
                        disabled={t.groupsCount === 0}
                        title={t.groupsCount === 0 ? 'У учителя нет групп' : 'Добавить ученика'}
                        className={`p-1 rounded border transition-colors ${
                          t.groupsCount > 0
                            ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/30 cursor-pointer'
                            : 'bg-slate-800/40 text-slate-600 border-slate-700/40 cursor-not-allowed opacity-40'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemoveStudentTeacherId(t.id)}
                        disabled={t.totalStudents === 0 || t.groupsCount === 0}
                        title={
                          t.groupsCount === 0
                            ? 'У учителя нет групп'
                            : t.totalStudents === 0
                            ? 'В группах нет учеников'
                            : 'Удалить ученика'
                        }
                        className={`p-1 rounded border transition-colors ${
                          t.totalStudents > 0 && t.groupsCount > 0
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer'
                            : 'bg-slate-800/40 text-slate-600 border-slate-700/40 cursor-not-allowed opacity-40'
                        }`}
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="font-bold text-emerald-400 text-sm mt-0.5">{t.totalStudents}</p>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-[11px] font-semibold text-slate-400">Группы:</p>
                {t.groups.length === 0 ? <p className="text-[10px] text-slate-500">Нет назначенных групп</p> : (
                  <div className="space-y-1">
                    {t.groups.map((g: any) => (
                      <div key={g.id} className="bg-[#0f172a] p-1.5 rounded text-[11px] flex justify-between">
                        <span className="text-slate-200 font-medium">{g.name}</span>
                        <span className="text-orange-400 font-bold">{g.studentsCount} учен.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && <AddTeacherModal onClose={() => setIsModalOpen(false)} />}

      {activeAddTeacher && (
        <TeacherAddStudentModal
          teacher={activeAddTeacher}
          availableStudents={availableStudents}
          onClose={() => setAddStudentTeacherId(null)}
        />
      )}

      {activeRemoveTeacher && (
        <TeacherRemoveStudentModal
          teacher={activeRemoveTeacher}
          onClose={() => setRemoveStudentTeacherId(null)}
        />
      )}
    </AppLayout>
  );
}