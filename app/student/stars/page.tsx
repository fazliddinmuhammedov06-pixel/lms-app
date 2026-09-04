import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StarsClient from './stars-client';

export default async function StudentStarsPage() {
  const session = await auth();
  if (!session) redirect('/');

  const role = (session.user as any)?.role;
  if (role !== 'PARENT' && role !== 'STUDENT') redirect('/');

  const userId = (session.user as any).id;
  const userName = (session.user as any).name || 'Студент';
  const userPhone = (session.user as any).phone;

  // Find students
  let studentsData: any[] = [];

  const parent = await prisma.parent.findUnique({
    where: { userId },
    include: {
      students: {
        include: {
          starTransactions: {
            include: {
              teacher: { include: { user: true } },
            },
            orderBy: { createdAt: 'desc' },
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
        starTransactions: {
          include: {
            teacher: { include: { user: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    studentsData = dbStudents;
  }

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  // Prepare stars data
  const students = studentsData.map((st) => {
    const transactions = st.starTransactions.map((tr: any) => ({
      id: tr.id,
      amount: tr.amount,
      reason: tr.reason || 'Начисление звёзд',
      teacherName: tr.teacher?.user?.name || 'Система',
      date: new Date(tr.createdAt).toLocaleDateString('ru-RU'),
      time: new Date(tr.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    }));

    const totalEarned = st.starTransactions
      .filter((tr: any) => tr.amount > 0)
      .reduce((sum: number, tr: any) => sum + tr.amount, 0);

    const totalSpent = Math.abs(
      st.starTransactions
        .filter((tr: any) => tr.amount < 0)
        .reduce((sum: number, tr: any) => sum + tr.amount, 0)
    );

    return {
      id: st.id,
      name: st.name,
      currentBalance: st.stars,
      totalEarned,
      totalSpent,
      transactions,
    };
  });

  return (
    <StarsClient
      role={role}
      userName={userName}
      userPhone={userPhone}
      unreadCount={unreadCount}
      students={students}
    />
  );
}
