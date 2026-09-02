import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ManagerDashboardClient from './manager-client';

export default async function ManagerPageServer() {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== 'MANAGER' && (session.user as any)?.role !== 'DIRECTOR')) {
    redirect('/');
  }

  const user = session.user as any;

  const totalStudents = await prisma.student.count();
  const activeGroups = await prisma.group.count({ where: { status: 'ACTIVE' } });
  const pendingRequests = await prisma.discountRequest.count({ where: { status: 'PENDING' } });
  const pendingPayments = await prisma.payment.count({ where: { status: 'PENDING' } });

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return (
    <ManagerDashboardClient
      role="MANAGER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      stats={{ totalStudents, activeGroups, pendingRequests, pendingPayments }}
    />
  );
}