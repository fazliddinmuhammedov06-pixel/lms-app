'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createStudent } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function AddStudentModal({ groups, onClose }: { groups: any[]; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', parentName: '', parentPhone: '', groupId: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.parentName || !form.parentPhone) return toast.error('Заполните обязательные поля');
    setLoading(true);
    try {
      await createStudent(form);
      toast.success('Ученик добавлен');
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
        <h2 className="text-sm font-bold text-white">Новый ученик</h2>
        <form onSubmit={handleAdd} className="space-y-2.5">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">ФИО Ученика *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">ФИО Родителя *</label>
            <input type="text" required value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Телефон Родителя *</label>
            <input type="text" required value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} placeholder="+998901234567" className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Группа</label>
            <select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded">
              <option value="">Без группы</option>
              {groups.map((g: any) => (<option key={g.id} value={g.id}>{g.name}</option>))}
            </select>
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