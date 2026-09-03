import { NextRequest, NextResponse } from 'next/server';
import { generateOtp, sendSmsViaProvider } from '@/lib/otp';

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
    await sendSmsViaProvider(phone, code);

    return NextResponse.json({ success: true, message: 'Код отправлен' });
  } catch (err) {
    console.error('send-otp error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
