// ВРЕМЕННАЯ проверка (удаляется после использования).
const fs = require('fs');
const bcrypt = require('bcryptjs');

function loadEnvFile(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) { /* env-файл может отсутствовать */ }
}
loadEnvFile('.env.production.local');
loadEnvFile('.env.local');

const { PrismaClient } = require('@prisma/client');

const url = process.env.DATABASE_URL || '';
if (!/^postgres(ql)?:\/\//i.test(url)) {
  console.error('❌ DATABASE_URL не указывает на PostgreSQL:', url);
  process.exit(1);
}
console.log('DATABASE_URL host:', (url.match(/@([^:\/]+)/) || [])[1] || '?');

const p = new PrismaClient();

(async () => {
  try {
    const directors = await p.user.findMany({ where: { role: 'DIRECTOR' }, select: { id: true, phone: true, name: true, passwordHash: true } });
    console.log('=== DIRECTOR accounts ===');
    for (const d of directors) {
      const passOk = d.passwordHash ? await bcrypt.compare('20060625', d.passwordHash) : false;
      console.log(JSON.stringify({ id: d.id, phone: d.phone, name: d.name, hasPasswordHash: !!d.passwordHash, passwordMatches_20060625: passOk }));
    }

    const remMuhammedov = await p.user.count({ where: { OR: [{ phone: '+998881060625' }, { name: 'Muhammedov' }] } });
    const remStudent = await p.student.count({ where: { name: 'Fazliddinn' } });
    const remParentRec = await p.parent.count({ where: { userId: { not: undefined } } });
    console.log('Осталось пользователей с телефоном/именем Muhammedov:', remMuhammedov);
    console.log('Осталось студентов Fazliddinn:', remStudent);
    console.log('Старый телефон +998901234567 ещё занят юзером:', await p.user.count({ where: { phone: '+998901234567' } }));
    console.log('Всего пользователей:', await p.user.count());
  } finally {
    await p.$disconnect();
  }
})().catch((e) => {
  console.error('❌ Ошибка:', (e && e.message) || e);
  process.exit(1);
});