const fs = require('fs');

function loadEnvFile(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {}
}

loadEnvFile('.env.production.local');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { chromium } = require('playwright');

async function main() {
  console.log('--- STEP 1: CLEANING UP DB ENTRY ---');
  const existingUser = await prisma.user.findUnique({
    where: { phone: '+998945621220' },
    include: { teacher: { include: { groups: true } } }
  });

  if (existingUser) {
    if (existingUser.teacher) {
      await prisma.starTransaction.deleteMany({ where: { teacherId: existingUser.teacher.id } });
      await prisma.teacher.delete({ where: { id: existingUser.teacher.id } });
    }
    await prisma.user.delete({ where: { id: existingUser.id } });
    console.log('Existing teacher +998945621220 successfully removed from DB.');
  } else {
    console.log('No existing teacher found with phone +998945621220.');
  }

  console.log('--- STEP 2: LAUNCHING BROWSER FOR REAL UI CREATION ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    const text = `[BROWSER ${msg.type().toUpperCase()}]: ${msg.text()}`;
    consoleLogs.push(text);
    if (msg.type() === 'error') errors.push(text);
    console.log(text);
  });

  page.on('pageerror', err => {
    const text = `[PAGE ERROR]: ${err.message}\n${err.stack}`;
    consoleLogs.push(text);
    errors.push(text);
    console.error(text);
  });

  console.log('Logging in as DIRECTOR...');
  await page.goto('https://lms-app-tan-iota.vercel.app/', { waitUntil: 'networkidle' });
  await page.locator('input[type="tel"], input[placeholder*="998"], input[type="text"]').first().fill('+998881060625');
  await page.locator('input[type="password"]').fill('20001220');
  await page.locator('button[type="submit"]').click();
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(2000);

  console.log('Navigating to /director/teachers...');
  await page.goto('https://lms-app-tan-iota.vercel.app/director/teachers', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scripts/e2e-1-before-create.png' });

  console.log('Clicking "+ Добавить учителя"...');
  await page.locator('button:has-text("Добавить учителя")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scripts/e2e-2-modal-open.png' });

  const modal = page.locator('div.fixed');
  console.log('Filling modal fields with new teacher data...');
  await modal.locator('input[placeholder*="Иванов"], input[type="text"]').first().fill('Мухаммедов Хусниддин');
  await modal.locator('input[placeholder*="998"], input[type="tel"]').fill('+998945621220');
  await modal.locator('input[type="password"]').fill('20001220');
  await modal.locator('input[placeholder*="Математика"], input[placeholder*="Английский"], input[placeholder*="Предмет"]').fill('Математика');
  await modal.locator('input[type="number"], input[placeholder*="Зарплата"], input[placeholder*="4000000"]').fill('400000');

  await page.screenshot({ path: 'scripts/e2e-3-modal-filled.png' });

  console.log('Submitting "+ Добавить учителя" form via UI click...');
  await modal.locator('button[type="submit"]').click();

  // Wait for submission, toast, and re-render
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'scripts/e2e-4-after-create.png' });

  console.log('--- STEP 3: VERIFYING IN PRODUCTION DATABASE ---');
  const newTeacher = await prisma.user.findUnique({
    where: { phone: '+998945621220' },
    include: { teacher: { include: { groups: true } } }
  });

  console.log('Database verification result:');
  console.log('- User ID:', newTeacher?.id);
  console.log('- User Name:', newTeacher?.name);
  console.log('- User Role:', newTeacher?.role);
  console.log('- Teacher ID:', newTeacher?.teacher?.id);
  console.log('- Teacher Subject:', newTeacher?.teacher?.subject);
  console.log('- Teacher Salary:', newTeacher?.teacher?.salary);
  console.log('- Teacher Groups Count:', newTeacher?.teacher?.groups.length);
  console.log('- Created At:', newTeacher?.createdAt);

  console.log('--- STEP 4: VERIFYING UI PAGE CONTENT ---');
  const content = await page.content();
  const hasName = content.includes('Мухаммедов Хусниддин');
  const hasPhone = content.includes('+998945621220');
  const hasSubject = content.includes('Математика');
  const hasSalary = content.includes('400 000') || content.includes('400,000') || content.includes('400000');

  console.log('UI checks:');
  console.log('- Name displayed:', hasName);
  console.log('- Phone displayed:', hasPhone);
  console.log('- Subject displayed:', hasSubject);
  console.log('- Salary displayed:', hasSalary);

  await browser.close();

  console.log('\n--- FINAL DIAGNOSTIC REPORT ---');
  console.log('Total Console Errors:', errors.length);
  if (errors.length === 0) {
    console.log('>> ALL CONSOLE AND REACT ERROR CHECKS PASSED WITH 0 ERRORS! <<');
  } else {
    console.log('Errors found:', errors);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
