'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Star, Plus, X } from 'lucide-react';
import { addGrade } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function TeacherGradesClient({
  role, userName, userPhone, unreadCount, grades, students,
}: any) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentId: students[0]?.id || '', gradeInt: 5, comment: 'Отличный ответ',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) return toast.error('Выберите ученика');
    setLoading(true);
    try {
      await addGrade(form);
      toast.success('Оценка поставлена!');
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Журнал Оценок">
      <div className="flex items-center justify-between bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-orange-400" /> Выставленные оценки ({grades.length})
        </h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" /><span>+ Поставить оценку</span>
        </button>
      </div>

      <div className="bg-[#1e293b] border border-slate-800 rounded-lg overflow-hidden">
        {grades.length === 0 ? (
          <div className="p-8"><EmptyState icon={Star} title="Оценок нет" description="Поставьте первую оценку ученику." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr><th className="p-3">Дата</th><th className="p-3">Ученик</th><th className="p-3">Группа</th><th className="p-3">Оценка</th><th className="p-3">Комментарий</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {grades.map((g: any) => (
                  <tr key={g.id} className="hover:bg-[#0f172a]/50">
                    <td className="p-3 text-slate-400">{g.date}</td>
                    <td className="p-3 font-bold text-white">{g.studentName}</td>
                    <td className="p-3 text-slate-300">{g.groupName}</td>
                    <td className="p-3 font-bold text-orange-400 text-sm">{g.gradeInt}</td>
                    <td className="p-3 text-slate-300">{g.comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1e293b] border border-slate-800 rounded-lg w-full max-w-sm p-5 space-y-3 relative text-xs">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-white">Поставить оценку</h2>
            <form onSubmit={handleAdd} className="space-y-2.5">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Ученик *</label>
                <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded">
                  {students.map((s: any) => (<option key={s.id} value={s.id}>{s.name} ({s.groupName})</option>))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Оценка (2 - 5)</label>
                <select value={form.gradeInt} onChange={(e) => setForm({ ...form, gradeInt: Number(e.target.value) })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded">
                  <option value={5}>5 (Отлично)</option>
                  <option value={4}>4 (Хорошо)</option>
                  <option value={3}>3 (Удовлетворительно)</option>
                  <option value={2}>2 (Плохо)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Комментарий</label>
                <input type="text" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-semibold">Отмена</button>
                <button type="submit" disabled={loading} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white rounded font-bold cursor-pointer">{loading ? '...' : 'Сохранить'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}