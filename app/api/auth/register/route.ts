import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOtp } from '@/lib/otp';

const PHONE_REGEX = /^\+998\d{9}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { phone?: string; name?: string };
    const phone = body.phone?.trim();
    const name = body.name?.trim();

    if (!phone || !PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: 'Неверный формат номера. Используйте: +998XXXXXXXXX' },
        { status: 400 }
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Введите имя (минимум 2 символа)' }, { status: 400 });
    }

    // Проверяем — нет ли уже такого пользователя
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json(
        { error: 'Пользователь с таким номером уже зарегистрирован' },
        { status: 409 }
      );
    }

    // Создаём пользователя со временной ролью PARENT
    // Директор потом назначит правильную роль
    await prisma.user.create({
      data: {
        phone,
        name,
        role: 'PARENT',
      },
    });

    // Создаём запись Parent
    const newUser = await prisma.user.findUnique({ where: { phone } });
    if (newUser) {
      await prisma.parent.create({ data: { userId: newUser.id } });
    }

    // Отправляем OTP
    const code = await generateOtp(phone);
    console.log(`\n📱 OTP для нового пользователя ${phone}: ${code}\n`);

    return NextResponse.json({ success: true, message: 'Регистрация успешна. Код отправлен.' });
  } catch (err) {
    console.error('register error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
