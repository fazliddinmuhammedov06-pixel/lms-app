import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TeacherGradesClient from './teacher-grades-client';

export default async function TeacherGradesPage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;
  if (user.role !== 'TEACHER') redirect('/');

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
  if (!teacher) redirect('/');

  const dbStudents = await prisma.student.findMany({
    where: { group: { teacherId: teacher.id } },
    select: { id: true, name: true, groupId: true, group: { select: { name: true } } },
  });

  const dbGrades = await prisma.grade.findMany({
    where: { teacherId: teacher.id },
    include: { student: true, group: true },
    orderBy: { date: 'desc' },
  });

  const grades = dbGrades.map((g) => ({
    id: g.id,
    studentName: g.student.name,
    groupName: g.group?.name || 'Группа',
    gradeInt: g.gradeInt,
    comment: g.comment || '',
    date: new Date(g.date).toLocaleDateString('ru-RU'),
  }));

  const studentsList = dbStudents.map((s) => ({ id: s.id, name: s.name, groupName: s.group?.name || 'Группа' }));
  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <TeacherGradesClient
      role="TEACHER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      grades={grades}
      students={studentsList}
    />
  );
}