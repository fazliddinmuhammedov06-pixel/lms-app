import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AnalyticsClient from './analytics-client';

export default async function DirectorAnalyticsPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') redirect('/');

  const user = session.user as any;

  const totalStudents = await prisma.student.count();
  const activeStudents = await prisma.student.count({ where: { status: 'ACTIVE' } });
  const newStudents = await prisma.student.count({ where: { status: 'NEW' } });
  const leftStudents = await prisma.student.count({ where: { status: 'LEFT' } });

  const totalAttendance = await prisma.attendanceRecord.count();
  const presentCount = await prisma.attendanceRecord.count({ where: { status: 'PRESENT' } });
  const absentCount = await prisma.attendanceRecord.count({ where: { status: 'ABSENT' } });
  const lateCount = await prisma.attendanceRecord.count({ where: { status: 'LATE' } });

  const payments = await prisma.payment.findMany();
  const paidSum = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const overdueSum = payments.filter((p) => p.status === 'OVERDUE').reduce((s, p) => s + p.amount, 0);
  const pendingSum = payments.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

  const groupsCount = await prisma.group.count();
  const teachersCount = await prisma.teacher.count();

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return (
    <AnalyticsClient
      role="DIRECTOR"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      analyticsData={{
        students: { total: totalStudents, active: activeStudents, new: newStudents, left: leftStudents },
        attendance: { total: totalAttendance, present: presentCount, absent: absentCount, late: lateCount },
        finances: { paid: paidSum, overdue: overdueSum, pending: pendingSum },
        counts: { groups: groupsCount, teachers: teachersCount },
      }}
    />
  );
}