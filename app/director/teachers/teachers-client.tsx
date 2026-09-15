'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { GraduationCap, UserPlus, UserMinus, Search, Trash2, AlertTriangle, X } from 'lucide-react';
import { AddTeacherModal } from './add-teacher-modal';
import { TeacherAddStudentModal } from './teacher-add-student-modal';
import { TeacherRemoveStudentModal } from './teacher-remove-student-modal';
import { deleteTeacher } from '@/app/actions';
import { toast } from 'sonner';

export default function TeachersClient({
  role, userName, userPhone, unreadCount, teachers, availableStudents = [],
}: any) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addStudentTeacherId, setAddStudentTeacherId] = useState<string | null>(null);
  const [removeStudentTeacherId, setRemoveStudentTeacherId] = useState<string | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = teachers.filter((t: any) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const activeAddTeacher = teachers.find((t: any) => t.id === addStudentTeacherId);
  const activeRemoveTeacher = teachers.find((t: any) => t.id === removeStudentTeacherId);

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTeacher(teacherToDelete.id);
      toast.success(`Учитель ${teacherToDelete.name} успешно удалён`);
      setTeacherToDelete(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка при удалении учителя');
    } finally {
      setIsDeleting(false);
    }
  };

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
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} size={40} />
                  <div>
                    <h3 className="font-bold text-white text-sm">{t.name}</h3>
                    <p className="text-orange-400 text-xs font-semibold">{t.subject}</p>
                    <p className="text-[10px] text-slate-400">{t.phone}</p>
                  </div>
                </div>
                {role === 'DIRECTOR' && (
                  <button
                    type="button"
                    onClick={() => setTeacherToDelete(t)}
                    title="Удалить учителя"
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
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

      {/* Confirmation Modal for Teacher Deletion */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1e293b] border border-slate-800 rounded-lg w-full max-w-md p-5 space-y-4 relative text-xs shadow-xl">
            <button
              onClick={() => setTeacherToDelete(null)}
              disabled={isDeleting}
              className="absolute top-3 right-3 text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Удаление учителя</h2>
                <p className="text-slate-400 text-[11px]">{teacherToDelete.name}</p>
              </div>
            </div>

            {teacherToDelete.groupsCount > 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 space-y-2 text-amber-300">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-200">
                      Внимание: у учителя есть активные группы!
                    </p>
                    <p className="text-[11px] text-amber-300/90 leading-relaxed">
                      Закреплено групп: <strong className="text-white">{teacherToDelete.groupsCount}</strong> (всего учеников: <strong className="text-white">{teacherToDelete.totalStudents}</strong>).
                      При удалении учителя эти группы будут удалены, а ученики переведены в список без групп.
                    </p>
                  </div>
                </div>
                {teacherToDelete.groups.length > 0 && (
                  <div className="bg-black/30 rounded p-2 text-[10px] space-y-1 max-h-28 overflow-y-auto">
                    {teacherToDelete.groups.map((g: any) => (
                      <div key={g.id} className="flex justify-between text-slate-300">
                        <span>• {g.name}</span>
                        <span className="text-amber-400 font-medium">{g.studentsCount} уч.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-300 leading-relaxed">
                Вы уверены, что хотите удалить преподавателя <strong className="text-white">{teacherToDelete.name}</strong>? Учётная запись и все связанные данные будут безвозвратно удалены.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold cursor-pointer disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDeleteTeacher}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Удаление...' : 'Удалить учителя'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}