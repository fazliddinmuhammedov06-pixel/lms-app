import { prisma } from '@/lib/prisma';

const OTP_TTL_MINUTES = 5;

/** Генерирует 6-значный OTP, сохраняет в БД, возвращает код */
export async function generateOtp(phone: string): Promise<string> {
  // Инвалидируем все предыдущие неиспользованные коды для этого номера
  await prisma.otpCode.updateMany({
    where: { phone, used: false },
    data: { used: true },
  });

  // В dev-режиме можно использовать как сгенерированный код, так и универсальный 123456
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { phone, code, expiresAt },
  });

  return code;
}

/** Проверяет OTP без его использования (для валидации формы) */
export async function verifyOtpExists(phone: string, code: string): Promise<boolean> {
  const record = await prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
  return record !== null;
}
