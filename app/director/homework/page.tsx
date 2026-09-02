import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/layout/app-layout';

export default async function DirectorHomeworkPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') redirect('/');
  const user = session.user as any;

  const homeworks = await prisma.homework.findMany({
    include: {
      group: true,
      submissions: { include: { student: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <AppLayout role="DIRECTOR" userName={user.name} userPhone={user.phone} unreadCount={unreadCount} title="Мониторинг домашних заданий">
      <div className="bg-[#1e293b] border border-slate-800 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-white">Все домашние задания центра</h2>
        <div className="space-y-3">
          {homeworks.map((hw) => (
            <div key={hw.id} className="bg-[#0f172a] p-4 border border-slate-800 rounded-lg text-xs space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-sm">{hw.title}</h3>
                  <p className="text-orange-400 font-semibold">{hw.group.name}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Дедлайн: {new Date(hw.deadline).toLocaleDateString('ru-RU')}</span>
              </div>
              <p className="text-slate-300">{hw.description}</p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Сдано работ: <strong className="text-emerald-400">{hw.submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'CHECKED').length}</strong> из {hw.submissions.length}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}