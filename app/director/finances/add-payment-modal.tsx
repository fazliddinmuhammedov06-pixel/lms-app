'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createPayment } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function AddPaymentModal({ students, onClose }: { students: any[]; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentId: students[0]?.id || '',
    amount: 350000,
    paymentMethod: 'Payme',
    comment: 'Оплата за обучение',
    status: 'PAID',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.amount) return toast.error('Заполните ученика и сумму');
    setLoading(true);
    try {
      await createPayment(form);
      toast.success('Оплата успешно зафиксирована!');
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
        <h2 className="text-sm font-bold text-white">Принять платеж</h2>
        <form onSubmit={handleAdd} className="space-y-2.5">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Ученик *</label>
            <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded">
              {students.map((s: any) => (<option key={s.id} value={s.id}>{s.name} ({s.groupName})</option>))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Сумма (UZS) *</label>
            <input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Способ оплаты</label>
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded">
              <option value="Payme">Payme</option>
              <option value="Click">Click</option>
              <option value="Наличные">Наличные</option>
              <option value="Банковская карта">Банковская карта</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Статус</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded">
              <option value="PAID">Оплачено (PAID)</option>
              <option value="PENDING">Ожидается (PENDING)</option>
              <option value="OVERDUE">Просрочено (OVERDUE)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Комментарий</label>
            <input type="text" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none" />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-semibold">Отмена</button>
            <button type="submit" disabled={loading} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white rounded font-bold cursor-pointer">{loading ? '...' : 'Провести'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}