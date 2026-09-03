'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { AttendanceStatus } from '@/types';
import bcrypt from 'bcryptjs';

export async function markAttendance(
  studentId: string,
  lessonId: string,
  dateStr: string,
  status: AttendanceStatus
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'TEACHER') {
    throw new Error('Доступ запрещён. Требуется роль TEACHER.');
  }

  // Получаем профиль учителя вместе с его группами и студентами
  const teacher = await prisma.teacher.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      groups: {
        include: { students: { select: { id: true } } },
      },
    },
  });
  if (!teacher) throw new Error('Профиль учителя не найден.');

  // Проверяем, что студент принадлежит одной из групп этого учителя
  const allowedStudentIds = new Set(
    teacher.groups.flatMap((g) => g.students.map((s) => s.id))
  );
  if (!allowedStudentIds.has(studentId)) {
    throw new Error('Доступ запрещён: студент не принадлежит вашим группам.');
  }

  // Проверяем, что lesson принадлежит группе этого учителя
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { group: { select: { teacherId: true } } },
  });
  if (!lesson || lesson.group.teacherId !== teacher.id) {
    throw new Error('Доступ запрещён: занятие не принадлежит вашим группам.');
  }

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  const record = await prisma.attendanceRecord.upsert({
    where: {
      studentId_lessonId_date: { studentId, lessonId, date },
    },
    update: { status },
    create: { studentId, lessonId, date, status },
  });

  revalidatePath('/teacher');
  revalidatePath('/director');
  return { success: true, record };
}

export async function addStars(studentId: string, amount: number, reason: string) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'TEACHER') {
    throw new Error('Доступ запрещён. Требуется роль TEACHER.');
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: (session.user as any).id },
  });
  if (!teacher) {
    throw new Error('Профиль преподавателя не найден.');
  }

  // Проверяем, что studentId принадлежит группе этого учителя
  const studentInGroup = await prisma.student.findFirst({
    where: {
      id: studentId,
      group: { teacherId: teacher.id },
    },
  });
  if (!studentInGroup) {
    throw new Error('Доступ запрещён: студент не принадлежит вашим группам.');
  }

  const [updatedStudent, transaction] = await prisma.$transaction([
    prisma.student.update({
      where: { id: studentId },
      data: { stars: { increment: amount } },
    }),
    prisma.starTransaction.create({
      data: { studentId, amount, reason, teacherId: teacher.id },
    }),
  ]);

  revalidatePath('/teacher');
  revalidatePath('/student');
  return { success: true, balance: updatedStudent.stars, transaction };
}

export async function createDiscountRequest(
  studentId: string,
  discountPercent: number,
  starsCost: number
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'PARENT') {
    throw new Error('Доступ запрещён. Требуется роль PARENT.');
  }

  const parent = await prisma.parent.findUnique({
    where: { userId: (session.user as any).id },
    include: { students: true },
  });
  if (!parent || !parent.students.some((s) => s.id === studentId)) {
    throw new Error('Доступ запрещён. Ученик не принадлежит родителю.');
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new Error('Ученик не найден.');
  if (student.stars < starsCost) throw new Error('Недостаточно звёзд.');

  let teacherId: string | null = null;
  if (student.groupId) {
    const group = await prisma.group.findUnique({ where: { id: student.groupId } });
    teacherId = group?.teacherId || null;
  }
  if (!teacherId) {
    const firstTeacher = await prisma.teacher.findFirst();
    if (!firstTeacher) throw new Error('Учителя не найдены.');
    teacherId = firstTeacher.id;
  }

  const [request] = await prisma.$transaction([
    prisma.discountRequest.create({
      data: { studentId, discountPercent, starsCost, status: 'PENDING' },
    }),
    prisma.student.update({
      where: { id: studentId },
      data: { stars: { decrement: starsCost } },
    }),
    prisma.starTransaction.create({
      data: { studentId, amount: -starsCost, reason: `Обмен на скидку ${discountPercent}%`, teacherId },
    }),
  ]);

  revalidatePath('/student');
  revalidatePath('/director');
  return { success: true, request };
}

