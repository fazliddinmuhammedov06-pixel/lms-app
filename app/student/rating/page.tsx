import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getLeaderboardData } from '@/lib/rating';
import RatingClient from './rating-client';

export default async function RatingPage(props: {
  searchParams?: Promise<{ studentId?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/');

  const role = (session.user as any)?.role;
  if (role !== 'PARENT' && role !== 'STUDENT') redirect('/');

  const userId = (session.user as any).id;
  const userPhone = (session.user as any).phone;
  const userName = (session.user as any).name || 'Студент';

  const searchParams = await props.searchParams;
  const targetStudentId = searchParams?.studentId;

  let studentsList: { id: string; name: string }[] = [];

  const parent = await prisma.parent.findUnique({
    where: { userId },
    include: { students: { select: { id: true, name: true } } },
  });

  if (parent && parent.students.length > 0) {
    studentsList = parent.students;
  } else if (userPhone) {
    const dbStudents = await prisma.student.findMany({
      where: { phone: userPhone },
      select: { id: true, name: true },
    });
    studentsList = dbStudents;
  }

  const selectedStudentId =
    studentsList.find((s) => s.id === targetStudentId)?.id ||
    studentsList[0]?.id ||
    '';

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  const { leaderboard, currentProfileRating, achievements } =
    await getLeaderboardData(selectedStudentId);

  return (
    <RatingClient
      role={role}
      userName={userName}
      userPhone={userPhone}
      unreadCount={unreadCount}
      studentsList={studentsList}
      selectedStudentId={selectedStudentId}
      leaderboard={leaderboard}
      profileRating={currentProfileRating}
      achievements={achievements}
    />
  );
}
