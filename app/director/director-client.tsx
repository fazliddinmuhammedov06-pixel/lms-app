'use client';

import React, { useState } from 'react';
import {
  Users, GraduationCap, Building, Calendar, DollarSign,
  AlertCircle, CheckCircle, Tag, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/app-layout';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { approveDiscountRequest, rejectDiscountRequest } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function DirectorDashboardClient({
  userName,
  userPhone,
  unreadCount,
  stats,
  initialRequests,
  teachers,
  recentEvents = [],
}: any) {
  const router = useRouter();
  const t = useTranslations('director');
  const tCommon = useTranslations('common');
  const [requests, setRequests] = useState<any[]>(initialRequests || []);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '3m' | '12m'>('30d');

  const handleResolve = async (id: string, approve: boolean) => {
    setLoadingId(id);
    try {
      if (approve) {
        await approveDiscountRequest(id);
        toast.success(t('approved'));
      } else {
        await rejectDiscountRequest(id);
        toast.error(t('rejected'));
      }
      setRequests((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || tCommon('error'));
    } finally {
      setLoadingId(null);
    }
  };

  const attTotal = (stats?.presentCount || 0) + (stats?.absentCount || 0) + (stats?.lateCount || 0);
  const attRate = attTotal > 0 ? Math.round(((stats?.presentCount || 0) / attTotal) * 100) : 100;

  return (
    <AppLayout role="DIRECTOR" userName={userName} userPhone={userPhone} unreadCount={unreadCount} title={t('dashboard')}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#1e293b] p-3.5 border border-slate-800 rounded-lg">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>{tCommon('students')}</span><Users className="w-4 h-4 text-blue-400" /></div>
          <p className="text-xl font-bold text-white">{stats?.totalStudents || 0}</p>
          <p className="text-[10px] text-emerald-400 mt-1">+{stats?.activeStudents || 0} {t('active')}</p>
        </div>
        <div className="bg-[#1e293b] p-3.5 border border-slate-800 rounded-lg">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>{tCommon('groups')}</span><Building className="w-4 h-4 text-orange-400" /></div>
          <p className="text-xl font-bold text-white">{stats?.activeGroups || 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">{t('fromTotal')} {stats?.totalGroups || 0}</p>
        </div>
        <div className="bg-[#1e293b] p-3.5 border border-slate-800 rounded-lg">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>{tCommon('teachers')}</span><GraduationCap className="w-4 h-4 text-purple-400" /></div>
          <p className="text-xl font-bold text-white">{stats?.teachersCount || 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">{t('instructors')}</p>
        </div>
        <div className="bg-[#1e293b] p-3.5 border border-slate-800 rounded-lg">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>{t('lessonsToday')}</span><Calendar className="w-4 h-4 text-amber-400" /></div>
          <p className="text-xl font-bold text-white">{stats?.lessonsToday || 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">{t('scheduled')}</p>
        </div>
        <div className="bg-[#1e293b] p-3.5 border border-slate-800 rounded-lg">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>{t('revenue')}</span><DollarSign className="w-4 h-4 text-emerald-400" /></div>
          <p className="text-lg font-bold text-emerald-400">{(stats?.monthlyRevenue || 0).toLocaleString()} UZS</p>
          <p className="text-[10px] text-slate-400 mt-1">{t('perMonth')}</p>
        </div>
        <div className="bg-[#1e293b] p-3.5 border border-slate-800 rounded-lg">
          <div className="flex justify-between text-slate-400 text-xs mb-1"><span>{t('debts')}</span><AlertCircle className="w-4 h-4 text-rose-400" /></div>
          <p className="text-lg font-bold text-rose-400">{(stats?.overdueDebts || 0).toLocaleString()} UZS</p>
          <p className="text-[10px] text-rose-400 mt-1">{t('overdue')}</p>
        </div>
      </div>
      {/* 2. ATTENDANCE & FINANCES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
        <div className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> {t('attendanceToday')}
            </h2>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{attRate}%</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#0f172a] p-2.5 rounded border border-slate-800"><p className="text-slate-400 text-[10px]">{t('present')}</p><p className="text-lg font-bold text-emerald-400 mt-0.5">{stats?.presentCount || 0}</p></div>
            <div className="bg-[#0f172a] p-2.5 rounded border border-slate-800"><p className="text-slate-400 text-[10px]">{t('absent')}</p><p className="text-lg font-bold text-rose-400 mt-0.5">{stats?.absentCount || 0}</p></div>
            <div className="bg-[#0f172a] p-2.5 rounded border border-slate-800"><p className="text-slate-400 text-[10px]">{t('late')}</p><p className="text-lg font-bold text-amber-400 mt-0.5">{stats?.lateCount || 0}</p></div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-400" /> {t('revenue')}
            </h2>
            <div className="flex bg-[#0f172a] p-0.5 rounded border border-slate-800 text-[10px]">
              {(['7d', '30d', '3m', '12m'] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${period === p ? 'bg-orange-500 text-white' : 'text-slate-400'}`}>
                  {p === '7d' ? `7 ${t('daysShort')}` : p === '30d' ? `30 ${t('daysShort')}` : p === '3m' ? `3 ${t('monthsShort')}` : `12 ${t('monthsShort')}`}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#0f172a] p-2.5 rounded border border-slate-800"><p className="text-slate-400 text-[10px]">{t('paid')}</p><p className="text-base font-bold text-emerald-400 mt-0.5">{(stats?.monthlyRevenue || 0).toLocaleString()} UZS</p></div>
            <div className="bg-[#0f172a] p-2.5 rounded border border-slate-800"><p className="text-slate-400 text-[10px]">{t('expected')}</p><p className="text-base font-bold text-amber-400 mt-0.5">{(stats?.expectedRevenue || 0).toLocaleString()} UZS</p></div>
            <div className="bg-[#0f172a] p-2.5 rounded border border-slate-800"><p className="text-slate-400 text-[10px]">{t('overdue')}</p><p className="text-base font-bold text-rose-400 mt-0.5">{(stats?.overdueDebts || 0).toLocaleString()} UZS</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-orange-400" /> {t('discountRequests')} ({requests.length})
          </h2>
          {requests.length === 0 ? (
            <EmptyState icon={Tag} title={t('noRequests')} description={t('noRequestsDesc')} />
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
                <div key={req.id} className="bg-[#0f172a] p-3 border border-slate-800 rounded flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={req.studentName} size={36} />
                    <div>
                      <h3 className="font-bold text-white">{req.studentName}</h3>
                      <p className="text-slate-400 text-[11px]">{t('parent')}: {req.parentName} ({req.parentPhone}) • {t('group')}: {req.groupName}</p>
                      <p className="text-orange-400 text-[10px] font-semibold mt-0.5">{t('discount')} {req.discountPercent}% ({req.starsCost} ⭐)</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleResolve(req.id, true)} disabled={loadingId === req.id} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer">{t('approve')}</button>
                    <button onClick={() => handleResolve(req.id, false)} disabled={loadingId === req.id} className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer">{t('reject')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> {tCommon('teachers')} ({teachers.length})
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {teachers.map((tItem: any) => (
              <div key={tItem.id} className="bg-[#0f172a] p-2.5 border border-slate-800 rounded text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{tItem.name}</p>
                  <p className="text-[10px] text-slate-400">{tItem.subject || t('subject')} • {tItem.phone}</p>
                </div>
                <span className="text-[10px] bg-slate-800 text-orange-400 px-2 py-0.5 rounded font-bold">{tItem.groups.length} {t('groupsCount')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
