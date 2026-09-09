// Одноразовый скрипт починки аккаунтов, созданных до введения единой нормализации телефона.
//
// Причина проблемы: раньше createStudent/createTeacher сохраняли телефон в БД ровно так,
// как его ввёл директор (без плюса, с пробелами/дефисами и т.п.), а логин (lib/auth.ts)
// ищет пользователя по каноническому виду "+998XXXXXXXXX". В результате аккаунт создавался,
// но войти под ним было нельзя.
//
// Скрипт приводит телефоны к каноническому виду во всех записях. Идемпотентен — повторный
// запуск безопасен. При конфликте (два номера нормализуются в один) проблема выводится в лог,
// запись не меняется (иначе нарушится уникальный индекс User.phone).
//
// Запуск: node scripts/fix-phone-formats.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function normalizePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) return '+' + digits;
  if (digits.length === 9) return '+998' + digits;
  return null;
}

const UZ_PHONE_REGEX = /^\+998\d{9}$/;

async function main() {
  console.log('🔧 Нормализация телефонов в User...');
  const users = await prisma.user.findMany({ select: { id: true, phone: true } });
  const seen = new Map(); // канонический телефон -> исходный телефон

  for (const u of users) {
    const norm = normalizePhone(u.phone);
    if (!norm || !UZ_PHONE_REGEX.test(norm)) {
      console.log(`⚠️ Не удалось нормализовать: User ${u.id} phone="${u.phone}"`);
      continue;
    }
    if (norm === u.phone) continue;

    if (seen.has(norm)) {
      console.log(`⚠️ Конфликт: "${u.phone}" и "${seen.get(norm)}" оба дают "${norm}" — запись не тронута`);
      continue;
    }
    seen.set(norm, u.phone);

    try {
      await prisma.user.update({ where: { id: u.id }, data: { phone: norm } });
      console.log(`✅ User ${u.id}: "${u.phone}" -> "${norm}"`);
    } catch (e) {
      console.log(`❌ User ${u.id} ("${u.phone}"): ${e.message}`);
    }
  }

  console.log('\n🔧 Нормализация телефонов в Student (phone / parentPhone)...');
  const students = await prisma.student.findMany({ select: { id: true, phone: true, parentPhone: true } });
  for (const s of students) {
    const patch = {};
    if (s.phone) {
      const norm = normalizePhone(s.phone);
      if (norm && UZ_PHONE_REGEX.test(norm) && norm !== s.phone) patch.phone = norm;
    }
    if (s.parentPhone) {
      const norm = normalizePhone(s.parentPhone);
      if (norm && UZ_PHONE_REGEX.test(norm) && norm !== s.parentPhone) patch.parentPhone = norm;
    }
    if (Object.keys(patch).length) {
      await prisma.student.update({ where: { id: s.id }, data: patch });
      console.log(`✅ Student ${s.id}: ${JSON.stringify(patch)}`);
    }
  }

  console.log('\nГотово. Проверьте строки с ⚠️/❌ и повторите попытку входа.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());