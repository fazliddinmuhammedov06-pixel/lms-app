// Диагностика и исправление директора после fix-phone-normalize.js
// Запуск: node scripts/_fix-director-now.js
const fs = require('fs');
const bcrypt = require('bcryptjs');

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
console.log('DATABASE_URL host:', (url.match(/@([^:/]+)/) || [])[1] || '?');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_PHONE = '+998881060625';
const TARGET_PASSWORD = '20060625';

(async () => {
  try {
    console.log('\n=== ШАГ 1: Ищем все DIRECTOR аккаунты ===');
    const directors = await prisma.user.findMany({
      where: { role: 'DIRECTOR' },
      select: { id: true, phone: true, name: true, email: true, passwordHash: true, createdAt: true },
    });
    console.log(`Найдено DIRECTOR аккаунтов: ${directors.length}`);
    for (const d of directors) {
      const passOk = d.passwordHash ? await bcrypt.compare(TARGET_PASSWORD, d.passwordHash) : false;
      console.log(JSON.stringify({
        id: d.id,
        phone: d.phone,
        name: d.name,
        email: d.email,
        hasPasswordHash: !!d.passwordHash,
        passwordHash_preview: d.passwordHash ? d.passwordHash.substring(0, 20) + '...' : null,
        password_20060625_matches: passOk,
        createdAt: d.createdAt,
      }, null, 2));
    }

    console.log('\n=== ШАГ 2: Ищем пользователя по телефону +998881060625 ===');
    const byPhone = await prisma.user.findUnique({
      where: { phone: TARGET_PHONE },
      select: { id: true, phone: true, name: true, role: true, passwordHash: true },
    });
    if (byPhone) {
      const passOk = byPhone.passwordHash ? await bcrypt.compare(TARGET_PASSWORD, byPhone.passwordHash) : false;
      console.log('Найден:', JSON.stringify({
        id: byPhone.id,
        phone: byPhone.phone,
        name: byPhone.name,
        role: byPhone.role,
        hasPasswordHash: !!byPhone.passwordHash,
        password_20060625_matches: passOk,
      }, null, 2));
    } else {
      console.log('❌ Пользователь с телефоном +998881060625 НЕ НАЙДЕН!');
    }

    // ШАГ 3: Принимаем решение
    console.log('\n=== ШАГ 3: Исправление ===');

    // Ищем директора для исправления
    let directorToFix = directors.find(d => d.phone === TARGET_PHONE);
    if (!directorToFix && directors.length > 0) {
      // Директор есть, но с другим телефоном
      directorToFix = directors[0];
      console.log(`ℹ️  Директор найден с другим телефоном: "${directorToFix.phone}". Исправляем.`);
    }

    if (!directorToFix) {
      console.log('❌ Нет ни одного DIRECTOR аккаунта! Создать невозможно без seed.');
      process.exit(1);
    }

    // Проверяем конфликт: если TARGET_PHONE занят другим пользователем
    if (byPhone && byPhone.id !== directorToFix.id) {
      console.log(`⚠️  Телефон ${TARGET_PHONE} занят другим пользователем (role: ${byPhone.role}, id: ${byPhone.id}).`);
      console.log('Исправляем только пароль директора, телефон не меняем (конфликт).');
      const newHash = await bcrypt.hash(TARGET_PASSWORD, 10);
      await prisma.user.update({ where: { id: directorToFix.id }, data: { passwordHash: newHash } });
      console.log(`✅ Пароль директора (id: ${directorToFix.id}, phone: ${directorToFix.phone}) обновлён.`);
    } else {
      // Безопасно: обновляем телефон + пароль
      const newHash = await bcrypt.hash(TARGET_PASSWORD, 10);
      await prisma.user.update({
        where: { id: directorToFix.id },
        data: { phone: TARGET_PHONE, passwordHash: newHash },
      });
      console.log(`✅ Директор (id: ${directorToFix.id}) обновлён:`);
      console.log(`   phone: "${directorToFix.phone}" → "${TARGET_PHONE}"`);
      console.log(`   passwordHash: обновлён (пароль = ${TARGET_PASSWORD})`);
    }

    // ШАГ 4: Финальная проверка
    console.log('\n=== ШАГ 4: Финальная проверка ===');
    const finalUser = await prisma.user.findUnique({
      where: { phone: TARGET_PHONE },
      select: { id: true, phone: true, name: true, role: true, passwordHash: true },
    });
    if (finalUser) {
      const passNow = finalUser.passwordHash ? await bcrypt.compare(TARGET_PASSWORD, finalUser.passwordHash) : false;
      console.log(JSON.stringify({
        id: finalUser.id,
        phone: finalUser.phone,
        name: finalUser.name,
        role: finalUser.role,
        hasPasswordHash: !!finalUser.passwordHash,
        password_20060625_matches: passNow,
      }, null, 2));
      if (passNow && finalUser.role === 'DIRECTOR' && finalUser.phone === TARGET_PHONE) {
        console.log('\n🎉 УСПЕХ! Директор может войти по +998881060625 / 20060625');
      } else {
        console.log('\n❌ Что-то ещё не так, проверьте вывод выше.');
      }
    } else {
      console.log('❌ Пользователь с телефоном +998881060625 не найден после исправления!');
    }

  } catch (e) {
    console.error('❌ Ошибка:', e && e.message ? e.message : e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
