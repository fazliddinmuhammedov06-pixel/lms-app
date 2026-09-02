import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TeacherClient from '../teacher-client';

export default async function TeacherRewardsPage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;
  if (user.role !== 'TEACHER') redirect('/');

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: {
      groups: {
        include: {
          students: { include: { starTransactions: true } },
          lessons: true,
        },
      },
    },
  });

  if (!teacher) redirect('/');

  const groups = teacher.groups.map((g) => ({
    id: g.id,
    name: g.name,
    lessonId: g.lessons[0]?.id || null,
    students: g.students.map((st) => ({
      id: st.id,
      name: st.name,
      currentBalance: st.stars,
      totalStars: st.stars,
      attendance: null,
    })),
  }));

  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <TeacherClient
      role="TEACHER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      groups={groups}
    />
  );
}