import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { calculateTotalStarsEarned } from '@/lib/levels';
import StudentClient from './student-client';

export default async function StudentPageServer() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'PARENT') {
    redirect('/');
  }

  // Находим родителя и привязанных учеников с их группами, транзакциями звезд и пропусками
  const parent = await prisma.parent.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      students: {
        include: {
          group: true,
          starTransactions: true,
          attendanceRecords: {
            where: { status: 'ABSENT' },
            include: {
              lesson: {
                include: {
                  group: true,
                },
              },
            },
            orderBy: { date: 'desc' },
          },
        },
      },
    },
  });

  if (!parent || parent.students.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <p>Кабинет ученика пуст. Пожалуйста, обратитесь к администрации для привязки вашего ребёнка к вашему аккаунту.</p>
      </div>
    );
  }

  const initialStudents = parent.students.map((st) => {
    const totalStars = calculateTotalStarsEarned(st.starTransactions);
    const absences = st.attendanceRecords.map((ab) => ({
      date: new Date(ab.date).toLocaleDateString('ru-RU'),
      groupName: ab.lesson?.group?.name || 'Удаленная группа',
    }));

    return {
      id: st.id,
      name: st.name,
      currentBalance: st.stars,
      totalStars,
      absences,
    };
  });

  return <StudentClient initialStudents={initialStudents} />;
}
