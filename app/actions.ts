'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { AttendanceStatus } from '@/types';
import bcrypt from 'bcryptjs';
import { normalizePhone, isValidUzPhone } from '@/lib/phone';
import { isMeaningfulName } from '@/lib/name';

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
  const role = (session?.user as any)?.role;
  
  // Разрешено TEACHER и DIRECTOR
  if (!session || (role !== 'TEACHER' && role !== 'DIRECTOR')) {
    throw new Error('Доступ запрещён. Требуется роль TEACHER или DIRECTOR.');
  }

  let teacherId: string;

  if (role === 'TEACHER') {
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
    teacherId = teacher.id;
  } else {
    // DIRECTOR может управлять Stars любого студента
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { group: true },
    });
    if (!student) {
      throw new Error('Студент не найден.');
    }
    
    // Берём учителя группы студента или первого доступного
    if (student.group?.teacherId) {
      teacherId = student.group.teacherId;
    } else {
      const firstTeacher = await prisma.teacher.findFirst();
      if (!firstTeacher) throw new Error('Учителя не найдены.');
      teacherId = firstTeacher.id;
    }
  }

  const [updatedStudent, transaction] = await prisma.$transaction([
    prisma.student.update({
      where: { id: studentId },
      data: { stars: { increment: amount } },
    }),
    prisma.starTransaction.create({
      data: { studentId, amount, reason, teacherId },
    }),
  ]);

  revalidatePath('/teacher');
  revalidatePath('/director');
  revalidatePath('/director/students');
  revalidatePath('/student');
  revalidatePath('/student/rating');
  return { success: true, balance: updatedStudent.stars, transaction };
}

