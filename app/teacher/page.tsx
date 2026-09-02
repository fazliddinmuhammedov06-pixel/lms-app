import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { calculateTotalStarsEarned } from '@/lib/levels';
import TeacherClient from './teacher-client';

export default async function TeacherPageServer() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'TEACHER') {
    redirect('/');
  }

  const user = session.user as any;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: {
      groups: {
        include: {
          students: {
            include: {
              starTransactions: true,
              attendanceRecords: {
                where: {
                  date: {
                    gte: todayStart,
                    lte: todayEnd,
                  },
                },
              },
            },
          },
          lessons: true,
        },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white p-4">
        <p>Профиль преподавателя не найден в базе данных. Пожалуйста, обратитесь к директору.</p>
      </div>
    );
  }

  const groups = teacher.groups.map((g) => ({
    id: g.id,
    name: g.name,
    lessonId: g.lessons[0]?.id || null,
    students: g.students.map((st) => {
      const totalStars = calculateTotalStarsEarned(st.starTransactions);
      const todayAttendance = st.attendanceRecords[0]?.status || null;

      return {
        id: st.id,
        name: st.name,
        currentBalance: st.stars,
        totalStars,
        attendance: todayAttendance,
      };
    }),
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