export async function approveDiscountRequest(requestId: string) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') {
    throw new Error('Доступ запрещён. Требуется роль DIRECTOR.');
  }

  // Проверяем существование заявки и её статус перед обработкой
  const existing = await prisma.discountRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true },
  });
  if (!existing) throw new Error('Заявка не найдена.');
  if (existing.status !== 'PENDING') {
    throw new Error('Заявка уже обработана и не может быть изменена.');
  }

  const updatedRequest = await prisma.discountRequest.update({
    where: { id: requestId },
    data: {
      status: 'APPROVED',
      resolvedAt: new Date(),
      resolvedBy: (session.user as any).id,
    },
  });

  revalidatePath('/director');
  revalidatePath('/student');
  return { success: true, request: updatedRequest };
}

export async function rejectDiscountRequest(requestId: string) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') {
    throw new Error('Доступ запрещён. Требуется роль DIRECTOR.');
  }

  const request = await prisma.discountRequest.findUnique({
    where: { id: requestId },
    include: { student: { include: { group: true } } },
  });
  if (!request) throw new Error('Заявка не найдена.');
  if (request.status !== 'PENDING') throw new Error('Заявка уже обработана.');

  let teacherId = request.student.group?.teacherId || null;
  if (!teacherId) {
    const firstTeacher = await prisma.teacher.findFirst();
    if (!firstTeacher) throw new Error('Учителя не найдены.');
    teacherId = firstTeacher.id;
  }

  const [updatedRequest] = await prisma.$transaction([
    prisma.discountRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        resolvedAt: new Date(),
        resolvedBy: (session.user as any).id,
      },
    }),
    prisma.student.update({
      where: { id: request.studentId },
      data: { stars: { increment: request.starsCost } },
    }),
    prisma.starTransaction.create({
      data: {
        studentId: request.studentId,
        amount: request.starsCost,
        reason: `Возврат звёзд: отклонена заявка на скидку ${request.discountPercent}%`,
        teacherId,
      },
    }),
  ]);

  revalidatePath('/director');
  revalidatePath('/student');
  return { success: true, request: updatedRequest };
}

export async function createStudent(data: {
  name: string;
  phone?: string;
  parentName: string;
  parentPhone: string;
  parentPassword?: string;
  groupId?: string;
  subject?: string;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'DIRECTOR' && role !== 'MANAGER')) {
    throw new Error('Доступ запрещён. Требуется роль DIRECTOR или MANAGER.');
  }

  const plainPassword = data.parentPassword || '123456';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  let parentUser = await prisma.user.findUnique({ where: { phone: data.parentPhone } });
  if (!parentUser) {
    parentUser = await prisma.user.create({
      data: {
        name: data.parentName,
        phone: data.parentPhone,
        passwordHash,
        role: 'PARENT',
      },
    });
  } else if (data.parentPassword) {
    await prisma.user.update({
      where: { id: parentUser.id },
      data: { passwordHash },
    });
  }

  let parent = await prisma.parent.findUnique({ where: { userId: parentUser.id } });
  if (!parent) {
    parent = await prisma.parent.create({
      data: { userId: parentUser.id },
    });
  }

  const student = await prisma.student.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      parentId: parent.id,
      groupId: data.groupId || null,
      subject: data.subject || 'Общий предмет',
      parentPhone: data.parentPhone,
    },
  });

  revalidatePath('/director/students');
  revalidatePath('/manager/students');
  return { success: true, student };
}

export async function createTeacher(data: {
  name: string;
  phone: string;
  password?: string;
  email?: string;
  subject?: string;
  salary?: number;
}) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') {
    throw new Error('Доступ запрещён. Требуется роль DIRECTOR.');
  }

  let user = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (user) {
    throw new Error('Пользователь с таким номером уже существует.');
  }

  const plainPassword = data.password || '123456';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  user = await prisma.user.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      passwordHash,
      role: 'TEACHER',
    },
  });

  const teacher = await prisma.teacher.create({
    data: {
      userId: user.id,
      subject: data.subject || 'Преподаватель',
      salary: data.salary || 0,
    },
  });

  revalidatePath('/director/teachers');
  return { success: true, teacher };
}

