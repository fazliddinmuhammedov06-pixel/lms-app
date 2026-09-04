'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Trophy, Star, Award, TrendingUp, TrendingDown, Minus, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { CustomSelect } from '@/components/ui/custom-select';
import { useTranslations } from 'next-intl';

interface Props {
  role: string;
  userName: string;
  userPhone: string;
  unreadCount: number;
  studentsList: { id: string; name: string }[];
  selectedStudentId: string;
  leaderboard: any[];
  profileRating: any;
  achievements: any[];
}

export default function RatingClient({
  role, userName, userPhone, unreadCount, studentsList, selectedStudentId, leaderboard, profileRating, achievements,
}: Props) {
  const t = useTranslations('ratingPage');
  const [tab, setTab] = useState<'leaderboard' | 'achievements'>('leaderboard');
  const top3 = leaderboard.slice(0, 3);

  const renderBadge = (r: number) => {
    if (r === 1) return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold text-[11px]">{t('place1')}</span>;
    if (r === 2) return <span className="bg-slate-300/20 text-slate-200 border border-slate-400/40 px-1.5 py-0.5 rounded font-bold text-[11px]">{t('place2')}</span>;
    if (r === 3) return <span className="bg-amber-700/20 text-amber-400 border border-amber-700/40 px-1.5 py-0.5 rounded font-bold text-[11px]">{t('place3')}</span>;
    return <span className="font-bold text-slate-400 text-xs">#{r}</span>;
  };

  const renderDyn = (c: number) => {
    if (c > 0) return <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"><TrendingUp className="w-3 h-3"/> ↑ +{c} {t('positionsWeek')}</span>;
    if (c < 0) return <span className="text-rose-400 text-[10px] font-bold bg-rose-500/10 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"><TrendingDown className="w-3 h-3"/> ↓ {c} {t('positionsWeek')}</span>;
    return <span className="text-slate-400 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"><Minus className="w-3 h-3"/> — {t('noChange')}</span>;
  };

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title={t('title')}>
      <div className="space-y-4 text-xs">
        {studentsList && studentsList.length > 1 && (
          <div className="flex items-center justify-between bg-[#1e293b] p-2.5 border border-slate-800">
            <span className="text-slate-300">{t('student')}</span>
            <CustomSelect
              value={selectedStudentId}
              onChange={(v: string | null) => v && (window.location.href = `/student/rating?studentId=${v}`)}
              options={studentsList.map((s) => ({ value: s.id, label: s.name }))}
              className="w-[180px] text-slate-900"
            />
          </div>
        )}

        {profileRating && (
          <div className="bg-[#1e293b] p-3.5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Avatar name={userName} size={36} />
                <div>
                  <h2 className="text-xs font-bold text-white flex items-center gap-1.5">{userName} <span className="bg-orange-500/20 text-orange-400 text-[9px] px-1.5 py-0.5 rounded">{t('myProfile')}</span></h2>
                  <p className="text-[10px] text-slate-400">{t('progress')}</p>
                </div>
              </div>
              {renderDyn(profileRating.change)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-[#0f172a] p-2 border border-slate-800 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-orange-400 shrink-0" />
                <div><span className="text-[10px] text-slate-400 block">Место</span><span className="font-bold text-white">🏆 #{profileRating.rank} <span className="text-[10px] text-slate-400">из {profileRating.totalStudents}</span></span></div>
              </div>
              <div className="bg-[#0f172a] p-2 border border-slate-800 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <div><span className="text-[10px] text-slate-400 block">Звёзды</span><span className="font-bold text-orange-400">⭐ {profileRating.stars}</span></div>
              </div>
              <div className="bg-[#0f172a] p-2 border border-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <div><span className="text-[10px] text-slate-400 block">До ученика выше</span>{profileRating.rank === 1 ? <span className="font-bold text-emerald-400">Вы на 1 месте! 🥇</span> : <span className="font-bold text-slate-200">До #{profileRating.nextRankNumber}: <strong className="text-orange-400">{profileRating.starsToNextRank} ⭐</strong></span>}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button onClick={() => setTab('leaderboard')} className={`px-3 py-1 rounded font-bold flex items-center gap-1 cursor-pointer ${tab === 'leaderboard' ? 'bg-orange-500 text-white' : 'bg-[#1e293b] text-slate-400'}`}><Trophy className="w-3.5 h-3.5"/> Рейтинг</button>
          <button onClick={() => setTab('achievements')} className={`px-3 py-1 rounded font-bold flex items-center gap-1 cursor-pointer ${tab === 'achievements' ? 'bg-orange-500 text-white' : 'bg-[#1e293b] text-slate-400'}`}><Award className="w-3.5 h-3.5"/> Достижения</button>
        </div>

        {tab === 'leaderboard' && (
          <div className="space-y-3">
            {top3.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {top3.map((st: any) => (
                  <div key={st.id} className={`p-2.5 border flex flex-col items-center text-center bg-[#1e293b] ${st.isCurrentStudent ? 'border-orange-500' : 'border-slate-800'}`}>
                    <div className="mb-1">{renderBadge(st.rank)}</div>
                    <Avatar name={st.name} size={32} />
                    <h3 className="font-bold text-white text-xs mt-1">{st.name}</h3>
                    <span className="text-[10px] text-slate-400">{st.groupName}</span>
                    <div className="mt-1 font-bold text-orange-400 text-xs">⭐ {st.stars}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-[#1e293b] border border-slate-800 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-slate-400 uppercase text-[9px] border-b border-slate-800">
                    <th className="p-2 text-center w-10">{t('place')}</th>
                    <th className="p-2">{t('student')}</th>
                    <th className="p-2">{t('group')}</th>
                    <th className="p-2 text-center">{t('dynamics')}</th>
                    <th className="p-2 text-right">{t('stars')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {leaderboard.map((st: any) => (
                    <tr key={st.id} className={st.isCurrentStudent ? 'bg-orange-500/10 font-bold border-l-2 border-l-orange-500' : 'hover:bg-slate-800/40'}>
                      <td className="p-2 text-center">{renderBadge(st.rank)}</td>
                      <td className="p-2"><div className="flex items-center gap-1.5"><Avatar name={st.name} size={22}/><span className={st.isCurrentStudent ? 'text-orange-400 font-bold' : 'text-white'}>{st.name}</span></div></td>
                      <td className="p-2 text-slate-400">{st.groupName}</td>
                      <td className="p-2 text-center">{renderDyn(st.change)}</td>
                      <td className="p-2 text-right font-bold text-orange-400">⭐ {st.stars}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'achievements' && (
          <div className="bg-[#1e293b] border border-slate-800 p-3.5 space-y-3">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5"><Award className="w-4 h-4 text-orange-400"/> {t('achievements')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {achievements.map((ach: any) => (
                <div key={ach.id} className={`p-2.5 border flex items-start gap-2 ${ach.unlocked ? 'bg-[#0f172a] border-orange-500/30' : 'bg-[#0f172a]/50 border-slate-800 opacity-60'}`}>
                  <div className="w-7 h-7 rounded flex items-center justify-center text-base shrink-0 bg-slate-800">{ach.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><h4 className="font-bold text-white text-xs truncate">{ach.title}</h4>{ach.unlocked ? <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5"/> {t('opened')}</span> : <span className="text-[9px] text-slate-400 bg-slate-800 px-1 py-0.5 rounded flex items-center gap-0.5"><Lock className="w-2.5 h-2.5"/> {t('closed')}</span>}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ach.description}</p>
                    <div className="mt-1 text-[9px] text-slate-400 flex justify-between"><span>{t('progressLabel')}</span><span className={ach.unlocked ? 'text-orange-400 font-bold' : 'text-slate-400'}>{ach.progressText}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
