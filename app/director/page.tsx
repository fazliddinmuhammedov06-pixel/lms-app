import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DirectorDashboardClient from './director-client';

export default async function DirectorPageServer() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') {
    redirect('/');
  }

  const user = session.user as any;

  // 1. Discount requests PENDING
  const dbRequests = await prisma.discountRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      student: {
        include: {
          parent: { include: { user: true } },
          group: { include: { teacher: { include: { user: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const initialRequests = dbRequests.map((req) => ({
    id: req.id,
    studentName: req.student.name,
    parentName: req.student.parent.user.name,
    parentEmail: req.student.parent.user.email || '',
    parentPhone: req.student.parent.user.phone,
    groupName: req.student.group?.name || 'Без группы',
    teacherName: req.student.group?.teacher.user.name || 'Не назначен',
    discountPercent: req.discountPercent,
    starsCost: req.starsCost,
    createdAt: new Date(req.createdAt).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  // 2. Teachers with groups
  const dbTeachers = await prisma.teacher.findMany({
    include: {
      user: true,
      groups: {
        include: {
          lessons: true,
          students: true,
        },
      },
    },
  });

  const daysOfWeekMap: Record<number, string> = {
    1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс'
  };

  const teachers = dbTeachers.map((t) => ({
    id: t.id,
    name: t.user.name,
    email: t.user.email || '',
    phone: t.user.phone,
    subject: t.subject || 'Общий',
    groups: t.groups.map((g) => ({
      id: g.id,
      name: g.name,
      studentCount: g.students.length,
      lessons: g.lessons.map((l) => ({
        day: daysOfWeekMap[l.dayOfWeek ?? 1] || 'Пн',
        time: `${l.startTime} - ${l.endTime}`,
      })),
    })),
  }));

  // 3. Stats & Attendance Today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const attendanceToday = await prisma.attendanceRecord.findMany({
    where: {
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const totalStudents = await prisma.student.count();
  const activeStudents = await prisma.student.count({ where: { status: 'ACTIVE' } });
  const newStudents = await prisma.student.count({ where: { status: 'NEW' } });
  const leftStudents = await prisma.student.count({ where: { status: 'LEFT' } });

  const totalGroups = await prisma.group.count();
  const activeGroups = await prisma.group.count({ where: { status: 'ACTIVE' } });
  const recruitingGroups = await prisma.group.count({ where: { status: 'RECRUITING' } });
  const completedGroups = await prisma.group.count({ where: { status: 'COMPLETED' } });

  // 4. Finances
  const paymentsPaid = await prisma.payment.aggregate({
    where: { status: 'PAID' },
    _sum: { amount: true },
  });

  const paymentsOverdue = await prisma.payment.aggregate({
    where: { status: 'OVERDUE' },
    _sum: { amount: true },
  });

  const paymentsPending = await prisma.payment.aggregate({
    where: { status: 'PENDING' },
    _sum: { amount: true },
  });

  const presentCount = attendanceToday.filter((r) => r.status === 'PRESENT').length;
  const absentCount = attendanceToday.filter((r) => r.status === 'ABSENT').length;
  const lateCount = attendanceToday.filter((r) => r.status === 'LATE').length;
  const lessonsTodayCount = await prisma.lesson.count();

  // 5. Unread notifications
  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  // 6. Recent activities
  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { student: true },
  });

  const recentStarTx = await prisma.starTransaction.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { student: true },
  });

  const recentEvents = [
    ...recentPayments.map((p) => ({
      id: `p-${p.id}`,
      text: `${p.student.name} оплатил(а) ${p.amount.toLocaleString()} UZS (${p.paymentMethod})`,
      date: new Date(p.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      type: 'payment',
    })),
    ...recentStarTx.map((s) => ({
      id: `s-${s.id}`,
      text: `${s.student.name} получено ${s.amount > 0 ? `+${s.amount}` : s.amount} ⭐ (${s.reason})`,
      date: new Date(s.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      type: 'star',
    })),
  ].slice(0, 7);

  const stats = {
    totalStudents,
    activeStudents,
    newStudents,
    leftStudents,
    totalGroups,
    activeGroups,
    recruitingGroups,
    completedGroups,
    teachersCount: dbTeachers.length,
    lessonsToday: lessonsTodayCount,
    presentCount,
    absentCount,
    lateCount,
    monthlyRevenue: paymentsPaid._sum.amount || 0,
    expectedRevenue: paymentsPending._sum.amount || 0,
    overdueDebts: paymentsOverdue._sum.amount || 0,
  };

  return (
    <DirectorDashboardClient
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      stats={stats}
      initialRequests={initialRequests}
      teachers={teachers}
      recentEvents={recentEvents}
    />
  );
}
