'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { ShoppingBag, Award, Sparkles, Tag, Gift } from 'lucide-react';
import { CustomSelect } from '@/components/ui/custom-select';

interface Reward {
  id: string;
  name: string;
  description: string;
  starsCost: number;
  discountPercent: number;
}

interface Student {
  id: string;
  name: string;
  stars: number;
}

interface Props {
  role: string;
  userName: string;
  userPhone: string;
  unreadCount: number;
  students: Student[];
  rewards: Reward[];
}

export default function StoreClient({
  role,
  userName,
  userPhone,
  unreadCount,
  students,
  rewards,
}: Props) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  if (!selectedStudent) {
    return (
      <AppLayout
        role={role}
        userName={userName}
        userPhone={userPhone}
        unreadCount={unreadCount}
        title="Магазин наград"
      >
        <div className="bg-[#1e293b] p-6 border border-slate-800 rounded-lg text-center text-slate-400">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Вы пока не записаны в группу. Обратитесь к администрации.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      role={role}
      userName={userName}
      userPhone={userPhone}
      unreadCount={unreadCount}
      title="Магазин наград"
    >
      <div className="space-y-4">
        {students.length > 1 && (
          <div className="flex items-center justify-between bg-[#1e293b] p-3 border border-slate-800 rounded-lg">
            <span className="text-slate-300 text-sm font-medium">Ученик:</span>
            <CustomSelect
              value={selectedStudentId}
              onChange={(v: string | null) => v && setSelectedStudentId(v)}
              options={students.map((s) => ({ value: s.id, label: s.name }))}
              className="w-[200px] text-slate-900"
            />
          </div>
        )}

        <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/40 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-400 mb-1">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase">Ваш баланс</span>
              </div>
              <div className="text-3xl font-bold text-white">⭐ {selectedStudent.stars}</div>
            </div>
            <Gift className="w-12 h-12 text-orange-400 opacity-30" />
          </div>
        </div>

        {rewards.length === 0 ? (
          <div className="bg-[#1e293b] p-6 border border-slate-800 rounded-lg text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Награды пока не добавлены.</p>
            <p className="text-xs mt-2">Скоро здесь появятся интересные награды!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rewards.map((reward) => {
              const canAfford = selectedStudent.stars >= reward.starsCost;

              return (
                <div
                  key={reward.id}
                  className={`bg-[#1e293b] border rounded-lg overflow-hidden transition-all ${
                    canAfford ? 'border-orange-500/40 hover:border-orange-500/60' : 'border-slate-800 opacity-70'
                  }`}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className={`w-5 h-5 ${canAfford ? 'text-orange-400' : 'text-slate-500'}`} />
                          <h3 className="text-sm font-bold text-white">{reward.name}</h3>
                        </div>
                        <p className="text-xs text-slate-400">{reward.description}</p>
                      </div>
                    </div>

                    {reward.discountPercent > 0 && (
                      <div className="bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 rounded inline-flex items-center gap-1">
                        <Tag className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">Скидка {reward.discountPercent}%</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-1">
                        <Sparkles className={`w-4 h-4 ${canAfford ? 'text-orange-400' : 'text-slate-500'}`} />
                        <span className={`text-lg font-bold ${canAfford ? 'text-orange-400' : 'text-slate-500'}`}>
                          {reward.starsCost} ⭐
                        </span>
                      </div>
                      <button
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                          canAfford ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Обменять' : 'Недостаточно'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 Обратитесь к администрации или учителю для обмена звёзд на награды.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
