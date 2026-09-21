// Скрипт нормализации телефонов в БД: приводит все User.phone к формату +998XXXXXXXXX
// Также нормализует Student.parentPhone
const fs = require('fs');

function loadEnvFile(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {}
}
loadEnvFile('.env.production.local');
loadEnvFile('.env.local');

const url = process.env.DATABASE_URL || '';
if (!/^postgres(ql)?:\/\//i.test(url)) {
  console.error('❌ DATABASE_URL не указывает на PostgreSQL:', url || '(не задано)');
  process.exit(1);
}
console.log('DATABASE_URL host:', (url.match(/@([^:\/]+)/) || [])[1] || '?');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UZ_PHONE_REGEX = /^\+9989\d{8}$/;

function normalizePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  // Если 9 цифр — добавляем 998
  if (digits.length === 9) return '+998' + digits;
  // Если 12 цифр начинающихся с 998
  if (digits.length === 12 && digits.startsWith('998')) return '+' + digits;
  // Если 13 цифр начинающихся с 998 (с ведущим +)
  if (digits.length === 13 && digits.startsWith('998')) return '+' + digits.slice(1);
  return null;
}

async function main() {
  // 1. Нормализуем User.phone
  const users = await prisma.user.findMany({ select: { id: true, phone: true, name: true, role: true } });
  console.log(`\nВсего пользователей: ${users.length}`);
  let userFixed = 0;
  for (const u of users) {
    const norm = normalizePhone(u.phone);
    if (!norm) {
      console.warn(`  ⚠️ Не удалось нормализовать User[${u.role}] phone="${u.phone}" (${u.name})`);
      continue;
    }
    if (norm !== u.phone) {
      // Проверяем, нет ли уже пользователя с таким нормализованным телефоном
      const existing = await prisma.user.findUnique({ where: { phone: norm } });
      if (existing && existing.id !== u.id) {
        console.warn(`  ⚠️ Конфликт: User "${norm}" уже существует (id: ${existing.id}). Пропускаем ${u.id}`);
        continue;
      }
      await prisma.user.update({ where: { id: u.id }, data: { phone: norm } });
      console.log(`  ✅ User[${u.role}] "${u.phone}" → "${norm}" (${u.name})`);
      userFixed++;
    }
  }
  console.log(`\nИсправлено User.phone: ${userFixed}`);

  // 2. Нормализуем Student.parentPhone
  const students = await prisma.student.findMany({ select: { id: true, phone: true, parentPhone: true, name: true } });
  console.log(`\nВсего учеников: ${students.length}`);
  let stFixed = 0;
  for (const s of students) {
    const patch = {};
    if (s.parentPhone) {
      const norm = normalizePhone(s.parentPhone);
      if (norm && norm !== s.parentPhone) {
        patch.parentPhone = norm;
        console.log(`  ✅ Student[${s.name}].parentPhone "${s.parentPhone}" → "${norm}"`);
      } else if (!norm) {
        console.warn(`  ⚠️ Не удалось нормализовать Student[${s.name}].parentPhone="${s.parentPhone}"`);
      }
    }
    if (s.phone) {
      const norm = normalizePhone(s.phone);
      if (norm && norm !== s.phone) {
        patch.phone = norm;
        console.log(`  ✅ Student[${s.name}].phone "${s.phone}" → "${norm}"`);
      } else if (!norm) {
        console.warn(`  ⚠️ Не удалось нормализовать Student[${s.name}].phone="${s.phone}"`);
      }
    }
    if (Object.keys(patch).length > 0) {
      await prisma.student.update({ where: { id: s.id }, data: patch });
      stFixed++;
    }
  }
  console.log(`\nИсправлено Student записей: ${stFixed}`);
  console.log('\n🎉 Нормализация завершена!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
