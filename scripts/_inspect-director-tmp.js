// Временный диагностический скрипт (удаляется после использования).
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  try {
    const directors = await p.user.findMany({
      where: { role: 'DIRECTOR' },
      select: { id: true, phone: true, name: true, email: true, createdAt: true },
    });
    console.log('=== DIRECTOR accounts ===');
    console.log(JSON.stringify(directors, null, 2));

    const owner = await p.user.findUnique({
      where: { phone: '+998881060625' },
      select: { id: true, phone: true, name: true, email: true, role: true, passwordHash: true, createdAt: true },
    });
    console.log('=== OWNER of +998881060625 (hasPassword: ' + (!!(owner && owner.passwordHash)) + ') ===');
    console.log(JSON.stringify(owner, null, 2));

    if (owner) {
      const parent = await p.parent.findUnique({ where: { userId: owner.id }, select: { id: true, students: { select: { id: true, name: true, phone: true, parentPhone: true } } } });
      console.log('=== Parent record / students ===');
      console.log(JSON.stringify(parent, null, 2));
    }

    // Свободен ли старый телефон директора для "обмена"?
    const oldPhoneUsers = await p.user.findUnique({ where: { phone: '+998901234567' } });
    const oldPhoneStudents = await p.student.count({ where: { OR: [{ phone: '+998901234567' }, { parentPhone: '+998901234567' }] } });
    console.log('=== Old director phone +998901234567 ===');
    console.log('user.phone:', JSON.stringify(oldPhoneUsers ? { id: oldPhoneUsers.id, role: oldPhoneUsers.role } : null));
    console.log('students with phone/parentPhone = +998901234567:', oldPhoneStudents);
  } finally {
    await p.$disconnect();
  }
})();