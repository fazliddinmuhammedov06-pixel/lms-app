'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { CustomSelect } from '@/components/ui/custom-select';

interface Lesson {
  id: string;
  groupId: string;
  groupName: string;
  teacherName: string;
  subject: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  room: string;
  status: string;
}

interface Student {
  id: string;
  name: string;
  groupName: string | null;
  lessons: Lesson[];
}

interface Props {
  role: string;
  userName: string;
  userPhone: string;
  unreadCount: number;
  students: Student[];
}

export default function ScheduleClient({
  role,
  userName,
  userPhone,
  unreadCount,
  students,
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
        title="Расписание"
      >
        <div className="bg-[#1e293b] p-6 border border-slate-800 rounded-lg text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Вы пока не записаны в группу. Обратитесь к администрации.</p>
        </div>
      </AppLayout>
    );
  }

  // Group lessons by day
  const lessonsByDay: Record<number, Lesson[]> = {};
  for (let i = 1; i <= 7; i++) {
    lessonsByDay[i] = [];
  }

  selectedStudent.lessons.forEach((lesson) => {
    lessonsByDay[lesson.dayOfWeek].push(lesson);
  });

  return (
    <AppLayout
      role={role}
      userName={userName}
      userPhone={userPhone}
      unreadCount={unreadCount}
      title="Расписание"
    >
      <div className="space-y-4">
        {/* Student selector */}
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

        {/* Group info */}
        {selectedStudent.groupName && (
          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 p-4 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-orange-400">
              <BookOpen className="w-5 h-5" />
              <span className="font-bold text-sm">
                Группа: {selectedStudent.groupName}
              </span>
            </div>
          </div>
        )}

        {/* Schedule grid */}
        {selectedStudent.lessons.length === 0 ? (
          <div className="bg-[#1e293b] p-6 border border-slate-800 rounded-lg text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Расписание для вашей группы пока не добавлено.</p>
            <p className="text-xs mt-2">Скоро здесь появится расписание занятий.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const dayLessons = lessonsByDay[day];
              if (dayLessons.length === 0) return null;

              return (
                <div key={day} className="bg-[#1e293b] border border-slate-800 rounded-lg overflow-hidden">
                  <div className="bg-[#0f172a] px-4 py-2.5 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      {dayLessons[0].dayName}
                    </h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {dayLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="bg-[#0f172a] border border-slate-800 p-3 rounded-lg hover:border-orange-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 text-orange-400">
                              <Clock className="w-4 h-4" />
                              <span className="font-bold text-sm">
                                {lesson.startTime} - {lesson.endTime}
                              </span>
                            </div>
                            <div className="text-white font-semibold text-sm">
                              {lesson.subject}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                              <User className="w-3.5 h-3.5" />
                              <span>Преподаватель: {lesson.teacherName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{lesson.room}</span>
                            </div>
                          </div>
                          {lesson.status === 'CANCELLED' && (
                            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/40">
                              Отменено
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
