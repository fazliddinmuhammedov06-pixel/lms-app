import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ScheduleClient from '@/app/director/schedule/schedule-client';

export default async function TeacherSchedulePage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;
  if (user.role !== 'TEACHER') redirect('/');

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
  if (!teacher) redirect('/');

  const dbLessons = await prisma.lesson.findMany({
    where: { group: { teacherId: teacher.id } },
    include: { group: { include: { teacher: { include: { user: true } } } } },
    orderBy: { startTime: 'asc' },
  });

  const dbGroups = await prisma.group.findMany({ where: { teacherId: teacher.id } });

  const lessons = dbLessons.map((l) => ({
    id: l.id,
    groupId: l.groupId,
    groupName: l.group.name,
    teacherName: user.name,
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
      role="TEACHER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      lessons={lessons}
      groups={groupsList}
    />
  );
}