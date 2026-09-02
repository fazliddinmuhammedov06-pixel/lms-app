import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TeacherClient from '../teacher-client';

export default async function TeacherAttendancePage() {
  const session = await auth();
  // ── RBAC: только TEACHER ────────────────────────────────────────────────
  if (!session || (session.user as any)?.role !== 'TEACHER') redirect('/');

  const user = session.user as any;

  // Данные загружаются строго по userId из сессии — не из URL/body
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

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

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