'use client';

import React, { useState } from 'react';
import { X, Search, Trash2, UserMinus } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { updateStudentGroup } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function TeacherRemoveStudentModal({ teacher, onClose }: any) {
  const router = useRouter();
  const [groupId, setGroupId] = useState(teacher.groups.length === 1 ? teacher.groups[0].id : 'ALL');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const students = teacher.groups
    .filter((g: any) => groupId === 'ALL' || g.id === groupId)
    .flatMap((g: any) => (g.students || []).map((s: any) => ({ ...s, groupName: g.name, groupId: g.id })));

  const filtered = students.filter((s: any) => {
    const q = search.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) || (s.parentName || '').toLowerCase().includes(q) || (s.phone || '').includes(q);
  });

  const handleRemove = async (studentId: string) => {
    if (!confirm('Удалить ученика из группы?')) return;
    setProcessing(studentId);
    try {
      await updateStudentGroup(studentId, null);
      toast.success('Ученик удалён из группы');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка удаления');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#1e293b] border border-slate-800 rounded-lg w-full max-w-md p-5 space-y-3 relative text-xs max-h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>
        <div className="pr-6">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <UserMinus className="w-4 h-4 text-red-400" />Удалить ученика из группы
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Учитель: <span className="text-white font-medium">{teacher.name}</span></p>
        </div>
        {teacher.groups.length > 1 ? (
          <div>
            <label className="block text-slate-300 mb-1 font-medium text-[11px]">Группа:</label>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none text-xs">
              <option value="ALL">Все группы ({teacher.totalStudents} уч.)</option>
              {teacher.groups.map((g: any) => (<option key={g.id} value={g.id}>{g.name} ({g.studentsCount} уч.)</option>))}
            </select>
          </div>
        ) : teacher.groups[0] ? (
          <div className="bg-[#0f172a] px-3 py-2 rounded border border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Группа:</span>
            <span className="text-orange-400 font-bold">{teacher.groups[0].name} ({teacher.groups[0].studentsCount} уч.)</span>
          </div>
        ) : null}
        <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 px-3 py-2 rounded">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск ученика..." className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 max-h-80 pr-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-slate-400">{students.length === 0 ? 'В группе нет учеников' : 'Ученики не найдены'}</div>
          ) : (
            filtered.map((student: any) => (
              <div key={student.id} className="bg-[#0f172a] border border-slate-700 p-2.5 rounded flex items-center justify-between hover:bg-slate-800/50">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <Avatar name={student.name} size={32} />
                  <div className="truncate">
                    <p className="font-bold text-white text-xs truncate">{student.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{student.parentName !== '—' ? `${student.parentName} • ` : ''}<span className="text-slate-300 font-medium">{student.groupName}</span></p>
                  </div>
                </div>
                <button type="button" onClick={() => handleRemove(student.id)} disabled={processing === student.id} className="inline-flex items-center gap-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 px-2.5 py-1 rounded text-[11px] font-semibold disabled:opacity-50 cursor-pointer shrink-0">
                  <Trash2 className="w-3 h-3" />{processing === student.id ? '...' : 'Удалить'}
                </button>
              </div>
            ))
          )}
        </div>
        <div className="pt-2 flex justify-end border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold cursor-pointer">Закрыть</button>
        </div>
      </div>
    </div>
  );
}
