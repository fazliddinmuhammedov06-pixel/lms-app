import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TeacherHomeworkClient from './teacher-homework-client';

export default async function TeacherHomeworkPage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;
  if (user.role !== 'TEACHER') redirect('/');

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
  if (!teacher) redirect('/');

  const dbGroups = await prisma.group.findMany({
    where: { teacherId: teacher.id },
    select: { id: true, name: true },
  });

  const dbHomeworks = await prisma.homework.findMany({
    where: { group: { teacherId: teacher.id } },
    include: { group: true, submissions: { include: { student: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const homeworks = dbHomeworks.map((hw) => ({
    id: hw.id,
    title: hw.title,
    description: hw.description,
    groupName: hw.group.name,
    deadline: new Date(hw.deadline).toLocaleDateString('ru-RU'),
    submissionsCount: hw.submissions.length,
  }));

  const groupsList = dbGroups.map((g) => ({ id: g.id, name: g.name }));
  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <TeacherHomeworkClient
      role="TEACHER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      homeworks={homeworks}
      groups={groupsList}
    />
  );
}