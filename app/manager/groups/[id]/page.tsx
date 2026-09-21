import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import GroupDetailClient from '@/app/director/groups/[id]/group-detail-client';

export default async function ManagerGroupDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;

  // Только MANAGER и DIRECTOR имеют доступ к этой странице
  if (user.role !== 'MANAGER' && user.role !== 'DIRECTOR') {
    redirect('/');
  }

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
    redirect('/manager/groups');
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
      group: { select: { id: true, name: true } },
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
    level: group.level || '',
    teacherName: group.teacher?.user?.name || '—',
    teacherId: group.teacherId,
    room: group.room || 'Кабинет 101',
    monthlyPrice: group.monthlyPrice,
    status: group.status,
    students: group.students.map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone || '—',
      parentName: s.parent?.user?.name || '—',
      parentPhone: s.parent?.user?.phone || '—',
      stars: s.stars,
    })),
    lessonsCount: group.lessons.length,
  };

  const availableStudentsData = availableStudents.map((s) => ({
    id: s.id,
    name: s.name,
    parentName: s.parent?.user?.name || '—',
    groupName: s.group ? `(в группе: ${s.group.name})` : '(без группы)',
  }));

  return (
    <GroupDetailClient
      role="MANAGER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      group={groupData}
      availableStudents={availableStudentsData}
      canManage={true}
    />
  );
}