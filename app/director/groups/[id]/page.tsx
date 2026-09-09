import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import GroupDetailClient from './group-detail-client';

export default async function DirectorGroupDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') redirect('/');

  const user = session.user as any;

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      teacher: { include: { user: true } },
      students: {
        include: {
          parent: { include: { user: true } },
        },
        orderBy: { name: 'asc' },
      },
      lessons: {
        orderBy: { date: 'desc' },
        take: 10,
      },
    },
  });

  if (!group) {
    redirect('/director/groups');
  }

  // Получаем всех студентов, которые НЕ в этой группе или без группы
  const availableStudents = await prisma.student.findMany({
    where: {
      OR: [
        { groupId: null },
        { groupId: { not: params.id } },
      ],
    },
    include: {
      parent: { include: { user: true } },
    },
    orderBy: { name: 'asc' },
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  const groupData = {
    id: group.id,
    name: group.name,
    subject: group.subject || 'Английский язык',
    level: group.level || 'A1 Beginner',
    teacherName: group.teacher.user.name,
    teacherId: group.teacherId,
    room: group.room || 'Кабинет 101',
    monthlyPrice: group.monthlyPrice,
    status: group.status,
    students: group.students.map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      parentName: s.parent.user.name,
      parentPhone: s.parent.user.phone,
      stars: s.stars,
    })),
    lessonsCount: group.lessons.length,
  };

  const availableStudentsData = availableStudents.map((s) => ({
    id: s.id,
    name: s.name,
    parentName: s.parent.user.name,
    groupName: s.groupId ? '(в другой группе)' : '(без группы)',
  }));

  return (
    <GroupDetailClient
      role="DIRECTOR"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      group={groupData}
      availableStudents={availableStudentsData}
    />
  );
}
