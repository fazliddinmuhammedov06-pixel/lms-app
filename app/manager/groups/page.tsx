import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import GroupsClient from '@/app/director/groups/groups-client';

export default async function ManagerGroupsPage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;

  // Только MANAGER и DIRECTOR имеют доступ к этой странице
  if (user.role !== 'MANAGER' && user.role !== 'DIRECTOR') {
    redirect('/');
  }

  const dbGroups = await prisma.group.findMany({
    include: { teacher: { include: { user: true } }, students: true, lessons: true },
    orderBy: { createdAt: 'desc' },
  });

  const dbTeachers = await prisma.teacher.findMany({ include: { user: true } });

  const groups = dbGroups.map((g) => ({
    id: g.id,
    name: g.name,
    subject: g.subject || 'Английский',
    level: g.level || 'A1',
    teacherName: g.teacher.user.name,
    room: g.room || 'Кабинет 101',
    monthlyPrice: g.monthlyPrice,
    status: g.status,
    studentsCount: g.students.length,
    lessonsCount: g.lessons.length,
  }));

  const teachersList = dbTeachers.map((t) => ({ id: t.id, name: t.user.name }));
  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <GroupsClient
      role="MANAGER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      groups={groups}
      teachers={teachersList}
    />
  );
}