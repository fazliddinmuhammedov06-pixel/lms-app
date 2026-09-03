'use client';
import { useState } from 'react';
import { getStudentLevel } from '@/lib/levels';
import { Award, Star, Gift, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CustomSelect } from '@/components/ui/custom-select';
import { createDiscountRequest } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function StudentClient({ initialStudents }: { initialStudents: any[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(initialStudents?.[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const student = initialStudents?.find((s: any) => s.id === selectedId) || initialStudents?.[0];
  if (!student) return <div className="text-white p-4">Нет учеников</div>;
  const lvl = getStudentLevel(student.totalStars || 0, student.currentBalance || 0);
  const rewards = [{ id: 'r1', name: 'Скидка 5%', pct: 5, cost: 250 }, { id: 'r2', name: 'Скидка 10%', pct: 10, cost: 450 }];
  const absences = student.absences || [];
  const transactions = student.transactions || [];

  const handleRedeem = async (r: any) => {
    if (student.currentBalance < r.cost) return toast.error('Недостаточно звезд');
    setLoading(true);
    try {
      await createDiscountRequest(student.id, r.pct, r.cost);
      toast.success('Заявка отправлена!');
      router.refresh();
    } catch (err: any) { toast.error(err.message || 'Ошибка'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 text-[#f8fafc] text-xs">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center bg-[#1e293b]/45 p-3 border border-slate-800">
          <div className="flex items-center gap-2"><Award className="w-8 h-8 text-purple-400" /><div><h1 className="font-bold text-sm">Кабинет ученика</h1><p className="text-[10px] text-slate-400">Friday Education</p></div></div>
          {initialStudents.length > 1 && <CustomSelect value={selectedId} onChange={(val: string | null) => val && setSelectedId(val)} options={initialStudents.map((s: any) => ({ value: s.id, label: s.name }))} className="w-[150px] text-slate-900" />}
        </div>
        <div className="bg-[#1e293b] p-4 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2"><Avatar name={student.name} size={36} /><div><h2 className="font-bold text-sm">{student.name}</h2><p className="text-[10px] text-orange-400">Уровень {lvl.level}: {lvl.levelName}</p></div></div>
            <div className="text-right"><p className="font-bold text-orange-400 flex items-center justify-end"><Star className="w-3.5 h-3.5 fill-orange-400" /> {student.currentBalance}</p></div>
          </div>
          <ProgressBar value={lvl.progressPercent} className="h-1.5" />
        </div>
        <div className="bg-[#1e293b] p-4 border border-slate-800">
          <h2 className="font-bold mb-3 flex items-center gap-1 text-sm"><Gift className="w-3.5 h-3.5 text-orange-400" /> Награды</h2>
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((r) => {
              const av = student.currentBalance >= r.cost;
              return (
                <div key={r.id} className={`border p-3 flex flex-col justify-between ${av ? 'border-orange-500/30 bg-[#0f172a]' : 'border-slate-800 opacity-60 bg-[#0f172a]/50'}`}>
                  <div><h3 className="font-bold text-slate-100">{r.name}</h3></div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 mt-2">
                    <span className="font-bold text-orange-400">{r.cost} ⭐</span>
                    <button onClick={() => handleRedeem(r)} disabled={!av || loading} className="px-2 py-1 rounded cursor-pointer font-bold bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[10px]">Обменять</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] p-3 border border-slate-800">
            <h2 className="font-bold mb-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Пропуски</h2>
            {absences.length === 0 ? <p className="text-slate-400">Пропусков нет! 🎉</p> : (
              <div className="space-y-1">
                {absences.map((ab: any, idx: number) => (
                  <div key={idx} className="bg-[#0f172a] p-2 border border-slate-800 flex justify-between text-[11px]">{ab.groupName} <span className="text-rose-400 font-bold">{ab.date}</span></div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-[#1e293b] p-3 border border-slate-800">
            <h2 className="font-bold mb-2 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-orange-400" /> История звёзд</h2>
            {transactions.length === 0 ? <p className="text-slate-400">История пуста</p> : (
              <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                {transactions.map((t: any) => (
                  <div key={t.id} className="bg-[#0f172a] p-1 border border-slate-800 flex justify-between items-center text-[10px]">
                    <div><p className="font-bold text-slate-200">{t.reason}</p><p className="text-[9px] text-slate-500">{t.date}</p></div>
                    <span className={`font-bold ${t.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{t.amount > 0 ? `+${t.amount}` : t.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
