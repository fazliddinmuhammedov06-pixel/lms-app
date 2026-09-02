'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Award, Plus, Star, Gift } from 'lucide-react';
import { AddRewardModal } from './add-reward-modal';

export default function DirectorRewardsClient({
  role, userName, userPhone, unreadCount, rewards,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Управление Магазином Наград">
      <div className="flex items-center justify-between bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Gift className="w-4 h-4 text-orange-400" /> Витрина магазина наград ({rewards.length})
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Управляйте товарами, доступными ученикам за звёзды.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" /><span>+ Добавить товар</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rewards.length === 0 ? (
          <div className="col-span-full bg-[#1e293b] p-8 border border-slate-800 rounded-lg">
            <EmptyState icon={Award} title="Магазин пуст" description="Добавьте первые товары за звёзды." />
          </div>
        ) : (
          rewards.map((r: any) => (
            <div key={r.id} className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-sm">{r.name}</h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {r.discountPercent > 0 ? `-${r.discountPercent}%` : 'Товар'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">{r.description || 'Без описания'}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Стоимость:</span>
                <span className="font-bold text-orange-400 text-sm flex items-center gap-1">
                  <Star className="w-4 h-4 fill-orange-400" /> {r.starsCost} ⭐
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && <AddRewardModal onClose={() => setIsModalOpen(false)} />}
    </AppLayout>
  );
}