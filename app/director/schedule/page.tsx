import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ScheduleClient from './schedule-client';

export default async function DirectorSchedulePage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') redirect('/');

  const user = session.user as any;

  const dbLessons = await prisma.lesson.findMany({
    include: {
      group: {
        include: {
          teacher: { include: { user: true } },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  const dbGroups = await prisma.group.findMany({
    include: { teacher: { include: { user: true } } },
  });

  const daysOfWeekMap: Record<number, string> = {
    1: 'Понедельник',
    2: 'Вторник',
    3: 'Среда',
    4: 'Четверг',
    5: 'Пятница',
    6: 'Суббота',
    7: 'Воскресенье',
  };

  const lessons = dbLessons.map((l) => ({
    id: l.id,
    groupId: l.groupId,
    groupName: l.group.name,
    teacherName: l.group.teacher.user.name,
    subject: l.group.subject || 'Общий',
    dayOfWeek: l.dayOfWeek || 1,
    dayName: daysOfWeekMap[l.dayOfWeek || 1],
    startTime: l.startTime,
    endTime: l.endTime,
    room: l.room || l.group.room || 'Кабинет 101',
    status: l.status,
  }));

  const groupsList = dbGroups.map((g) => ({
    id: g.id,
    name: g.name,
    room: g.room || 'Кабинет 101',
  }));

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return (
    <ScheduleClient
      role="DIRECTOR"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      lessons={lessons}
      groups={groupsList}
    />
  );
}