import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { NotificationsView } from '@/components/notifications/notifications-view';

export default async function ManagerNotificationsPage() {
  const session = await auth();
  if (!session) redirect('/');

  const user = session.user as any;

  if (user.role !== 'MANAGER' && user.role !== 'DIRECTOR') {
    redirect('/');
  }

  const dbNotifs = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const notifications = dbNotifs.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    category: n.category,
    read: n.read,
    date: new Date(n.createdAt).toLocaleDateString('ru-RU'),
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsView
      role="MANAGER"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      notifications={notifications}
    />
  );
}