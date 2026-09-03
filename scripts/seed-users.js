const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const plainPassword = '123456';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const users = [
    {
      phone: '+998901234567',
      name: 'Директор Центра',
      role: 'DIRECTOR',
    },
    {
      phone: '+998907654321',
      name: 'Учитель Иванов',
      role: 'TEACHER',
    },
    {
      phone: '+998909998877',
      name: 'Родитель Смирнов',
      role: 'PARENT',
    },
    {
      phone: '+998905555555',
      name: 'Ученик Тестов',
      role: 'STUDENT',
    },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { phone: u.phone },
      update: {
        role: u.role,
        name: u.name,
        passwordHash: passwordHash,
      },
      create: {
        phone: u.phone,
        name: u.name,
        role: u.role,
        passwordHash: passwordHash,
      },
    });

    if (u.role === 'TEACHER') {
      await prisma.teacher.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    } else if (u.role === 'PARENT') {
      await prisma.parent.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    }
  }

  // 1. Получаем учителя +998907654321
  const teacherUser = await prisma.user.findUnique({
    where: { phone: '+998907654321' },
    include: { teacher: true },
  });

  if (!teacherUser || !teacherUser.teacher) {
    throw new Error('Учитель с номером +998907654321 не найден.');
  }

  // 2. Создаем/обновляем тестовую группу через upsert и привязываем к ней учителя
  const testGroup = await prisma.group.upsert({
    where: { id: 'test-group-seed-1' },
    update: {
      name: 'Тестовая группа A1',
      teacherId: teacherUser.teacher.id,
      subject: 'Английский язык',
    },
    create: {
      id: 'test-group-seed-1',
      name: 'Тестовая группа A1',
      subject: 'Английский язык',
      level: 'A1 Beginner',
      teacherId: teacherUser.teacher.id,
      room: 'Кабинет 101',
      monthlyPrice: 350000,
      status: 'ACTIVE',
    },
  });

  // 3. Получаем родителя +998909998877
  const parentUser = await prisma.user.findUnique({
    where: { phone: '+998909998877' },
    include: { parent: true },
  });

  if (!parentUser || !parentUser.parent) {
    throw new Error('Родитель с номером +998909998877 не найден.');
  }

  // 4. Ищем существующего ученика по номеру телефона или используем детерминированный ID для upsert
  const existingStudent = await prisma.student.findFirst({
    where: { phone: '+998905555555' },
  });

  const studentId = existingStudent ? existingStudent.id : 'test-student-seed-1';

  // 5. Создаем/обновляем запись Student, привязывая ее к родителю и группе
  await prisma.student.upsert({
    where: { id: studentId },
    update: {
      name: 'Ученик Тестов',
      parentId: parentUser.parent.id,
      groupId: testGroup.id,
      phone: '+998905555555',
      parentPhone: parentUser.phone,
      subject: 'Английский язык',
      status: 'ACTIVE',
    },
    create: {
      id: studentId,
      name: 'Ученик Тестов',
      parentId: parentUser.parent.id,
      groupId: testGroup.id,
      phone: '+998905555555',
      parentPhone: parentUser.phone,
      subject: 'Английский язык',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Тестовые аккаунты, группа и ученик успешно созданы/обновлены!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

