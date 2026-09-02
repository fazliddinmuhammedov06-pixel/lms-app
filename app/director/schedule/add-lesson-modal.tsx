'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createLesson } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function AddLessonModal({ groups, onClose }: { groups: any[]; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    groupId: groups[0]?.id || '',
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '11:30',
    room: groups[0]?.room || 'Кабинет 101',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.groupId) return toast.error('Выберите группу');
    setLoading(true);
    try {
      await createLesson(form);
      toast.success('Занятие успешно добавлено в расписание!');
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#1e293b] border border-slate-800 rounded-lg w-full max-w-sm p-5 space-y-3 relative text-xs">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-white">Создать занятие</h2>
        <form onSubmit={handleAdd} className="space-y-2.5">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Группа *</label>
            <select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded">
              {groups.map((g: any) => (<option key={g.id} value={g.id}>{g.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">День недели *</label>
            <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded">
              <option value={1}>Понедельник</option>
              <option value={2}>Вторник</option>
              <option value={3}>Среда</option>
              <option value={4}>Четверг</option>
              <option value={5}>Пятница</option>
              <option value={6}>Суббота</option>
              <option value={7}>Воскресенье</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Начало</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Конец</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Кабинет</label>
            <input type="text" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-semibold">Отмена</button>
            <button type="submit" disabled={loading} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white rounded font-bold cursor-pointer">{loading ? '...' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}