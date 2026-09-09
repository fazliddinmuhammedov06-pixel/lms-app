// Одноразовый скрипт: устанавливает телефон (логин) и пароль аккаунта ДИРЕКТОРА в БД.
//
// Применяется к той БД, на которую указывает DATABASE_URL. ДЛЯ ПРОДА: DATABASE_URL
// должен указывать на продовый PostgreSQL (например, лежать в .env.production.local).
//
// Значения берутся из переменных окружения (приоритет: уже установленные process.env
// > .env.production.local > .env.local):
//   DIRECTOR_PHONE    - новый телефон директора (логин), напр. "+998881060625"
//   DIRECTOR_PASSWORD - новый пароль директора
//
// Скрипт меняет ВСЕ аккаунты с ролью DIRECTOR (обычно их один). Телефон нормализуется
// к виду +998XXXXXXXXX (как при логине в lib/auth.ts). Пароль хэшируется bcrypt
// (cost=10), как в lib/auth.ts и prisma/seed.js. При конфликте уникального индекса
// User.phone скрипт останавливается с понятной ошибкой БЕЗ каких-либо изменений.
//
// Запуск: node scripts/update-director-credentials.js

const fs = require('fs');
const bcrypt = require('bcryptjs');

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

// ВАЖНО: @prisma/client при импорте САМ подгружает корневой .env
// ("schemaEnvPath" в сгенерированном клиенте указывает на ../../../.env,
// где лежит DATABASE_URL="file:./dev.db"). Поэтому require() должен идти
// ПОСЛЕ loadEnvFile(): иначе dev-URL перекроет продовый (loadEnvFile не
// перезаписывает уже установленные process.env). Prisma тоже не затрёт
// уже установленные переменные (dotenv-семантика).
const { PrismaClient } = require('@prisma/client');

// Канонический вид телефона, как в lib/phone.ts / lib/auth.ts: +998XXXXXXXXX.
function normalizePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (!digits.startsWith('998')) return null;
  const norm = '+' + digits;
  return /^\+998\d{9}$/.test(norm) ? norm : null;
}

async function main() {
  const phone = normalizePhone(process.env.DIRECTOR_PHONE);
  const password = process.env.DIRECTOR_PASSWORD;

  if (!phone) {
    console.error('❌ DIRECTOR_PHONE не задан или не похож на узбекский номер (+998XXXXXXXXX).');
    process.exitCode = 1;
    return;
  }
  if (!password) {
    console.error('❌ DIRECTOR_PASSWORD не задан.');
    process.exitCode = 1;
    return;
  }

  const url = process.env.DATABASE_URL || '';
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    console.error('❌ DATABASE_URL не указывает на PostgreSQL. Скрипт НИЧЕГО не менял.');
    console.error('   Текущее значение DATABASE_URL:', url || '(не задано)');
    console.error('   Для прода укажите продовый DATABASE_URL (напр. в .env.production.local)');
    console.error('   и запустите скрипт заново.');
    process.exitCode = 1;
    return;
  }

  let prisma;
  try {
    prisma = new PrismaClient();
  } catch (e) {
    console.error('❌ Ошибка инициализации Prisma Client:', (e && e.message) || e);
    process.exitCode = 1;
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const directors = await prisma.user.findMany({
      where: { role: 'DIRECTOR' },
      select: { id: true, phone: true, name: true },
    });

    if (!directors.length) {
      console.error('❌ В БД не найден ни один пользователь с ролью DIRECTOR. Скрипт НИЧЕГО не менял.');
      process.exitCode = 1;
      return;
    }

    // Номер уже у директора — достаточно обновить пароль.
    if (directors.some((d) => d.phone === phone)) {
      for (const d of directors.filter((x) => x.phone === phone)) {
        await prisma.user.update({ where: { id: d.id }, data: { passwordHash } });
        console.log(`✅ DIRECTOR ${d.id} (${d.name}): пароль обновлён, телефон уже ${phone}`);
      }
    } else {
      // Телефон меняется: проверяем, что его не занимает другой пользователь (User.phone уникален).
      const owner = await prisma.user.findUnique({ where: { phone } });
      if (owner) {
        console.error(`❌ Телефон ${phone} уже занят пользователем ${owner.id} (роль: ${owner.role}).`);
        console.error('   Скрипт остановлен БЕЗ изменений.');
        process.exitCode = 1;
        return;
      }
      for (const d of directors) {
        await prisma.user.update({ where: { id: d.id }, data: { phone, passwordHash } });
        console.log(`✅ DIRECTOR ${d.id} (${d.name}): телефон ${d.phone} -> ${phone}, пароль обновлён`);
      }
    }

    console.log('✅ Готово. Логин директора: ' + phone + ' (пароль — из DIRECTOR_PASSWORD).');
  } catch (e) {
    console.error('❌ Ошибка при обновлении:', (e && e.message) || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main();