'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Users, Calendar, ArrowLeft, UserPlus, Trash2, Star, X, Search } from 'lucide-react';
import { updateStudentGroup } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function GroupDetailClient({
  role, userName, userPhone, unreadCount, group, availableStudents, canManage = true,
}: any) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const filteredAvailable = availableStudents.filter((s: any) =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.parentName.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleAddStudent = async (studentId: string) => {
    setProcessing(studentId);
    try {
      await updateStudentGroup(studentId, group.id);
      toast.success('Ученик добавлен в группу');
      setIsAddModalOpen(false);
      setSearchStudent('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка добавления');
    } finally {
      setProcessing(null);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Удалить ученика из группы?')) return;
    setProcessing(studentId);
    try {
      await updateStudentGroup(studentId, null);
      toast.success('Ученик удалён из группы');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка удаления');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title={`Группа: ${group.name}`}>
      <div className="space-y-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3">
          <Link href="/director/groups" className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{group.name}</h1>
            <p className="text-sm text-orange-400">{group.subject} • {group.level}</p>
          </div>
        </div>

        {/* Group Info Card */}
        <div className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400 mb-1">Преподаватель</p>
              <p className="text-white font-semibold">{group.teacherName}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Кабинет</p>
              <p className="text-white font-semibold">{group.room}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Оплата</p>
              <p className="text-emerald-400 font-bold">{group.monthlyPrice.toLocaleString()} UZS</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Статус</p>
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase inline-block ${
                group.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {group.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
            <div className="bg-[#0f172a] p-3 rounded border border-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Учеников</p>
                <p className="text-lg font-bold text-white">{group.students.length}</p>
              </div>
            </div>
            <div className="bg-[#0f172a] p-3 rounded border border-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs text-slate-400">Занятий</p>
                <p className="text-lg font-bold text-white">{group.lessonsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              Ученики группы
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={!canManage}
              className={`${canManage ? 'bg-orange-500 hover:bg-orange-400 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'} text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Добавить ученика
            </button>
          </div>

          {group.students.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Users} title="В группе нет учеников" description="Добавьте первого ученика в эту группу." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Ученик</th>
                    <th className="p-3">Родитель</th>
                    <th className="p-3">⭐ Звёзды</th>
                    <th className="p-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {group.students.map((student: any) => (
                    <tr key={student.id} className="hover:bg-[#0f172a]/50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.name} size={36} />
                          <div>
                            <p className="font-bold text-white">{student.name}</p>
                            <p className="text-[10px] text-slate-400">{student.phone || 'Нет тел.'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-200">{student.parentName}</p>
                        <p className="text-[10px] text-slate-400">{student.parentPhone}</p>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-orange-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-orange-400" />
                          {student.stars}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {canManage && (
                          <button
                            onClick={() => handleRemoveStudent(student.id)}
                            disabled={processing === student.id}
                            className="inline-flex items-center gap-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 px-2 py-1 rounded text-[11px] font-semibold disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            {processing === student.id ? '...' : 'Удалить'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1e293b] border border-slate-800 rounded-lg w-full max-w-md p-5 space-y-3 relative text-xs max-h-[80vh] overflow-y-auto">
            <button onClick={() => { setIsAddModalOpen(false); setSearchStudent(''); }} className="absolute top-3 right-3 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-white">Добавить ученика в группу</h2>

            <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 px-3 py-2 rounded">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Поиск по имени или родителю..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            {filteredAvailable.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                {availableStudents.length === 0 ? 'Все ученики уже распределены по группам' : 'Ученики не найдены'}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAvailable.map((student: any) => (
                  <div key={student.id} className="bg-[#0f172a] border border-slate-700 p-3 rounded flex items-center justify-between hover:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <Avatar name={student.name} size={32} />
                      <div>
                        <p className="font-bold text-white text-xs">{student.name}</p>
                        <p className="text-[10px] text-slate-400">{student.parentName} {student.groupName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddStudent(student.id)}
                      disabled={processing === student.id}
                      className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-3 py-1 rounded disabled:opacity-50 cursor-pointer"
                    >
                      {processing === student.id ? '...' : 'Добавить'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => { setIsAddModalOpen(false); setSearchStudent(''); }}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-semibold"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
