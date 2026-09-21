'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Building, Plus, Search, Users, Calendar, Trash2, AlertTriangle, X } from 'lucide-react';
import { AddGroupModal } from './add-group-modal';
import { deleteGroup } from '@/app/actions';
import { toast } from 'sonner';

export default function GroupsClient({
  role, userName, userPhone, unreadCount, groups, teachers,
}: any) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [groupToDelete, setGroupToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = groups.filter((g: any) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.teacherName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGroup(groupToDelete.id);
      toast.success(`Группа ${groupToDelete.name} успешно удалена`);
      setGroupToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Ошибка при удалении группы');
    } finally {
      setIsDeleting(false);
    }
  };

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
            <div
              key={g.id}
              className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-3 hover:border-orange-500/30 transition-colors cursor-pointer"
              onClick={() => {
                router.push(`/${role.toLowerCase()}/groups/${g.id}`);
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-sm">{g.name}</h3>
                  <p className="text-orange-400 text-xs font-semibold mt-0.5">{g.subject}{g.level ? ` • ${g.level}` : ''}</p>
                </div>
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    title="Удалить группу"
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setGroupToDelete(g);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  g.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                    {g.status}
                  </span>
                </div>
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

      {/* Confirmation Modal for Group Deletion */}
      {groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1e293b] border border-slate-800 rounded-lg w-full max-w-md p-5 space-y-4 relative text-xs shadow-xl">
            <button
              type="button"
              onClick={() => setGroupToDelete(null)}
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
                <h2 className="text-sm font-bold text-white">Удаление группы</h2>
                <p className="text-slate-400 text-[11px]">{groupToDelete.name}</p>
              </div>
            </div>

            {groupToDelete.studentsCount > 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 space-y-2 text-amber-300">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-200">Внимание: в группе есть ученики</p>
                    <p className="text-[11px] text-amber-300/90 leading-relaxed">
                      В группе: <strong className="text-white">{groupToDelete.studentsCount}</strong> ученик(ов). После удаления группы эти ученики останутся в системе, но будут без группы.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 leading-relaxed">
                Вы уверены, что хотите удалить группу <strong className="text-white">{groupToDelete.name}</strong>? После удаления группа будет удалена из системы.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setGroupToDelete(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold cursor-pointer disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Удаление...' : 'Удалить группу'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}