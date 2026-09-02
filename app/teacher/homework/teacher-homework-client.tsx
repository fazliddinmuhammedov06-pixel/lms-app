'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { BookOpen, Plus, X } from 'lucide-react';
import { createHomework } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function TeacherHomeworkClient({
  role, userName, userPhone, unreadCount, homeworks, groups,
}: any) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', groupId: groups[0]?.id || '', deadline: '2026-09-10T18:00',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.groupId) return toast.error('Заполните название и выберите группу');
    setLoading(true);
    try {
      await createHomework(form);
      toast.success('Домашнее задание выдано!');
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Домашние Задания">
      <div className="flex items-center justify-between bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-orange-400" /> Выданные домашние задания ({homeworks.length})
        </h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" /><span>+ Создать ДЗ</span>
        </button>
      </div>

      <div className="space-y-3">
        {homeworks.length === 0 ? (
          <div className="bg-[#1e293b] p-8 border border-slate-800 rounded-lg text-center">
            <EmptyState icon={BookOpen} title="Нет выданных заданий" description="Создайте новое домашнее задание для своей группы." />
          </div>
        ) : (
          homeworks.map((hw: any) => (
            <div key={hw.id} className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg text-xs space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-sm">{hw.title}</h3>
                  <p className="text-orange-400 font-semibold mt-0.5">{hw.groupName}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Дедлайн: {hw.deadline}</span>
              </div>
              <p className="text-slate-300">{hw.description}</p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Назначено ученикам: <strong className="text-emerald-400">{hw.submissionsCount} чел.</strong>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1e293b] border border-slate-800 rounded-lg w-full max-w-sm p-5 space-y-3 relative text-xs">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-white">Выдать домашнее задание</h2>
            <form onSubmit={handleAdd} className="space-y-2.5">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Тема ДЗ *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Present Perfect" className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Группа *</label>
                <select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded">
                  {groups.map((g: any) => (<option key={g.id} value={g.id}>{g.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Подробное описание</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Выполнить упр. 1-10..." className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none h-16" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Дедлайн *</label>
                <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-semibold">Отмена</button>
                <button type="submit" disabled={loading} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white rounded font-bold cursor-pointer">{loading ? '...' : 'Выдать ДЗ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}