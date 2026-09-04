import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StoreClient from './store-client';

export default async function StudentStorePage() {
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
      students: { select: { id: true, name: true, stars: true } },
    },
  });

  if (parent && parent.students.length > 0) {
    studentsData = parent.students;
  } else if (userPhone) {
    const dbStudents = await prisma.student.findMany({
      where: { phone: userPhone },
      select: { id: true, name: true, stars: true },
    });
    studentsData = dbStudents;
  }

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  // Get available rewards
  const rewards = await prisma.reward.findMany({
    where: { available: true },
    orderBy: { starsCost: 'asc' },
  });

  const rewardsList = rewards.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    starsCost: r.starsCost,
    discountPercent: r.discountPercent,
  }));

  const students = studentsData.map((st) => ({
    id: st.id,
    name: st.name,
    stars: st.stars,
  }));

  return (
    <StoreClient
      role={role}
      userName={userName}
      userPhone={userPhone}
      unreadCount={unreadCount}
      students={students}
      rewards={rewardsList}
    />
  );
}
