// Скрипт для исправления уровня группы "SAT" в БД
// Убирает захардкоженный "A1 Beginner" у групп, где название содержит "SAT"
// или у которых level === 'A1 Beginner' и subject != 'Английский язык'

const { PrismaClient } = require('@prisma/client');

const DATABASE_URL_FALLBACK =
  'postgres://eae02dcf2d95e94c2c023bce333134c642243bb62b963fdf44405bbcc8100699:sk_kCspFpwltkXQMlHhlkOFw@db.prisma.io:5432/postgres?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL || DATABASE_URL_FALLBACK },
  },
});

async function main() {
  // Найдём все группы с названием SAT
  const satGroups = await prisma.group.findMany({
    where: {
      name: { contains: 'SAT' },
    },
  });

  console.log(`Найдено групп с "SAT" в названии: ${satGroups.length}`);
  satGroups.forEach((g) => {
    console.log(`  - id: ${g.id}, name: "${g.name}", subject: "${g.subject}", level: "${g.level}"`);
  });

  if (satGroups.length > 0) {
    // Обновим level на null для всех SAT-групп, у которых стоит A1 Beginner
    const updated = await prisma.group.updateMany({
      where: {
        name: { contains: 'SAT' },
        level: 'A1 Beginner',
      },
      data: {
        level: null,
      },
    });
    console.log(`\nОбновлено записей: ${updated.count}`);
  }

  // Также проверим все группы с level = 'A1 Beginner' и subject != Английский язык
  const wrongLevel = await prisma.group.findMany({
    where: {
      level: 'A1 Beginner',
      NOT: {
        subject: { contains: 'Английский' },
      },
    },
  });

  if (wrongLevel.length > 0) {
    console.log(`\nГруппы с неподходящим уровнем "A1 Beginner" (не английский язык):`);
    wrongLevel.forEach((g) => {
      console.log(`  - id: ${g.id}, name: "${g.name}", subject: "${g.subject}", level: "${g.level}"`);
    });

    const updated2 = await prisma.group.updateMany({
      where: {
        level: 'A1 Beginner',
        NOT: {
          subject: { contains: 'Английский' },
        },
      },
      data: {
        level: null,
      },
    });
    console.log(`Дополнительно обновлено: ${updated2.count} записей`);
  }

  console.log('\n✅ Готово!');
}

main()
  .catch((e) => {
    console.error('Ошибка:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
