// Одноразовый скрипт починки User.name, оставшихся после импорта данных.
//
// Проблема: у части аккаунтов РОДИТЕЛЕЙ/УЧЕНИКОВ (и возможно других ролей) в
// User.name лежат бессмысленные значения "." или "," (иногда пустая строка или
// слово-заглушка "Majburiy"). В сайдбаре такое имя отображалось как точка.
//
// Скрипт заменяет «мусорные» имена на осмысленные:
//   - PARENT: имя первого привязанного ученика (Student.name);
//   - STUDENT: имя студента, найденного по телефону аккаунта (или первого из привязанных);
//   - прочие роли: «Пользователь».
// Если привязанных данных нет, используется «Пользователь».
//
// Идемпотентен. Безопасный режим: node scripts/fix-junk-names.js --dry — только
// выводит план изменений, ничего не пишет. Применение: node scripts/fix-junk-names.js.
//
// Внимание: реальные ФИО родителей неизвестны — имя берётся от ученика; если это
// нежелательно, можно не запускать (UI всё равно показывает fallback «Пользователь»).

const fs = require('fs');

function loadEnvFile(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) { /* no env file */ }
}
loadEnvFile('.env.production.local');
loadEnvFile('.env.local');
console.log('DATABASE_URL scheme:', (process.env.DATABASE_URL || '').slice(0, 12));

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Копия логики lib/name.ts (JS-скрипты не подключают TS-модули напрямую).
const ONLY_PUNCT_OR_SPACES = /^[\s\p{P}\p{S}]+$/u;
const PLACEHOLDER_WORDS = new Set(['majburiy', 'required', 'name', 'fio', 'default', 'test', 'тест']);
function isMeaningfulName(name) {
  const trimmed = (name ?? '').trim();
  if (trimmed.length < 2) return false;
  if (ONLY_PUNCT_OR_SPACES.test(trimmed)) return false;
  const alnum = trimmed.replace(/[^\p{L}\p{N}]/gu, '');
  if (alnum.length < 2) return false;
  const words = trimmed.toLowerCase().split(/\s+/);
  if (words.length > 0 && words.every((w) => PLACEHOLDER_WORDS.has(w))) return false;
  return true;
}

const DRY = process.argv.includes('--dry');

(async () => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, phone: true, name: true, role: true },
    });
    const junk = users.filter((u) => !isMeaningfulName(u.name));
    console.log(`\nВсего пользователей: ${users.length}; с «мусорным» именем: ${junk.length}\n`);

    if (junk.length === 0) {
      console.log('✅ Мусорных имён нет — ничего делать не нужно.');
      return;
    }

    const planned = [];

    for (const u of junk) {
      let newName = null;

      if (u.role === 'PARENT') {
        const parent = await prisma.parent.findUnique({
          where: { userId: u.id },
          select: { students: { select: { name: true } } },
        });
        const names = (parent?.students || []).map((s) => (s.name || '').trim()).filter((n) => isMeaningfulName(n));
        newName = names[0] || 'Пользователь';
      } else if (u.role === 'STUDENT' && u.phone) {
        const st = await prisma.student.findFirst({
          where: { phone: u.phone },
          select: { name: true },
        });
        newName = (st?.name || '').trim() || 'Пользователь';
      } else {
        newName = 'Пользователь';
      }

      if (newName !== u.name) {
        planned.push({ id: u.id, role: u.role, phone: u.phone, from: u.name, to: newName });
      }
    }

    if (planned.length === 0) {
      console.log('Мусорные имена уже совпадают с целевыми — менять нечего.');
      return;
    }

    for (const p of planned) {
      console.log(`${p.role}\t${p.phone}\t"${p.from}" → "${p.to}"`);
    }

    if (DRY) {
      console.log(`\n--dry: применено не было. Запустите без флага --dry, чтобы записать ${planned.length} изменений.`);
      return;
    }

    let updated = 0;
    for (const p of planned) {
      await prisma.user.update({ where: { id: p.id }, data: { name: p.to } });
      updated++;
    }
    console.log(`\n✅ Обновлено имён: ${updated}`);
  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error('Ошибка:', e.message || e);
  process.exitCode = 1;
});