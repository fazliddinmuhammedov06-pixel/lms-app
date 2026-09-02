import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/layout/app-layout';

export default async function DirectorAttendancePage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'DIRECTOR') redirect('/');
  const user = session.user as any;

  const records = await prisma.attendanceRecord.findMany({
    take: 30,
    orderBy: { date: 'desc' },
    include: {
      student: { include: { group: true } },
      lesson: true,
    },
  });

  const unreadCount = await prisma.notification.count({ where: { userId: user.id, read: false } });

  return (
    <AppLayout role="DIRECTOR" userName={user.name} userPhone={user.phone} unreadCount={unreadCount} title="Журнал посещаемости">
      <div className="bg-[#1e293b] border border-slate-800 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-white">Все записи посещаемости</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Дата</th>
                <th className="p-3">Ученик</th>
                <th className="p-3">Группа</th>
                <th className="p-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-[#0f172a]/50">
                  <td className="p-3 text-slate-400">{new Date(r.date).toLocaleDateString('ru-RU')}</td>
                  <td className="p-3 font-bold text-white">{r.student.name}</td>
                  <td className="p-3 text-slate-300">{r.student.group?.name || 'Занятие'}</td>
                  <td className="p-3">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      r.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {r.status === 'PRESENT' ? 'Был' : r.status === 'ABSENT' ? 'Пропустил' : 'Опоздал'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}