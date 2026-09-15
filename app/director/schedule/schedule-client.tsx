'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar, Plus, Clock, MapPin, User, Trash2, X } from 'lucide-react';
import { AddLessonModal } from './add-lesson-modal';
import { deleteLesson } from '@/app/actions';
import { toast } from 'sonner';

export default function ScheduleClient({
  role, userName, userPhone, unreadCount, lessons, groups,
}: any) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLesson(lessonToDelete.id);
      toast.success('Занятие успешно удалено из расписания');
      setLessonToDelete(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка при удалении занятия');
    } finally {
      setIsDeleting(false);
    }
  };

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
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {l.status}
                    </span>
                    {(role === 'DIRECTOR' || role === 'MANAGER' || role === 'TEACHER') && (
                      <button
                        type="button"
                        onClick={() => setLessonToDelete(l)}
                        title="Удалить занятие"
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
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

      {/* Confirmation Modal for Lesson Deletion */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1e293b] border border-slate-800 rounded-lg w-full max-w-sm p-5 space-y-4 relative text-xs shadow-xl">
            <button
              onClick={() => setLessonToDelete(null)}
              disabled={isDeleting}
              className="absolute top-3 right-3 text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Удаление занятия</h2>
                <p className="text-slate-400 text-[11px]">{lessonToDelete.groupName}</p>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-700/60 rounded p-3 space-y-1.5 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white">{lessonToDelete.startTime} - {lessonToDelete.endTime}</span>
              </p>
              <p className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Учитель: <strong className="text-slate-200">{lessonToDelete.teacherName}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Кабинет: <span className="text-slate-400">{lessonToDelete.room}</span></span>
              </p>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Вы уверены, что хотите удалить это занятие из расписания? Это действие нельзя отменить.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLessonToDelete(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold cursor-pointer disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDeleteLesson}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Удаление...' : 'Удалить занятие'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}