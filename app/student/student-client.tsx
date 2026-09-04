'use client';
import { useState } from 'react';
import { getStudentLevel } from '@/lib/levels';
import { Award, Star, Gift, AlertTriangle, Trophy, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CustomSelect } from '@/components/ui/custom-select';
import { createDiscountRequest } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function StudentClient({ initialStudents }: { initialStudents: any[] }) {
  const router = useRouter();
  const t = useTranslations('student');
  const tCommon = useTranslations('common');
  const [selectedId, setSelectedId] = useState(initialStudents?.[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const student = initialStudents?.find((s: any) => s.id === selectedId) || initialStudents?.[0];
  if (!student) return <div className="text-white p-4">{t('noStudents')}</div>;
  const lvl = getStudentLevel(student.totalStars || 0, student.currentBalance || 0);
  const rating = student.ratingInfo;
  const rewards = [
    { id: 'r1', name: t('discount5'), pct: 5, cost: 250 },
    { id: 'r2', name: t('discount10'), pct: 10, cost: 450 }
  ];
  const absences = student.absences || [];
  const transactions = student.transactions || [];

  const handleRedeem = async (r: any) => {
    if (student.currentBalance < r.cost) return toast.error(t('insufficientStars'));
    setLoading(true);
    try {
      await createDiscountRequest(student.id, r.pct, r.cost);
      toast.success(t('requestSent'));
      router.refresh();
    } catch (err: any) { toast.error(err.message || tCommon('error')); }
    finally { setLoading(false); }
  };

  const renderDynamics = (c: number) => {
    if (c > 0) return <span className="text-emerald-400 font-bold flex items-center gap-0.5"><TrendingUp className="w-3 h-3"/> ↑ +{c} {t('positionsWeek')}</span>;
    if (c < 0) return <span className="text-rose-400 font-bold flex items-center gap-0.5"><TrendingDown className="w-3 h-3"/> ↓ {c} {t('positionsWeek')}</span>;
    return <span className="text-slate-400 flex items-center gap-0.5"><Minus className="w-3 h-3"/> — {t('noChange')}</span>;
  };

  return (
    <div className="space-y-4 text-xs">
      {initialStudents.length > 1 && (
        <div className="flex items-center justify-between bg-[#1e293b] p-2.5 border border-slate-800">
          <span className="text-slate-300">{t('selectStudent')}</span>
          <CustomSelect value={selectedId} onChange={(val: string | null) => val && setSelectedId(val)} options={initialStudents.map((s: any) => ({ value: s.id, label: s.name }))} className="w-[150px] text-slate-900" />
        </div>
      )}
        <div className="bg-[#1e293b] p-4 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2"><Avatar name={student.name} size={36} /><div><h2 className="font-bold text-sm">{student.name}</h2><p className="text-[10px] text-orange-400">{t('level')} {lvl.level}: {lvl.levelName}</p></div></div>
            <div className="text-right"><p className="font-bold text-orange-400 flex items-center justify-end"><Star className="w-3.5 h-3.5 fill-orange-400" /> {student.currentBalance}</p></div>
          </div>
          <ProgressBar value={lvl.progressPercent} className="h-1.5" />
        </div>

        {rating && (
          <div className="bg-[#1e293b] p-3.5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm flex items-center gap-1.5"><Trophy className="w-4 h-4 text-orange-400" /> {t('ratingTitle')}</h2>
              <Link href={`/student/rating?studentId=${student.id}`} className="text-orange-400 font-semibold hover:underline flex items-center gap-0.5 text-[11px]">
                {t('allRating')} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-[#0f172a] p-2 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">{t('rank')}</span>
                <span className="font-bold text-white text-xs">🏆 #{rating.rank}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{t('stars')}</span>
                <span className="font-bold text-orange-400 text-xs">⭐ {rating.stars}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{t('toNextRank', { rank: rating.nextRankNumber || 1 })}</span>
                <span className="font-bold text-slate-200 text-xs">{rating.rank === 1 ? '🥇 Top 1' : `${rating.starsToNextRank} ⭐`}</span>
              </div>
            </div>
            <div className="text-[10px]">
              {renderDynamics(rating.change)}
            </div>
          </div>
        )}
        <div className="bg-[#1e293b] p-4 border border-slate-800">
          <h2 className="font-bold mb-3 flex items-center gap-1 text-sm"><Gift className="w-3.5 h-3.5 text-orange-400" /> {t('rewards')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((r) => {
              const av = student.currentBalance >= r.cost;
              return (
                <div key={r.id} className={`border p-3 flex flex-col justify-between ${av ? 'border-orange-500/30 bg-[#0f172a]' : 'border-slate-800 opacity-60 bg-[#0f172a]/50'}`}>
                  <div><h3 className="font-bold text-slate-100">{r.name}</h3></div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 mt-2">
                    <span className="font-bold text-orange-400">{r.cost} ⭐</span>
                    <button onClick={() => handleRedeem(r)} disabled={!av || loading} className="px-2 py-1 rounded cursor-pointer font-bold bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[10px]">{t('exchange')}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] p-3 border border-slate-800">
            <h2 className="font-bold mb-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {t('absences')}</h2>
            {absences.length === 0 ? <p className="text-slate-400">{t('noAbsences')} 🎉</p> : (
              <div className="space-y-1">
                {absences.map((ab: any, idx: number) => (
                  <div key={idx} className="bg-[#0f172a] p-2 border border-slate-800 flex justify-between text-[11px]">{ab.groupName} <span className="text-rose-400 font-bold">{ab.date}</span></div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-[#1e293b] p-3 border border-slate-800">
            <h2 className="font-bold mb-2 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-orange-400" /> {t('starsHistory')}</h2>
            {transactions.length === 0 ? <p className="text-slate-400">{t('emptyHistory')}</p> : (
              <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                {transactions.map((tItem: any) => (
                  <div key={tItem.id} className="bg-[#0f172a] p-1 border border-slate-800 flex justify-between items-center text-[10px]">
                    <div><p className="font-bold text-slate-200">{tItem.reason}</p><p className="text-[9px] text-slate-500">{tItem.date}</p></div>
                    <span className={`font-bold ${tItem.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{tItem.amount > 0 ? `+${tItem.amount}` : tItem.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
