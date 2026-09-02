'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Settings, Building, Bell, Star, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsClient({
  role, userName, userPhone, unreadCount, settings,
}: any) {
  const [form, setForm] = useState({
    name: settings.name || 'Friday Education LMS',
    phone: settings.phone || '+998 90 123 45 67',
    address: settings.address || 'г. Ташкент',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Настройки учебного центра сохранены!');
  };

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Настройки Системы">
      <div className="max-w-3xl space-y-6">
        {/* Center Details */}
        <div className="bg-[#1e293b] p-5 border border-slate-800 rounded-lg space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-orange-400" /> Данные учебного центра
          </h2>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Название центра</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2.5 rounded focus:outline-none focus:border-orange-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Телефон центра</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2.5 rounded focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Адрес центра</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2.5 rounded focus:outline-none focus:border-orange-500" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2 rounded transition-colors cursor-pointer">
                Сохранить изменения
              </button>
            </div>
          </form>
        </div>

        {/* Star Rules */}
        <div className="bg-[#1e293b] p-5 border border-slate-800 rounded-lg space-y-3 text-xs">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" /> Правила начисления звёзд
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-[#0f172a] p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Вовремя на урок</span>
              <p className="text-base font-bold text-orange-400 mt-1">+5 ⭐</p>
            </div>
            <div className="bg-[#0f172a] p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Выполнение ДЗ</span>
              <p className="text-base font-bold text-orange-400 mt-1">+5 ⭐</p>
            </div>
            <div className="bg-[#0f172a] p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Активность</span>
              <p className="text-base font-bold text-orange-400 mt-1">+10 ⭐</p>
            </div>
            <div className="bg-[#0f172a] p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Оценка 5</span>
              <p className="text-base font-bold text-orange-400 mt-1">+10 ⭐</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}