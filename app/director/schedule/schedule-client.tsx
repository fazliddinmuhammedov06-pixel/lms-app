'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar, Plus, Clock, MapPin, User } from 'lucide-react';
import { AddLessonModal } from './add-lesson-modal';

export default function ScheduleClient({
  role, userName, userPhone, unreadCount, lessons, groups,
}: any) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const days = [
    { id: 1, name: 'Пн' },
    { id: 2, name: 'Вт' },
    { id: 3, name: 'Ср' },
    { id: 4, name: 'Чт' },
    { id: 5, name: 'Пт' },
    { id: 6, name: 'Сб' },
    { id: 7, name: 'Вс' },
  ];

  const dayLessons = lessons.filter((l: any) => l.dayOfWeek === selectedDay);

  return (
    <AppLayout role={role} userName={userName} userPhone={userPhone} unreadCount={unreadCount} title="Расписание Занятий">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1e293b] p-4 border border-slate-800 rounded-lg">
        <div className="flex bg-[#0f172a] p-1 rounded border border-slate-800 text-xs w-full sm:w-auto overflow-x-auto">
          {days.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                selectedDay === d.id ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {(role === 'DIRECTOR' || role === 'MANAGER') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /><span>+ Добавить занятие</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {dayLessons.length === 0 ? (
          <div className="bg-[#1e293b] p-8 border border-slate-800 rounded-lg text-center">
            <EmptyState icon={Calendar} title="Нет занятий в этот день" description="Добавьте новое занятие в расписание." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dayLessons.map((l: any) => (
              <div key={l.id} className="bg-[#1e293b] p-4 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-sm">{l.groupName}</h3>
                    <p className="text-orange-400 text-xs font-semibold">{l.subject}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {l.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-white">{l.startTime} - {l.endTime}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>Учитель: <strong className="text-slate-200">{l.teacherName}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Кабинет: <span className="text-slate-400">{l.room}</span></span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && <AddLessonModal groups={groups} onClose={() => setIsModalOpen(false)} />}
    </AppLayout>
  );
}