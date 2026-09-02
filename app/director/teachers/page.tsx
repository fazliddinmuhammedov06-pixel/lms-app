import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TeachersClient from './teachers-client';

export default async function DirectorTeachersPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') redirect('/');

  const user = session.user as any;

  const dbTeachers = await prisma.teacher.findMany({
    include: {
      user: true,
      groups: {
        include: {
          students: true,
        },
      },
    },
  });

  const teachers = dbTeachers.map((t) => {
    const totalStudents = t.groups.reduce((sum, g) => sum + g.students.length, 0);

    return {
      id: t.id,
      name: t.user.name,
      phone: t.user.phone,
      email: t.user.email || '',
      subject: t.subject || 'Преподаватель',
      salary: t.salary || 0,
      groupsCount: t.groups.length,
      totalStudents,
      groups: t.groups.map((g) => ({
        id: g.id,
        name: g.name,
        studentsCount: g.students.length,
      })),
    };
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return (
    <TeachersClient
      role="DIRECTOR"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      teachers={teachers}
    />
  );
}