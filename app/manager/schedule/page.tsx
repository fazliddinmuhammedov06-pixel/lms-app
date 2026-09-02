import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ScheduleClient from '@/app/director/schedule/schedule-client';

export default async function ManagerSchedulePage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;

  if (user.role !== 'MANAGER' && user.role !== 'DIRECTOR') {
    redirect('/');
  }

  const dbLessons = await prisma.lesson.findMany({
    include: { group: { include: { teacher: { include: { user: true } } } } },
    orderBy: { startTime: 'asc' },
  });

  const dbGroups = await prisma.group.findMany({ include: { teacher: { include: { user: true } } } });

  const lessons = dbLessons.map((l) => ({
    id: l.id,
    groupId: l.groupId,
    groupName: l.group.name,
    teacherName: l.group.teacher.user.name,
    subject: l.group.subject || 'Общий',
    dayOfWeek: l.dayOfWeek || 1,
    startTime: l.startTime,
    endTime: l.endTime,
    room: l.room || 'Кабинет 101',
    status: l.status,
  }));

  const groupsList = dbGroups.map((g) => ({ id: g.id, name: g.name, room: g.room || 'Кабинет 101' }));
  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <ScheduleClient
      role="MANAGER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      lessons={lessons}
      groups={groupsList}
    />
  );
}