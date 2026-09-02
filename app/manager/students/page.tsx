import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StudentsClient from '@/app/director/students/students-client';

export default async function ManagerStudentsPage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;

  if (user.role !== 'MANAGER' && user.role !== 'DIRECTOR') {
    redirect('/');
  }

  const dbStudents = await prisma.student.findMany({
    include: {
      parent: { include: { user: true } },
      group: true,
      attendanceRecords: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const dbGroups = await prisma.group.findMany({ select: { id: true, name: true } });

  const students = dbStudents.map((st) => ({
    id: st.id,
    name: st.name,
    phone: st.phone || '',
    parentName: st.parent.user.name,
    parentPhone: st.parentPhone || st.parent.user.phone,
    groupName: st.group?.name || 'Без группы',
    groupId: st.groupId || '',
    stars: st.stars,
    status: st.status,
    attPercent: 100,
  }));

  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <StudentsClient
      role="MANAGER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      students={students}
      groups={dbGroups}
    />
  );
}