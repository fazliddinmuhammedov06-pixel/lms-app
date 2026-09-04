'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/custom-select';
import { Avatar } from '@/components/ui/avatar';
import { markAttendance, addStars } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function TeacherClient({
  role, userName, userPhone, unreadCount, groups,
}: any) {
  const router = useRouter();
  const t = useTranslations('teacher');
  const tCommon = useTranslations('common');
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const currentGroup = groups.find((g: any) => g.id === selectedGroupId);
  const students = currentGroup?.students || [];
  const sortedStudents = [...students].sort((a: any, b: any) => b.totalStars - a.totalStars);
  const groupOptions = groups.map((g: any) => ({ value: g.id, label: `${g.name} — ${t('today')}` }));

  const handleAttendanceClick = async (studentId: string, status: any) => {
    if (!currentGroup?.lessonId) return toast.error(t('noLessonsToday'));
    setLoadingId(studentId);
    try {
      await markAttendance(studentId, currentGroup.lessonId, new Date().toISOString(), status);
      toast.success(t('attendanceSaved'));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || tCommon('error'));
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddStarsClick = async (studentId: string, amount: number) => {
    setLoadingId(studentId);
    try {
      await addStars(studentId, amount, `+${amount}`);
      toast.success(`+${amount} ⭐`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || tCommon('error'));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AppLayout role={role || 'TEACHER'} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title={t('dashboard')}>
      <div className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-400" /> {t('selectGroup')}
        </label>
        {groupOptions.length === 0 ? (
          <p className="text-slate-500 text-xs">{t('noGroups')}</p>
        ) : (
          <CustomSelect
            value={selectedGroupId}
            onChange={(val: any) => val && setSelectedGroupId(val)}
            options={groupOptions}
            className="max-w-md text-slate-900 text-xs"
          />
        )}
      </div>

      <div className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-3">
        <h2 className="text-sm font-bold text-white">{t('studentsCount', { count: sortedStudents.length })}</h2>
        <div className="space-y-2">
          {sortedStudents.map((st: any) => (
            <div key={st.id} className="bg-[#0f172a] p-3 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Avatar name={st.name} size={36} />
                <div>
                  <h3 className="font-bold text-white text-xs">{st.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                    <span className="text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 border border-orange-500/20 rounded">⭐ {t('totalStars')}: {st.totalStars}</span>
                    <span className="text-slate-400">{t('balance')}: {st.currentBalance}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  {[
                    { s: 'PRESENT', l: t('present'), c: 'bg-emerald-600' },
                    { s: 'ABSENT', l: t('absent'), c: 'bg-rose-600' },
                    { s: 'LATE', l: t('late'), c: 'bg-amber-600' },
                  ].map((opt) => (
                    <button
                      key={opt.s}
                      disabled={loadingId === st.id}
                      onClick={() => handleAttendanceClick(st.id, opt.s)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                        st.attendance === opt.s ? opt.c + ' text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1">
                  <button
                    disabled={loadingId === st.id}
                    onClick={() => handleAddStarsClick(st.id, 5)}
                    className="bg-orange-500 hover:bg-orange-400 text-white px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> +5 ⭐
                  </button>
                  <button
                    disabled={loadingId === st.id}
                    onClick={() => handleAddStarsClick(st.id, 10)}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> +10 ⭐
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
