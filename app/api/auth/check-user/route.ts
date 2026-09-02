import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { phone?: string };
    const phone = body.phone?.trim();

    if (!phone) {
      return NextResponse.json({ error: 'Номер телефона обязателен' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    return NextResponse.json({ exists: !!user });
  } catch (err) {
    console.error('check-user error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
