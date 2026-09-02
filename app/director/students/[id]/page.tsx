import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StudentProfileClient from './student-profile-client';
import { getStudentLevel } from '@/lib/levels';
import { calculateTotalStarsEarned } from '@/lib/levels';

export default async function StudentProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;

  // Только DIRECTOR и MANAGER имеют право просматривать полный профиль студента
  if (user.role !== 'DIRECTOR' && user.role !== 'MANAGER') {
    redirect('/');
  }

  const st = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      parent: { include: { user: true } },
      group: { include: { teacher: { include: { user: true } } } },
      attendanceRecords: {
        include: { lesson: { include: { group: true } } },
        orderBy: { date: 'desc' },
      },
      starTransactions: {
        include: { teacher: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      },
      grades: {
        include: { teacher: { include: { user: true } } },
        orderBy: { date: 'desc' },
      },
      payments: { orderBy: { date: 'desc' } },
      homeworkSubmissions: {
        include: { homework: true },
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  if (!st) notFound();

  const totalEarned = calculateTotalStarsEarned(st.starTransactions);
  const levelInfo = getStudentLevel(totalEarned, st.stars);

  const presentCount = st.attendanceRecords.filter((r) => r.status === 'PRESENT').length;
  const totalAtt = st.attendanceRecords.length;
  const attRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

  const totalOverdue = st.payments
    .filter((p) => p.status === 'OVERDUE')
    .reduce((sum, p) => sum + p.amount, 0);

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  const studentData = {
    id: st.id,
    name: st.name,
    phone: st.phone || 'Не указан',
    birthDate: st.birthDate || 'Не указана',
    subject: st.subject || st.group?.subject || 'Общий',
    parentName: st.parent.user.name,
    parentPhone: st.parentPhone || st.parent.user.phone,
    groupName: st.group?.name || 'Без группы',
    teacherName: st.group?.teacher.user.name || 'Не назначен',
    stars: st.stars,
    levelInfo,
    attRate,
    totalOverdue,
    attendanceHistory: st.attendanceRecords.map((a) => ({
      id: a.id,
      date: new Date(a.date).toLocaleDateString('ru-RU'),
      status: a.status,
      groupName: a.lesson?.group?.name || 'Занятие',
    })),
    gradesHistory: st.grades.map((g) => ({
      id: g.id,
      grade: g.gradeInt,
      comment: g.comment || 'Без комментария',
      date: new Date(g.date).toLocaleDateString('ru-RU'),
      teacherName: g.teacher?.user?.name || 'Преподаватель',
    })),
    homeworkHistory: st.homeworkSubmissions.map((hw) => ({
      id: hw.id,
      title: hw.homework.title,
      deadline: new Date(hw.homework.deadline).toLocaleDateString('ru-RU'),
      status: hw.status,
      grade: hw.grade,
    })),
    paymentsHistory: st.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      date: new Date(p.date).toLocaleDateString('ru-RU'),
      method: p.paymentMethod,
      status: p.status,
      comment: p.comment || '',
    })),
    starsHistory: st.starTransactions.map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      reason: tx.reason,
      date: new Date(tx.createdAt).toLocaleDateString('ru-RU'),
      teacherName: tx.teacher?.user?.name || 'Система',
    })),
  };

  return (
    <StudentProfileClient
      role={user.role}
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      student={studentData}
    />
  );
}