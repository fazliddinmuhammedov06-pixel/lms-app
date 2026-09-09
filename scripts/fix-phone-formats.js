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
// Устойчивость: скрипт не падает целиком при проблемах с отдельными записями или таблицами —
// проблемные записи пропускаются с логом (⚠️/❌), остальные обрабатываются. Если движок Prisma
// не смог инициализировать соединение с БД (например, "Validation Error Count: 1" из-за
// несоответствия provider в schema.prisma и DATABASE_URL в .env), выводится диагностика
// и скрипт завершается с кодом 1, но без стек-трейса посреди работы.
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

// Человекочитаемый текст ошибки (у Prisma-ошибок это e.message).
function errText(e) {
  return e && e.message ? e.message : String(e);
}

// Ошибка инициализации datasource ("Validation Error Count: 1") — это не битая запись,
// а несоответствие конфигурации: движок не может даже открыть соединение с БД.
function isDatasourceError(e) {
  return /datasource|Validation Error Count|must start with the protocol/i.test(errText(e));
}

// Чтение таблицы с защитой: при ошибке логируем и возвращаем null вместо падения всего скрипта.
async function readTable(label, query, stats, countField) {
  try {
    const rows = await query();
    stats[countField] = rows.length;
    return rows;
  } catch (e) {
    stats.readErrors = true;
    console.error(`❌ Не удалось прочитать таблицу ${label}:\n${errText(e)}`);
    if (isDatasourceError(e)) stats.datasourceBroken = true;
    return null;
  }
}

async function main() {
  const stats = {
    userCount: 0,
    userNormalized: 0,
    userConflicts: 0,
    userSkipped: 0,
    userErrors: 0,
    studentCount: 0,
    studentNormalized: 0,
    studentErrors: 0,
    readErrors: false,
    datasourceBroken: false,
  };

  console.log('🔧 Нормализация телефонов в User...');
  const users = await readTable(
    'User',
    () => prisma.user.findMany({ select: { id: true, phone: true } }),
    stats,
    'userCount'
  );

  if (users) {
    const seen = new Map(); // канонический телефон -> исходный телефон
    for (const u of users) {
      const norm = normalizePhone(u.phone);
      if (!norm || !UZ_PHONE_REGEX.test(norm)) {
        stats.userSkipped++;
        console.log(`⚠️ Не удалось нормализовать (пропуск): User ${u.id} phone="${u.phone}"`);
        continue;
      }
      if (norm === u.phone) continue;

      if (seen.has(norm)) {
        stats.userConflicts++;
        console.log(`⚠️ Конфликт: "${u.phone}" и "${seen.get(norm)}" оба дают "${norm}" — запись не тронута`);
        continue;
      }
      seen.set(norm, u.phone);

      try {
        await prisma.user.update({ where: { id: u.id }, data: { phone: norm } });
        stats.userNormalized++;
        console.log(`✅ User ${u.id}: "${u.phone}" -> "${norm}"`);
      } catch (e) {
        stats.userErrors++;
        console.log(`❌ User ${u.id} ("${u.phone}"): ${errText(e)}`);
      }
    }
  }

  console.log('\n🔧 Нормализация телефонов в Student (phone / parentPhone)...');
const students = await readTable(
    'Student',
    () => prisma.student.findMany({ select: { id: true, phone: true, parentPhone: true } }),
    stats,
    'studentCount'
  );

  if (students) {
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
      if (!Object.keys(patch).length) continue;

      try {
        await prisma.student.update({ where: { id: s.id }, data: patch });
        stats.studentNormalized++;
        console.log(`✅ Student ${s.id}: ${JSON.stringify(patch)}`);
      } catch (e) {
        stats.studentErrors++;
        console.log(`❌ Student ${s.id}: ${errText(e)}`);
      }
    }
  }

  console.log('\n📊 Итог:');
  console.log(`  User:    всего ${stats.userCount}, нормализовано ${stats.userNormalized}, конфликтов ${stats.userConflicts}, пропущено ${stats.userSkipped}, ошибок записи ${stats.userErrors}`);
  console.log(`  Student: всего ${stats.studentCount}, нормализовано ${stats.studentNormalized}, ошибок записи ${stats.studentErrors}`);

  if (stats.datasourceBroken) {
    console.error('\n⚠️ Движок Prisma не смог инициализировать соединение с БД.');
    console.error('   schema.prisma объявляет provider = "postgresql", а DATABASE_URL в .env указывает на SQLite-файл (file:./dev.db).');
    console.error('   Движок Prisma требует, чтобы URL соответствовал provider, и отклоняет запрос ещё до обращения к данным.');
    console.error('   Варианты исправления:');
    console.error('     1) Укажите в DATABASE_URL корректный PostgreSQL URL (postgresql://user:pass@host:port/db).');
    console.error('     2) Если локально работаете на SQLite — поменяйте в schema.prisma provider на "sqlite" и выполните: npx prisma generate');
  } else if (stats.readErrors) {
    console.error('\n⚠️ Некоторые таблицы не удалось прочитать — см. строки с ❌ выше, остальные операции выполнены.');
  }

  console.log('\nГотово. Проверьте строки с ⚠️/❌ и повторите попытку входа.');

  return stats;
}

let exitCode = 0;
main()
  .then((s) => {
    // Не смогли инициализировать соединение с БД — завершаемся с ненулевым кодом,
    // но без падения посреди работы и без стек-трейса.
    if (s.datasourceBroken) exitCode = 1;
  })
  .catch((e) => {
    exitCode = 1;
    console.error(`❌ Непредвиденная ошибка:\n${errText(e)}`);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // не мешаем завершению скрипта
    }
    if (exitCode) process.exit(exitCode);
  });