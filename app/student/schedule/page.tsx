import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ScheduleClient from './schedule-client';

export default async function StudentSchedulePage() {
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
          group: {
            include: {
              teacher: { include: { user: true } },
              lessons: { orderBy: { startTime: 'asc' } },
            },
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
        group: {
          include: {
            teacher: { include: { user: true } },
            lessons: { orderBy: { startTime: 'asc' } },
          },
        },
      },
    });
    studentsData = dbStudents;
  }

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  // Prepare schedule data
  const daysOfWeekMap: Record<number, string> = {
    1: 'Понедельник',
    2: 'Вторник',
    3: 'Среда',
    4: 'Четверг',
    5: 'Пятница',
    6: 'Суббота',
    7: 'Воскресенье',
  };

  const students = studentsData.map((st) => {
    const lessons = st.group?.lessons?.map((l: any) => ({
      id: l.id,
      groupId: st.groupId,
      groupName: st.group.name,
      teacherName: st.group.teacher.user.name,
      subject: st.group.subject || 'Общий',
      dayOfWeek: l.dayOfWeek || 1,
      dayName: daysOfWeekMap[l.dayOfWeek || 1],
      startTime: l.startTime,
      endTime: l.endTime,
      room: l.room || st.group.room || 'Кабинет 101',
      status: l.status,
    })) || [];

    return {
      id: st.id,
      name: st.name,
      groupName: st.group?.name || null,
      lessons,
    };
  });

  return (
    <ScheduleClient
      role={role}
      userName={userName}
      userPhone={userPhone}
      unreadCount={unreadCount}
      students={students}
    />
  );
}
