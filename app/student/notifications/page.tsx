import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { NotificationsView } from '@/components/notifications/notifications-view';

export default async function StudentNotificationsPage() {
  const session = await auth();
  if (!session) redirect('/');

  const role = (session.user as any)?.role;
  if (role !== 'PARENT' && role !== 'STUDENT') redirect('/');

  const userId = (session.user as any).id;
  const userName = (session.user as any).name || 'Студент';
  const userPhone = (session.user as any).phone;

  const dbNotifs = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const notifications = dbNotifs.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    category: n.category,
    read: n.read,
    date: new Date(n.createdAt).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsView
      role={role}
      userName={userName}
      userPhone={userPhone}
      unreadCount={unreadCount}
      notifications={notifications}
    />
  );
}
