import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StudentsClient from './students-client';

export default async function DirectorStudentsPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') {
    redirect('/');
  }

  const user = session.user as any;

  const dbStudents = await prisma.student.findMany({
    include: {
      parent: { include: { user: true } },
      group: { include: { teacher: { include: { user: true } } } },
      attendanceRecords: true,
      starTransactions: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const dbGroups = await prisma.group.findMany({
    select: { id: true, name: true },
  });

  const students = dbStudents.map((st) => {
    const presentCount = st.attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const totalAtt = st.attendanceRecords.length;
    const attPercent = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

    const hasOverdue = st.payments.some((p) => p.status === 'OVERDUE');

    return {
      id: st.id,
      name: st.name,
      phone: st.phone || '',
      parentName: st.parent.user.name,
      parentPhone: st.parentPhone || st.parent.user.phone,
      groupName: st.group?.name || 'Без группы',
      groupId: st.groupId || '',
      subject: st.subject || st.group?.subject || 'Общий',
      stars: st.stars,
      status: st.status,
      attPercent,
      hasOverdue,
      createdAt: new Date(st.createdAt).toLocaleDateString('ru-RU'),
    };
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return (
    <StudentsClient
      role="DIRECTOR"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      students={students}
      groups={dbGroups}
    />
  );
}