import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import HomeworkClient from './homework-client';

export default async function StudentHomeworkPage() {
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
          group: true,
          homeworkSubmissions: {
            include: {
              homework: {
                include: {
                  group: true,
                },
              },
            },
            orderBy: { updatedAt: 'desc' },
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
        group: true,
        homeworkSubmissions: {
          include: {
            homework: {
              include: {
                group: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
    studentsData = dbStudents;
  }

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  // Prepare homework data
  const students = studentsData.map((st) => {
    const homeworks = st.homeworkSubmissions.map((sub: any) => ({
      id: sub.id,
      homeworkId: sub.homeworkId,
      title: sub.homework.title,
      description: sub.homework.description,
      groupName: sub.homework.group.name,
      deadline: new Date(sub.homework.deadline).toLocaleDateString('ru-RU'),
      deadlineTime: new Date(sub.homework.deadline).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      status: sub.status,
      grade: sub.grade,
      comment: sub.comment,
      submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('ru-RU') : null,
      isOverdue: sub.status === 'OVERDUE' || (new Date(sub.homework.deadline) < new Date() && sub.status !== 'SUBMITTED' && sub.status !== 'CHECKED'),
    }));

    return {
      id: st.id,
      name: st.name,
      groupName: st.group?.name || null,
      homeworks,
    };
  });

  return (
    <HomeworkClient
      role={role}
      userName={userName}
      userPhone={userPhone}
      unreadCount={unreadCount}
      students={students}
    />
  );
}
