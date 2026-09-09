// Сид для продакшн-БД: гарантирует наличие аккаунта ДИРЕКТОРА и тестовых пользователей.
// Пароли берутся ТОЛЬКО из переменных окружения — захардкоженных/дефолтных паролей в коде нет.
//
// Запуск:  node scripts/seed-users.js
//
// Требуемые переменные окружения (автоматически читаются из .env.production.local / .env.local):
//   DIRECTOR_PHONE    - номер директора (логин), напр. "+998881060625"
//   DIRECTOR_PASSWORD - пароль директора
//   SEED_PASSWORD     - пароль тестовых пользователей (TEACHER/PARENT/STUDENT)

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Загрузка переменных окружения из локальных env-файлов (без внешних зависимостей).
// Уже установленные process.env имеют приоритет.
function loadEnvFile(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    /* env-файл может отсутствовать */
  }
}
loadEnvFile('.env.production.local');
loadEnvFile('.env.local');

async function main() {
  const directorPhone = process.env.DIRECTOR_PHONE || '+998881060625';
  const directorPassword = process.env.DIRECTOR_PASSWORD;
  const seedPassword = process.env.SEED_PASSWORD;

  if (!directorPassword) {
    throw new Error('Не задан DIRECTOR_PASSWORD. Укажите пароль директора в .env.production.local и запустите скрипт заново.');
  }
  if (!seedPassword) {
    throw new Error('Не задан SEED_PASSWORD (пароль тестовых пользователей). Укажите его в .env.production.local и запустите скрипт заново.');
  }

  const directorHash = await bcrypt.hash(directorPassword, 10);
  const seedHash = await bcrypt.hash(seedPassword, 10);

  const users = [
    {
      phone: directorPhone,
      name: 'Директор Центра',
      role: 'DIRECTOR',
      passwordHash: directorHash,
    },
    {
      phone: '+998907654321',
      name: 'Учитель Иванов',
      role: 'TEACHER',
      passwordHash: seedHash,
    },
    {
      phone: '+998909998877',
      name: 'Родитель Смирнов',
      role: 'PARENT',
      passwordHash: seedHash,
    },
    {
      phone: '+998905555555',
      name: 'Ученик Тестов',
      role: 'STUDENT',
      passwordHash: seedHash,
    },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { phone: u.phone },
      update: {
        role: u.role,
        name: u.name,
        passwordHash: u.passwordHash,
      },
      create: {
        phone: u.phone,
        name: u.name,
        role: u.role,
        passwordHash: u.passwordHash,
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

  console.log(`✅ Аккаунты синхронизированы. Директор (логин): ${directorPhone}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