export async function createGroup(data: {
  name: string;
  subject: string;
  level: string;
  teacherId: string;
  room?: string;
  monthlyPrice?: number;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'DIRECTOR' && role !== 'MANAGER')) {
    throw new Error('Доступ запрещён. Требуется роль DIRECTOR или MANAGER.');
  }

  // Проверяем, что teacherId реально существует в БД — нельзя доверять ID из запроса
  const teacherExists = await prisma.teacher.findUnique({
    where: { id: data.teacherId },
    select: { id: true },
  });
  if (!teacherExists) {
    throw new Error('Учитель не найден. Укажите корректный teacherId.');
  }

  const group = await prisma.group.create({
    data: {
      name: data.name,
      subject: data.subject,
      level: data.level,
      teacherId: data.teacherId,
      room: data.room || 'Кабинет 101',
      monthlyPrice: data.monthlyPrice || 350000,
      status: 'ACTIVE',
    },
  });

  revalidatePath('/director/groups');
  revalidatePath('/manager/groups');
  return { success: true, group };
}

export async function createLesson(data: {
  groupId: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  room?: string;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'DIRECTOR' && role !== 'MANAGER' && role !== 'TEACHER')) {
    throw new Error('Доступ запрещён.');
  }

  const group = await prisma.group.findUnique({ where: { id: data.groupId } });
  if (!group) throw new Error('Группа не найдена');

  // Учитель может добавлять занятия только в свои группы
  if (role === 'TEACHER') {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: (session.user as any).id },
      select: { id: true },
    });
    if (!teacher) throw new Error('Профиль учителя не найден.');
    if (group.teacherId !== teacher.id) {
      throw new Error('Доступ запрещён: группа не принадлежит вам.');
    }
  }

  const lesson = await prisma.lesson.create({
    data: {
      groupId: data.groupId,
      dayOfWeek: data.dayOfWeek || null,
      date: data.date ? new Date(data.date) : null,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room || group.room || 'Кабинет 101',
      status: 'SCHEDULED',
    },
  });

  revalidatePath('/director/schedule');
  revalidatePath('/teacher/schedule');
  return { success: true, lesson };
}

export async function createPayment(data: {
  studentId: string;
  groupId?: string;
  amount: number;
  paymentMethod: string;
  comment?: string;
  status?: string;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'DIRECTOR' && role !== 'MANAGER')) {
    throw new Error('Доступ запрещён. Требуется роль DIRECTOR или MANAGER.');
  }

  // Проверяем, что studentId реально существует
  const student = await prisma.student.findUnique({
    where: { id: data.studentId },
    select: { id: true, name: true, parentId: true, parent: { select: { userId: true } } },
  });
  if (!student) {
    throw new Error('Ученик не найден. Укажите корректный studentId.');
  }

  // Если указан groupId — проверяем, что он существует
  if (data.groupId) {
    const groupExists = await prisma.group.findUnique({
      where: { id: data.groupId },
      select: { id: true },
    });
    if (!groupExists) {
      throw new Error('Группа не найдена. Укажите корректный groupId.');
    }
  }

  const payment = await prisma.payment.create({
    data: {
      studentId: data.studentId,
      groupId: data.groupId || null,
      amount: data.amount,
      paymentMethod: data.paymentMethod || 'Наличные',
      comment: data.comment || null,
      status: data.status || 'PAID',
    },
  });

  if (student.parent?.userId) {
    await prisma.notification.create({
      data: {
        userId: student.parent.userId,
        title: 'Платеж зарегистрирован',
        message: `Принята оплата для ${student.name}: ${data.amount.toLocaleString()} UZS (${data.paymentMethod})`,
        category: 'Payment',
      },
    });
  }

  revalidatePath('/director/finances');
  revalidatePath('/manager/payments');
  revalidatePath('/parent/payments');
  return { success: true, payment };
}

