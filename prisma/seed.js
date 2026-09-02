const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Очистка БД...');
  const tables = [
    'notification', 'reward', 'grade', 'homeworkSubmission', 'homework', 'payment',
    'pushSubscription', 'discountRequest', 'attendanceRecord', 'starTransaction',
    'lesson', 'student', 'group', 'teacher', 'parent', 'otpCode', 'account', 'session', 'user', 'centerSettings'
  ];
  for (const t of tables) {
    if (prisma[t]) {
      try { await prisma[t].deleteMany({}); } catch (e) {}
    }
  }

  console.log('🌱 Создание настроек...');
  await prisma.centerSettings.create({
    data: {
      name: 'Friday Education LMS',
      phone: '+998 90 123 45 67',
      address: 'г. Ташкент, ул. Амира Темура 45',
    }
  });

  console.log('🌱 Создание пользователей...');
  const dir = await prisma.user.create({ data: { phone: '+998901234567', name: 'Абдуллаев Сардор', role: 'DIRECTOR', email: 'director@school.uz' } });
  const mgr = await prisma.user.create({ data: { phone: '+998905554433', name: 'Каримова Мадина', role: 'MANAGER', email: 'manager@school.uz' } });

  const tu1 = await prisma.user.create({ data: { phone: '+998907654321', name: 'Иванов Иван Иванович', role: 'TEACHER', email: 'ivanov@school.uz' } });
  const t1 = await prisma.teacher.create({ data: { userId: tu1.id, subject: 'Английский язык', salary: 4500000 } });

  const tu2 = await prisma.user.create({ data: { phone: '+998901111111', name: 'Петрова Анна Сергеевна', role: 'TEACHER', email: 'petrova@school.uz' } });
  const t2 = await prisma.teacher.create({ data: { userId: tu2.id, subject: 'Математика / IT', salary: 5000000 } });

  const pu1 = await prisma.user.create({ data: { phone: '+998909998877', name: 'Смирнов Андрей', role: 'PARENT', email: 'smirnov@mail.uz' } });
  const p1 = await prisma.parent.create({ data: { userId: pu1.id } });

  const pu2 = await prisma.user.create({ data: { phone: '+998902222222', name: 'Кузнецова Елена', role: 'PARENT', email: 'kuznetsova@mail.uz' } });
  const p2 = await prisma.parent.create({ data: { userId: pu2.id } });

  console.log('🌱 Создание групп...');
  const g1 = await prisma.group.create({ data: { name: 'Группа A1 - Начинающие', subject: 'Английский язык', level: 'A1 Beginner', teacherId: t1.id, room: 'Кабинет 101', monthlyPrice: 350000, status: 'ACTIVE' } });
  const g2 = await prisma.group.create({ data: { name: 'Группа B2 - Продвинутые', subject: 'Английский язык', level: 'B2 Upper-Int', teacherId: t1.id, room: 'Кабинет 102', monthlyPrice: 400000, status: 'ACTIVE' } });
  const g3 = await prisma.group.create({ data: { name: 'Группа C1 - IT & Python', subject: 'Программирование', level: 'Junior Python', teacherId: t2.id, room: 'Компьютерный класс 201', monthlyPrice: 450000, status: 'ACTIVE' } });

  console.log('🌱 Создание расписания (занятий)...');
  const l1 = await prisma.lesson.create({ data: { groupId: g1.id, dayOfWeek: 1, startTime: '10:00', endTime: '11:30', room: 'Кабинет 101', status: 'COMPLETED' } });
  const l2 = await prisma.lesson.create({ data: { groupId: g1.id, dayOfWeek: 3, startTime: '10:00', endTime: '11:30', room: 'Кабинет 101', status: 'SCHEDULED' } });
  const l3 = await prisma.lesson.create({ data: { groupId: g2.id, dayOfWeek: 2, startTime: '14:00', endTime: '15:30', room: 'Кабинет 102', status: 'SCHEDULED' } });
  const l4 = await prisma.lesson.create({ data: { groupId: g3.id, dayOfWeek: 4, startTime: '16:00', endTime: '17:30', room: 'Компьютерный класс 201', status: 'SCHEDULED' } });

  console.log('🌱 Создание учеников...');
  const s1 = await prisma.student.create({ data: { name: 'Смирнов Алексей', parentId: p1.id, groupId: g1.id, stars: 320, phone: '+998909990001', parentPhone: pu1.phone, birthDate: '2012-05-14', subject: 'Английский язык', status: 'ACTIVE' } });
  const s2 = await prisma.student.create({ data: { name: 'Смирнова Мария', parentId: p1.id, groupId: g2.id, stars: 200, phone: '+998909990002', parentPhone: pu1.phone, birthDate: '2014-08-20', subject: 'Английский язык', status: 'ACTIVE' } });
  const s3 = await prisma.student.create({ data: { name: 'Кузнецова Мария', parentId: p2.id, groupId: g2.id, stars: 520, phone: '+998902220001', parentPhone: pu2.phone, birthDate: '2011-03-10', subject: 'Английский язык', status: 'ACTIVE' } });
  const s4 = await prisma.student.create({ data: { name: 'Петров Дмитрий', parentId: p2.id, groupId: g3.id, stars: 180, phone: '+998902220002', parentPhone: pu2.phone, birthDate: '2010-11-25', subject: 'Программирование', status: 'ACTIVE' } });
  const s5 = await prisma.student.create({ data: { name: 'Иванова Анна', parentId: p2.id, groupId: g1.id, stars: 320, phone: '+998902220003', parentPhone: pu2.phone, birthDate: '2013-01-18', subject: 'Английский язык', status: 'ACTIVE' } });

  console.log('🌱 Создание транзакций звезд...');
  await prisma.starTransaction.createMany({
    data: [
      { studentId: s1.id, amount: 500, reason: 'ДЗ', teacherId: t1.id, createdAt: new Date('2026-08-10') },
      { studentId: s1.id, amount: 350, reason: 'Активность', teacherId: t1.id, createdAt: new Date('2026-08-12') },
      { studentId: s1.id, amount: -250, reason: 'Обмен на скидку 5%', teacherId: t1.id, createdAt: new Date('2026-08-24') },
      { studentId: s1.id, amount: -280, reason: 'Мерч центра', teacherId: t1.id, createdAt: new Date('2026-08-25') },
      { studentId: s2.id, amount: 450, reason: 'Тесты', teacherId: t1.id, createdAt: new Date('2026-08-15') },
      { studentId: s2.id, amount: -250, reason: 'Обмен на скидку 5%', teacherId: t1.id, createdAt: new Date('2026-08-25') },
      { studentId: s3.id, amount: 1000, reason: 'Хакатон Friday Pro', teacherId: t1.id, createdAt: new Date('2026-08-05') },
      { studentId: s3.id, amount: 200, reason: 'Разговорный клуб', teacherId: t1.id, createdAt: new Date('2026-08-08') },
      { studentId: s3.id, amount: -450, reason: 'Обмен на скидку 10%', teacherId: t1.id, createdAt: new Date('2026-08-25') },
      { studentId: s3.id, amount: -230, reason: 'Стикерпаки', teacherId: t1.id, createdAt: new Date('2026-08-26') },
      { studentId: s4.id, amount: 450, reason: 'Программирование', teacherId: t1.id, createdAt: new Date('2026-08-18') },
      { studentId: s4.id, amount: -270, reason: 'Аренда VR-очков', teacherId: t1.id, createdAt: new Date('2026-08-22') },
      { studentId: s5.id, amount: 320, reason: 'Стабильные ДЗ', teacherId: t1.id, createdAt: new Date('2026-08-20') },
    ],
  });

  console.log('🌱 Создание заявок и посещаемости...');
  await prisma.discountRequest.create({ data: { studentId: s1.id, discountPercent: 5, starsCost: 250, status: 'PENDING', createdAt: new Date('2026-08-24T14:30:00') } });
  await prisma.discountRequest.create({ data: { studentId: s3.id, discountPercent: 10, starsCost: 450, status: 'PENDING', createdAt: new Date('2026-08-25T09:15:00') } });
  await prisma.discountRequest.create({ data: { studentId: s2.id, discountPercent: 5, starsCost: 250, status: 'APPROVED', createdAt: new Date('2026-08-25T10:00:00'), resolvedAt: new Date('2026-08-25T12:00:00'), resolvedBy: dir.id } });

  const d1 = new Date('2026-08-20'); d1.setHours(0,0,0,0);
  const d2 = new Date('2026-08-24'); d2.setHours(0,0,0,0);
  await prisma.attendanceRecord.createMany({
    data: [
      { studentId: s1.id, lessonId: l1.id, date: d1, status: 'ABSENT' },
      { studentId: s1.id, lessonId: l1.id, date: d2, status: 'ABSENT' },
    ],
  });

  console.log('✅ База данных Friday Education LMS успешно инициализирована!');
}

main().catch((e) => { console.error('Ошибка сидинга БД:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
