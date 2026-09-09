// ВРЕМЕННЫЙ скрипт (удаляется после использования).
// Удаляет тестовый PARENT-аккаунт "Muhammedov" (+998881060625) и всё,
// что каскадно с ним связано (Parent-запись, студента Fazliddinn и его данные).
// Одобрено владельцем: аккаунт тестовый.

const fs = require('fs');
const bcrypt = require('bcryptjs');

// Копия loadEnvFile из scripts/update-director-credentials.js (см. там почему
// require('@prisma/client') должен идти после загрузки env).
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
  console.error('❌ DATABASE_URL не указывает на PostgreSQL:', url || '(не задано)');
  process.exit(1);
}

const p = new PrismaClient();
const PARENT_PHONE = '+998881060625';

(async () => {
  try {
    const parentUser = await p.user.findUnique({ where: { phone: PARENT_PHONE } });
    if (!parentUser) {
      console.error(`❌ Аккаунт с телефоном ${PARENT_PHONE} не найден. Удалять нечего.`);
      return;
    }
    if (parentUser.role !== 'PARENT') {
      console.error(`❌ У пользователя ${parentUser.id} роль ${parentUser.role}, а ожидалась PARENT. Остановлено.`);
      return;
    }

    const directors = await p.user.findMany({ where: { role: 'DIRECTOR' }, select: { id: true, phone: true, name: true } });
    console.log('=== DIRECTOR accounts (до удаления) ===');
    console.log(JSON.stringify(directors, null, 2));

    const parentRec = await p.parent.findUnique({
      where: { userId: parentUser.id },
      select: { id: true, students: { select: { id: true, name: true, phone: true, parentPhone: true } } },
    });

    console.log(`=== ЧТО БУДЕТ УДАЛЕНО (родитель ${parentUser.id} "${parentUser.name}") ===`);
    const studentIds = parentRec ? parentRec.students.map((s) => s.id) : [];
    console.log('Students:', JSON.stringify(studentIds));

    for (const sid of studentIds) {
      const counts = {};
      for (const [model, f] of [
        ['attendanceRecord', () => p.attendanceRecord.count({ where: { studentId: sid } })],
        ['starTransaction', () => p.starTransaction.count({ where: { studentId: sid } })],
        ['discountRequest', () => p.discountRequest.count({ where: { studentId: sid } })],
        ['payment', () => p.payment.count({ where: { studentId: sid } })],
        ['homeworkSubmission', () => p.homeworkSubmission.count({ where: { studentId: sid } })],
        ['grade', () => p.grade.count({ where: { studentId: sid } })],
      ]) {
        try { counts[model] = await f(); } catch { counts[model] = 'n/a'; }
      }
      console.log(`  student ${sid}:`, JSON.stringify(counts));
    }

    console.log('=== Выполняю удаление ===');
    const before = await p.user.count();
    await p.user.delete({ where: { id: parentUser.id } });
    const after = await p.user.count();
    console.log(`✅ Пользователь ${parentUser.id} удалён. user.count: ${before} -> ${after}`);
  } finally {
    await p.$disconnect();
  }
})().catch((e) => {
  console.error('❌ Ошибка:', (e && e.message) || e);
  process.exit(1);
});