export async function updateStudentGroup(studentId: string, groupId: string | null) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  
  // Только DIRECTOR и MANAGER могут изменять группу студента
  if (!session || (role !== 'DIRECTOR' && role !== 'MANAGER')) {
    throw new Error('Доступ запрещён. Требуется роль DIRECTOR или MANAGER.');
  }

  // Проверяем существование студента
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, groupId: true },
  });
  if (!student) {
    throw new Error('Студент не найден.');
  }

  const previousGroupId = student.groupId;

  // Если groupId указан, проверяем существование группы
  if (groupId) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true },
    });
    if (!group) {
      throw new Error('Группа не найдена.');
    }
  }

  // Обновляем группу студента
  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data: { groupId: groupId },
  });

  revalidatePath('/director/students');
  revalidatePath('/director/groups');
  revalidatePath('/director/groups', 'layout');
  revalidatePath('/director/teachers');
  if (groupId) {
    revalidatePath(`/director/groups/${groupId}`);
    revalidatePath(`/manager/groups/${groupId}`);
    revalidatePath(`/teacher/groups/${groupId}`);
  }
  if (previousGroupId && previousGroupId !== groupId) {
    revalidatePath(`/director/groups/${previousGroupId}`);
    revalidatePath(`/manager/groups/${previousGroupId}`);
    revalidatePath(`/teacher/groups/${previousGroupId}`);
  }
  revalidatePath('/manager/students');
  revalidatePath('/manager/groups');
  revalidatePath('/manager/groups', 'layout');
  revalidatePath('/teacher');
  revalidatePath('/teacher/groups', 'layout');
  return { success: true, student: updatedStudent };
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

  // Телефон родителя хранится в БД в каноническом формате: логин (lib/auth.ts)
  // ищет пользователя именно по "+998XXXXXXXXX". Иначе аккаунт создаётся,
  // но войти под ним нельзя ("Пользователь не найден").
  // Имя родителя сохраняется в User.name и показывается родителю в сайдбаре.
  // Раньше сюда могли попасть "." / "," (пустые/служебные значения из импорта),
  // поэтому имя обязано быть осмысленным (хотя бы 2 буквы).
  const parentName = (data.parentName || '').trim();
  if (!isMeaningfulName(parentName)) {
    throw new Error('Введите ФИО родителя (минимум 2 буквы). С этим именем создаётся аккаунт родителя.');
  }

  const parentPhone = normalizePhone(data.parentPhone);
  if (!parentPhone || !isValidUzPhone(parentPhone)) {
    throw new Error('Неверный формат номера родителя. Используйте формат: +998XXXXXXXXX');
  }

  // Безопасность: пароль больше не подставляется по умолчанию (раньше был '123456').
  // Аккаунт родителя создаётся только с явно заданным паролем (минимум 6 символов).
  if (!data.parentPassword || data.parentPassword.trim().length < 6) {
    throw new Error('Задайте пароль родителя (минимум 6 символов). Пароль по умолчанию больше не используется.');
  }
  const plainPassword = data.parentPassword;
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  let parentUser = await prisma.user.findUnique({ where: { phone: parentPhone } });
  if (!parentUser) {
    parentUser = await prisma.user.create({
      data: {
        name: parentName,
        phone: parentPhone,
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
      phone: data.phone ? normalizePhone(data.phone) ?? data.phone.trim() : null,
      parentId: parent.id,
      groupId: data.groupId || null,
      subject: data.subject || 'Общий предмет',
      parentPhone: parentPhone,
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

  // Имя учителя сохраняется в User.name и отображается в списках. Не допускаем
  // пустых/служебных значений вроде "." — как в аккаунтах родителей.
  const teacherName = (data.name || '').trim();
  if (!isMeaningfulName(teacherName)) {
    throw new Error('Введите ФИО учителя (минимум 2 буквы).');
  }

  // Храним телефон в каноническом формате, как ищет его логин (lib/auth.ts).
  const phone = normalizePhone(data.phone);
  if (!phone || !isValidUzPhone(phone)) {
    throw new Error('Неверный формат номера. Используйте формат: +998XXXXXXXXX');
  }

  let user = await prisma.user.findUnique({ where: { phone } });
  if (user) {
    throw new Error('Пользователь с таким номером уже существует.');
  }

  // Безопасность: пароль больше не подставляется по умолчанию (раньше был '123456').
  // Учитель создаётся только с явно заданным паролем (минимум 6 символов).
  if (!data.password || data.password.trim().length < 6) {
    throw new Error('Задайте пароль учителя (минимум 6 символов). Пароль по умолчанию больше не используется.');
  }
  const plainPassword = data.password;
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  user = await prisma.user.create({
    data: {
      name: teacherName,
      phone,
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

export async function deleteTeacher(teacherId: string) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') {
    throw new Error('Доступ запрещён. Требуется роль DIRECTOR.');
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { id: true, userId: true },
  });

  if (!teacher) {
    throw new Error('Учитель не найден.');
  }

  // Удаляем пользователя учителя, что через каскад удаляет Teacher и все связанные группы/данные
  await prisma.user.delete({
    where: { id: teacher.userId },
  });

  revalidatePath('/director/teachers');
  revalidatePath('/director/groups');
  revalidatePath('/director/schedule');
  revalidatePath('/director/students');
  revalidatePath('/director/attendance');
  revalidatePath('/manager/groups');
  revalidatePath('/manager/schedule');
  revalidatePath('/manager/students');
  revalidatePath('/teacher/schedule');

  return { success: true };
}

export async function deleteStudent(studentId: string) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'DIRECTOR' && role !== 'MANAGER')) {
    throw new Error('Доступ запрещён. Требуется роль DIRECTOR или MANAGER.');
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { parent: true },
  });
  if (!student) {
    throw new Error('Ученик не найден.');
  }

  // Удаляем ученика: каскадом из БД уходят все связанные записи
  // (посещаемость, звёзды, заявки на скидку, платежи, ДЗ, оценки).
  // Группа при этом не затрагивается.
  await prisma.$transaction(async (tx) => {
    await tx.student.delete({ where: { id: studentId } });

    // Если у родителя не осталось учеников — удаляем и его аккаунт,
    // чтобы не оставлять осиротевшие записи в БД.
    const remainingStudents = await tx.student.count({
      where: { parentId: student.parentId },
    });
    if (remainingStudents === 0) {
      await tx.user.delete({ where: { id: student.parent.userId } });
    }
  });

  revalidatePath('/director/students');
  revalidatePath('/manager/students');
  revalidatePath('/teacher/students');
  revalidatePath('/director/groups');
  revalidatePath('/director/groups', 'layout');
  revalidatePath('/manager/groups');
  revalidatePath('/director');

  return { success: true };
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

export async function deleteLesson(lessonId: string) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'DIRECTOR' && role !== 'MANAGER' && role !== 'TEACHER')) {
    throw new Error('Доступ запрещён.');
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { group: { select: { teacherId: true } } },
  });

  if (!lesson) {
    throw new Error('Занятие не найдено.');
  }

  if (role === 'TEACHER') {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: (session.user as any).id },
      select: { id: true },
    });
    if (!teacher || lesson.group.teacherId !== teacher.id) {
      throw new Error('Доступ запрещён: занятие не принадлежит вашей группе.');
    }
  }

  await prisma.lesson.delete({
    where: { id: lessonId },
  });

  revalidatePath('/director/schedule');
  revalidatePath('/manager/schedule');
  revalidatePath('/teacher/schedule');

  return { success: true };
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

