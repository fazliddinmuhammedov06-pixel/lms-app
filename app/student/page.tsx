import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { calculateTotalStarsEarned } from '@/lib/levels';
import { getLeaderboardData } from '@/lib/rating';
import StudentClient from './student-client';

export default async function StudentPageServer() {
  const session = await auth();
  if (!session) {
    redirect('/');
  }

  const role = (session.user as any)?.role;
  if (role !== 'PARENT' && role !== 'STUDENT') {
    redirect('/');
  }

  const userId = (session.user as any).id;
  const userPhone = (session.user as any).phone;

  let studentsData: any[] = [];

  const parent = await prisma.parent.findUnique({
    where: { userId },
    include: {
      students: {
        include: {
          group: true,
          starTransactions: {
            orderBy: { createdAt: 'desc' },
          },
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

  if (parent && parent.students.length > 0) {
    studentsData = parent.students;
  } else if (userPhone) {
    const dbStudents = await prisma.student.findMany({
      where: { phone: userPhone },
      include: {
        group: true,
        starTransactions: {
          orderBy: { createdAt: 'desc' },
        },
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
    });
    studentsData = dbStudents;
  }

  if (!studentsData || studentsData.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white p-4 text-center">
        <p>Кабинет ученика пуст. Пожалуйста, обратитесь к администрации для привязки вашего аккаунта.</p>
      </div>
    );
  }

  const initialStudents = await Promise.all(
    studentsData.map(async (st) => {
      const totalStars = calculateTotalStarsEarned(st.starTransactions || []);
      const absences = (st.attendanceRecords || []).map((ab: any) => ({
        date: new Date(ab.date).toLocaleDateString('ru-RU'),
        groupName: ab.lesson?.group?.name || 'Удаленная группа',
      }));

      const transactions = (st.starTransactions || []).map((t: any) => ({
        id: t.id,
        reason: t.reason || 'Начисление звёзд',
        amount: t.amount,
        date: new Date(t.createdAt).toLocaleDateString('ru-RU'),
      }));

      const { currentProfileRating } = await getLeaderboardData(st.id);

      return {
        id: st.id,
        name: st.name,
        currentBalance: st.stars,
        totalStars,
        absences,
        transactions,
        ratingInfo: currentProfileRating,
      };
    })
  );

  return <StudentClient initialStudents={initialStudents} />;
}

