import { prisma } from '@/lib/prisma';

const OTP_TTL_MINUTES = 5;

/**
 * Вспомогательная функция для отправки SMS через внешний шлюз (например Eskiz, PlayMobile, Twilio).
 * Если переменные окружения SMS_API_KEY / SMS_API_URL не заданы, функция логирует код и сообщает, что SMS-провайдер не подключен.
 */
export async function sendSmsViaProvider(phone: string, code: string): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.SMS_API_KEY;
  const apiUrl = process.env.SMS_API_URL;

  if (!apiKey || !apiUrl) {
    console.log(`[SMS OTP DEV] Код для ${phone}: ${code} (Для отправки реальных SMS задайте SMS_API_KEY и SMS_API_URL в .env)`);
    return { sent: false, reason: 'SMS_API_KEY or SMS_API_URL not configured' };
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        mobile_phone: phone.replace('+', ''),
        message: `Ваш код подтверждения: ${code}`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[SMS OTP ERROR]', res.status, errText);
      return { sent: false, reason: errText };
    }

    return { sent: true };
  } catch (err) {
    console.error('[SMS OTP EXCEPTION]', err);
    return { sent: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

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

