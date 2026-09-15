'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, UserPlus, Star, Eye, Users, Trash2, X } from 'lucide-react';
import { AddStudentModal } from './add-student-modal';
import { updateStudentGroup, deleteStudent } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function StudentsClient({
  role, userName, userPhone, unreadCount, students, groups,
}: any) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = students.filter((st: any) => {
    const matchS = st.name.toLowerCase().includes(search.toLowerCase()) || st.parentName.toLowerCase().includes(search.toLowerCase());
    const matchG = selectedGroup === 'ALL' || st.groupId === selectedGroup;
    return matchS && matchG;
  });

  const handleGroupChange = async (studentId: string, groupId: string) => {
    setEditingStudent(studentId);
    try {
      await updateStudentGroup(studentId, groupId === '' ? null : groupId);
      toast.success('Группа обновлена');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка');
    } finally {
      setEditingStudent(null);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteStudent(studentToDelete.id);
      toast.success(`Ученик ${studentToDelete.name} удалён`);
      setStudentToDelete(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка при удалении ученика');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Ученики Учебного Центра">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-2 flex-1 w-full bg-[#0f172a] border border-slate-700 px-3 py-2 rounded">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по имени или родителю..." className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="bg-[#0f172a] border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded">
            <option value="ALL">Все группы</option>
            {groups.map((g: any) => (<option key={g.id} value={g.id}>{g.name}</option>))}
          </select>
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-3.5 py-2 rounded flex items-center gap-1 cursor-pointer shrink-0">
            <UserPlus className="w-4 h-4" /><span>+ Ученик</span>
          </button>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-800 rounded-lg overflow-hidden">
        {filtered.length === 0 ? <div className="p-6"><EmptyState icon={Search} title="Ученики не найдены" description="Попробуйте изменить параметры поиска." /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr><th className="p-3.5">Ученик</th><th className="p-3.5">Группа</th><th className="p-3.5">Родитель</th><th className="p-3.5">Посещаемость</th><th className="p-3.5">⭐ Звёзды</th><th className="p-3.5 text-right">Действие</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((st: any) => (
                  <tr key={st.id} className="hover:bg-[#0f172a]/50">
                    <td className="p-3.5 flex items-center gap-3"><Avatar name={st.name} size={34} /><div><p className="font-bold text-white text-xs">{st.name}</p><p className="text-[10px] text-slate-400">{st.phone || 'Нет тел.'}</p></div></td>
                    <td className="p-3.5">
                      <select 
                        value={st.groupId || ''} 
                        onChange={(e) => handleGroupChange(st.id, e.target.value)}
                        disabled={editingStudent === st.id}
                        className="bg-[#0f172a] border border-slate-700 text-xs text-orange-400 px-2 py-1 rounded font-semibold"
                      >
                        <option value="">Без группы</option>
                        {groups.map((g: any) => (<option key={g.id} value={g.id}>{g.name}</option>))}
                      </select>
                    </td>
                    <td className="p-3.5"><p className="font-semibold text-slate-200">{st.parentName}</p><p className="text-[10px] text-slate-400">{st.parentPhone}</p></td>
                    <td className="p-3.5 font-bold text-emerald-400">{st.attPercent}%</td>
                    <td className="p-3.5 font-bold text-orange-400"><span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-orange-400" /> {st.stars}</span></td>
                    <td className="p-3.5 text-right">
                      <Link href={`/${role.toLowerCase()}/students/${st.id}`} className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] font-semibold"><Eye className="w-3 h-3 text-orange-400" /><span>Профиль</span></Link>
                      {role === 'DIRECTOR' && (
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(st)}
                          title="Удалить ученика"
                          className="ml-1 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {isModalOpen && <AddStudentModal groups={groups} onClose={() => setIsModalOpen(false)} />}

      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1e293b] border border-slate-800 rounded-lg w-full max-w-sm p-5 space-y-4 relative text-xs shadow-xl">
            <button
              type="button"
              onClick={() => setStudentToDelete(null)}
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
                <h2 className="text-sm font-bold text-white">Удаление ученика</h2>
                <p className="text-slate-400 text-[11px]">{studentToDelete.name}</p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Вы уверены, что хотите удалить ученика <strong className="text-white">{studentToDelete.name}</strong>? Все связанные данные (посещаемость, оценки, звёзды, платежи) будут безвозвратно удалены из базы. Это действие нельзя отменить.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold cursor-pointer disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Удаление...' : 'Удалить ученика'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}