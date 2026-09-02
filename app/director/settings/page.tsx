import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SettingsClient from './settings-client';

export default async function DirectorSettingsPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') redirect('/');

  const user = session.user as any;

  let settings = await prisma.centerSettings.findFirst();
  if (!settings) {
    settings = await prisma.centerSettings.create({
      data: {
        name: 'Friday Education LMS',
        phone: '+998 90 123 45 67',
        address: 'г. Ташкент, ул. Амира Темура 45',
      },
    });
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return (
    <SettingsClient
      role="DIRECTOR"
      userName={user.name}
      userPhone={user.phone}
      unreadCount={unreadCount}
      settings={settings}
    />
  );
}