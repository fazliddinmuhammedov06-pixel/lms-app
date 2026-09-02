import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { NotificationsView } from '@/components/notifications/notifications-view';

export default async function DirectorNotificationsPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') redirect('/');

  const user = session.user as any;

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
    date: new Date(n.createdAt).toLocaleDateString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsView
      role="DIRECTOR"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      notifications={notifications}
    />
  );
}