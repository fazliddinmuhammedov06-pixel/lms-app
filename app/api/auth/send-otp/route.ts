import { NextRequest, NextResponse } from 'next/server';
import { generateOtp } from '@/lib/otp';

const PHONE_REGEX = /^\+998\d{9}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { phone?: string };
    const phone = body.phone?.trim();

    if (!phone || !PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: 'Неверный формат номера. Используйте: +998XXXXXXXXX' },
        { status: 400 }
      );
    }

    const code = await generateOtp(phone);

    // ─── DEV: выводим код в консоль вместо реального SMS ────────────────────
    console.log(`\n📱 OTP для ${phone}: ${code} (или универсальный код: 123456)\n`);
    // ─── PROD: здесь подключить SMS-провайдер (например Eskiz, Twilio) ───────

    return NextResponse.json({ success: true, message: 'Код отправлен' });
  } catch (err) {
    console.error('send-otp error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
