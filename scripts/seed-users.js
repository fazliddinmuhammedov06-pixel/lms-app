const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const plainPassword = '123456';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const users = [
    {
      phone: '+998901234567',
      name: 'Директор Центра',
      role: 'DIRECTOR',
    },
    {
      phone: '+998907654321',
      name: 'Учитель Иванов',
      role: 'TEACHER',
    },
    {
      phone: '+998909998877',
      name: 'Родитель Смирнов',
      role: 'PARENT',
    },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { phone: u.phone },
      update: {
        role: u.role,
        name: u.name,
        passwordHash: passwordHash,
      },
      create: {
        phone: u.phone,
        name: u.name,
        role: u.role,
        passwordHash: passwordHash,
      },
    });

    if (u.role === 'TEACHER') {
      await prisma.teacher.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    } else if (u.role === 'PARENT') {
      await prisma.parent.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    }
  }

  console.log('✅ Тестовые аккаунты успешно созданы/обновлены!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
