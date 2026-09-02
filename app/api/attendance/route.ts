import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // ── 1. Аутентификация ──────────────────────────────────────────────────
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const role = (session.user as any)?.role as string;
    const userId = (session.user as any)?.id as string;

    // ── 2. Только учитель может отмечать посещаемость через этот endpoint ──
    if (role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Доступ запрещён. Требуется роль TEACHER.' },
        { status: 403 }
      );
    }

    // ── 3. Получаем профиль учителя и его группы из БД (не из запроса) ────
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: {
        groups: {
          include: { students: { select: { id: true } } },
        },
      },
    });
    if (!teacher) {
      return NextResponse.json(
        { error: 'Профиль учителя не найден' },
        { status: 403 }
      );
    }

    // Строим множество studentId, которые реально принадлежат этому учителю
    const allowedStudentIds = new Set(
      teacher.groups.flatMap((g) => g.students.map((s) => s.id))
    );

    // ── 4. Валидация тела запроса ──────────────────────────────────────────
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Неверный формат данных' }, { status: 400 });
    }

    // ── 5. Построчная проверка каждой записи ──────────────────────────────
    for (const record of body) {
      if (
        typeof record.studentId !== 'string' ||
        typeof record.lessonId !== 'string' ||
        typeof record.date !== 'string' ||
        typeof record.status !== 'string'
      ) {
        return NextResponse.json(
          { error: `Неверная структура записи: ожидаются поля studentId, lessonId, date, status` },
          { status: 400 }
        );
      }

      // ── 6. RBAC: студент должен принадлежать группе этого учителя ────────
      if (!allowedStudentIds.has(record.studentId)) {
        return NextResponse.json(
          { error: `Доступ запрещён: студент ${record.studentId} не принадлежит вашим группам` },
          { status: 403 }
        );
      }

      // ── 7. Проверяем, что lessonId тоже принадлежит этому учителю ────────
      const lesson = await prisma.lesson.findUnique({
        where: { id: record.lessonId },
        include: { group: { select: { teacherId: true } } },
      });
      if (!lesson || lesson.group.teacherId !== teacher.id) {
        return NextResponse.json(
          { error: `Доступ запрещён: занятие ${record.lessonId} не принадлежит вашим группам` },
          { status: 403 }
        );
      }

      // ── 8. Допустимые статусы ─────────────────────────────────────────────
      const allowedStatuses = ['PRESENT', 'ABSENT', 'LATE'];
      if (!allowedStatuses.includes(record.status)) {
        return NextResponse.json(
          { error: `Недопустимый статус: ${record.status}` },
          { status: 400 }
        );
      }
    }

    // ── 9. Сохраняем все записи (только после прохождения всех проверок) ───
    for (const record of body) {
      const date = new Date(record.date);
      date.setHours(0, 0, 0, 0);

      await prisma.attendanceRecord.upsert({
        where: {
          studentId_lessonId_date: {
            studentId: record.studentId,
            lessonId: record.lessonId,
            date,
          },
        },
        update: { status: record.status },
        create: {
          studentId: record.studentId,
          lessonId: record.lessonId,
          date,
          status: record.status,
        },
      });
    }

    return NextResponse.json({ message: 'Посещаемость сохранена успешно' });
  } catch (error) {
    console.error('[POST /api/attendance]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}