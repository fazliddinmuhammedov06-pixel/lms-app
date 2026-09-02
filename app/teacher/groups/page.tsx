import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import GroupsClient from '@/app/director/groups/groups-client';

export default async function TeacherGroupsPage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;
  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
  if (!teacher) redirect('/');

  const dbGroups = await prisma.group.findMany({
    where: { teacherId: teacher.id },
    include: { teacher: { include: { user: true } }, students: true, lessons: true },
    orderBy: { createdAt: 'desc' },
  });

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

  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <GroupsClient
      role="TEACHER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      groups={groups}
      teachers={[{ id: teacher.id, name: user.name }]}
    />
  );
}