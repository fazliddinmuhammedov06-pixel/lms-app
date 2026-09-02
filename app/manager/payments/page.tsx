import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FinancesClient from '@/app/director/finances/finances-client';

export default async function ManagerPaymentsPage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;

  if (user.role !== 'MANAGER' && user.role !== 'DIRECTOR') {
    redirect('/');
  }

  const dbPayments = await prisma.payment.findMany({
    include: { student: { include: { group: true } } },
    orderBy: { date: 'desc' },
  });

  const dbStudents = await prisma.student.findMany({
    select: { id: true, name: true, groupId: true, group: { select: { name: true } } },
  });

  const paidPaid = dbPayments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const paidOverdue = dbPayments.filter((p) => p.status === 'OVERDUE').reduce((s, p) => s + p.amount, 0);
  const paidPending = dbPayments.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

  const payments = dbPayments.map((p) => ({
    id: p.id,
    studentName: p.student.name,
    groupName: p.student.group?.name || 'Без группы',
    amount: p.amount,
    date: new Date(p.date).toLocaleDateString('ru-RU'),
    paymentMethod: p.paymentMethod,
    status: p.status,
    comment: p.comment || '',
  }));

  const studentsList = dbStudents.map((s) => ({ id: s.id, name: s.name, groupName: s.group?.name || 'Без группы' }));
  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <FinancesClient
      role="MANAGER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      payments={payments}
      students={studentsList}
      stats={{ paidPaid, paidOverdue, paidPending }}
    />
  );
}