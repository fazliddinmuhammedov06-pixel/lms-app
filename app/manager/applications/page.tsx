import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DirectorClient from '@/app/director/director-client';

export default async function ManagerApplicationsPage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;

  if (user.role !== 'MANAGER' && user.role !== 'DIRECTOR') {
    redirect('/');
  }

  const dbRequests = await prisma.discountRequest.findMany({
    include: {
      student: { include: { parent: { include: { user: true } }, group: { include: { teacher: { include: { user: true } } } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const requests = dbRequests.map((req) => ({
    id: req.id,
    studentName: req.student.name,
    parentName: req.student.parent.user.name,
    parentPhone: req.student.parent.user.phone,
    groupName: req.student.group?.name || 'Без группы',
    discountPercent: req.discountPercent,
    starsCost: req.starsCost,
    status: req.status,
  }));

  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <DirectorClient
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      stats={{ totalStudents: 0 }}
      initialRequests={requests}
      teachers={[]}
      recentEvents={[]}
    />
  );
}