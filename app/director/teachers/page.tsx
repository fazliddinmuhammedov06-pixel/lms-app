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
          students: {
            include: {
              parent: { include: { user: true } },
            },
            orderBy: { name: 'asc' },
          },
        },
      },
    },
  });

  const dbAvailableStudents = await prisma.student.findMany({
    include: {
      parent: { include: { user: true } },
      group: { select: { id: true, name: true } },
    },
    orderBy: { name: 'asc' },
  });

  const availableStudents = dbAvailableStudents.map((s) => ({
    id: s.id,
    name: s.name,
    groupId: s.groupId,
    parentName: s.parent?.user?.name || '—',
    groupName: s.group ? `(в группе: ${s.group.name})` : '(без группы)',
  }));

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
        students: g.students.map((s) => ({
          id: s.id,
          name: s.name,
          phone: s.phone || '—',
          parentName: s.parent?.user?.name || '—',
          parentPhone: s.parent?.user?.phone || '—',
          stars: s.stars,
        })),
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
      availableStudents={availableStudents}
    />
  );
}