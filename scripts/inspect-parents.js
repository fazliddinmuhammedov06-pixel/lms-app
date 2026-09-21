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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const parents = await prisma.user.findMany({
    where: { role: 'PARENT' },
    select: { id: true, name: true, phone: true }
  });
  console.log('Total parents in DB:', parents.length);
  for (const u of parents) {
    const parentRec = await prisma.parent.findUnique({
      where: { userId: u.id },
      include: { students: true }
    });
    const byParentPhone = await prisma.student.findMany({
      where: { parentPhone: u.phone }
    });
    const byPhone = await prisma.student.findMany({
      where: { phone: u.phone }
    });
    console.log({
      phone: u.phone,
      name: u.name,
      parentRecordExists: !!parentRec,
      parentRecordId: parentRec?.id,
      linkedStudentsViaParentId: parentRec?.students?.map(s => ({ id: s.id, name: s.name, parentPhone: s.parentPhone, phone: s.phone })) || [],
      studentsWithParentPhone: byParentPhone.map(s => ({ id: s.id, name: s.name, parentId: s.parentId })),
      studentsWithPhone: byPhone.map(s => ({ id: s.id, name: s.name, parentId: s.parentId }))
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

