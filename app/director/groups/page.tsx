import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import GroupsClient from './groups-client';

export default async function DirectorGroupsPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') redirect('/');

  const user = session.user as any;

  const dbGroups = await prisma.group.findMany({
    include: {
      teacher: { include: { user: true } },
      students: true,
      lessons: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const dbTeachers = await prisma.teacher.findMany({
    include: { user: true },
  });

  const groups = dbGroups.map((g) => ({
    id: g.id,
    name: g.name,
    subject: g.subject || 'Английский язык',
    level: g.level || 'A1 Beginner',
    teacherName: g.teacher.user.name,
    teacherId: g.teacherId,
    room: g.room || 'Кабинет 101',
    monthlyPrice: g.monthlyPrice,
    status: g.status,
    studentsCount: g.students.length,
    lessonsCount: g.lessons.length,
  }));

  const teachersList = dbTeachers.map((t) => ({
    id: t.id,
    name: t.user.name,
  }));

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return (
    <GroupsClient
      role="DIRECTOR"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      groups={groups}
      teachers={teachersList}
    />
  );
}