export async function createHomework(data: {
  title: string;
  description: string;
  groupId: string;
  deadline: string;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'TEACHER' && role !== 'DIRECTOR')) {
    throw new Error('Доступ запрещён. Требуется роль TEACHER или DIRECTOR.');
  }

  // Учитель может создавать ДЗ только в своих группах
  if (role === 'TEACHER') {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: (session.user as any).id },
    });
    if (!teacher) throw new Error('Профиль учителя не найден.');

    const group = await prisma.group.findUnique({
      where: { id: data.groupId },
      select: { teacherId: true },
    });
    if (!group || group.teacherId !== teacher.id) {
      throw new Error('Доступ запрещён: группа не принадлежит вам.');
    }
  }

  const homework = await prisma.homework.create({
    data: {
      title: data.title,
      description: data.description,
      groupId: data.groupId,
      deadline: new Date(data.deadline),
    },
  });

  const students = await prisma.student.findMany({ where: { groupId: data.groupId } });
  for (const st of students) {
    await prisma.homeworkSubmission.create({
      data: {
        homeworkId: homework.id,
        studentId: st.id,
        status: 'ASSIGNED',
      },
    });
  }

  revalidatePath('/teacher/homework');
  revalidatePath('/student/homework');
  return { success: true, homework };
}

export async function createReward(data: {
  name: string;
  description: string;
  starsCost: number;
  discountPercent?: number;
}) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') {
    throw new Error('Доступ запрещён. Требуется роль DIRECTOR.');
  }

  const reward = await prisma.reward.create({
    data: {
      name: data.name,
      description: data.description,
      starsCost: data.starsCost,
      discountPercent: data.discountPercent || 0,
      available: true,
    },
  });

    revalidatePath('/director/rewards');
  revalidatePath('/student/store');
  return { success: true, reward };
}

export async function addGrade(data: {
  studentId: string;
  gradeInt: number;
  comment?: string;
  groupId?: string;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'TEACHER' && role !== 'DIRECTOR')) {
    throw new Error('Доступ запрещён. Требуется роль TEACHER или DIRECTOR.');
  }

  const student = await prisma.student.findUnique({
    where: { id: data.studentId },
    include: { group: true },
  });
  if (!student) throw new Error('Студент не найден');

  let teacherId: string | null = null;

  if (role === 'TEACHER') {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: (session.user as any).id },
      select: { id: true },
    });
    if (!teacher) throw new Error('Профиль учителя не найден');
    teacherId = teacher.id;

    const studentInTeacherGroup = await prisma.student.findFirst({
      where: {
        id: data.studentId,
        group: { teacherId: teacher.id },
      },
    });
    if (!studentInTeacherGroup) {
      throw new Error('Доступ запрещён: студент не принадлежит вашим группам.');
    }
    if (data.groupId) {
      const group = await prisma.group.findUnique({
        where: { id: data.groupId },
        select: { teacherId: true },
      });
      if (!group || group.teacherId !== teacher.id) {
        throw new Error('Доступ запрещён: группа не принадлежит вам.');
      }
    }
  } else if (role === 'DIRECTOR') {
    if (data.groupId) {
      const group = await prisma.group.findUnique({
        where: { id: data.groupId },
        select: { teacherId: true, students: { select: { id: true } } },
      });
      if (!group) throw new Error('Группа не найдена');
      const studentInGroup = group.students.some((s) => s.id === data.studentId);
      if (!studentInGroup) {
        throw new Error('Студент не состоит в указанной группе');
      }
      teacherId = group.teacherId;
    } else {
      if (!student.group) throw new Error('Студент не состоит ни в одной группе. Укажите groupId.');
      teacherId = student.group.teacherId;
    }
    if (!teacherId) throw new Error('Не удалось определить учителя для выставления оценки');
  }

  const grade = await prisma.grade.create({
    data: {
      studentId: data.studentId,
      teacherId: teacherId as string,
      groupId: data.groupId ?? null,
      gradeInt: data.gradeInt,
      comment: data.comment || null,
    },
  });

  revalidatePath('/teacher/grades');
  revalidatePath('/student/grades');
  return { success: true, grade };
}

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session) throw new Error('Требуется авторизация');

  const userId = (session.user as any)?.id as string;

  // Проверяем, что уведомление принадлежит текущему пользователю
  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!notification) throw new Error('Уведомление не найдено.');
  if (notification.userId !== userId) {
    throw new Error('Доступ запрещён: уведомление не принадлежит вам.');
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  revalidatePath('/director/notifications');
  revalidatePath('/teacher/notifications');
  revalidatePath('/student/notifications');
  revalidatePath('/parent/notifications');
  return { success: true };
}

