'use client';

import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { updateStudentGroup } from '@/app/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  teacher: {
    id: string;
    name: string;
    groups: Array<{ id: string; name: string; studentsCount: number }>;
  };
  availableStudents: Array<{
    id: string;
    name: string;
    groupId: string | null;
    parentName: string;
    groupName: string;
  }>;
  onClose: () => void;
}

export function TeacherAddStudentModal({ teacher, availableStudents, onClose }: Props) {
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState(teacher.groups[0]?.id || '');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const filtered = (availableStudents || []).filter((s) => {
    const notInGroup = s.groupId !== selectedGroupId;
    const match = (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.parentName || '').toLowerCase().includes(search.toLowerCase());
    return notInGroup && match;
  });

  const handleAdd = async (studentId: string) => {
    if (!selectedGroupId) return toast.error('Выберите группу');
    setProcessing(studentId);
    try {
      await updateStudentGroup(studentId, selectedGroupId);
      toast.success('Ученик добавлен в группу');
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка добавления');
    } finally {
      setProcessing(null);
    }
  };

  const selectedGroup = teacher.groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#1e293b] border border-slate-800 rounded-lg w-full max-w-md p-5 space-y-3 relative text-xs max-h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="pr-6">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-orange-400" />
            Добавить ученика в группу
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Учитель: <span className="text-white font-medium">{teacher.name}</span></p>
        </div>

        {teacher.groups.length > 1 ? (
          <div>
            <label className="block text-slate-300 mb-1 font-medium text-[11px]">Выберите группу:</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded focus:outline-none text-xs"
            >
              {teacher.groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name} ({g.studentsCount} уч.)</option>
              ))}
            </select>
          </div>
        ) : selectedGroup ? (
          <div className="bg-[#0f172a] px-3 py-2 rounded border border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Группа:</span>
            <span className="text-orange-400 font-bold">{selectedGroup.name}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 px-3 py-2 rounded">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или родителю..."
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 max-h-80 pr-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-slate-400">
              {availableStudents.length === 0 ? 'Все ученики уже распределены' : 'Ученики не найдены'}
            </div>
          ) : (
            filtered.map((student) => (
              <div key={student.id} className="bg-[#0f172a] border border-slate-700 p-2.5 rounded flex items-center justify-between hover:bg-slate-800/50">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <Avatar name={student.name} size={32} />
                  <div className="truncate">
                    <p className="font-bold text-white text-xs truncate">{student.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {student.parentName !== '—' ? `${student.parentName} • ` : ''}{student.groupName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAdd(student.id)}
                  disabled={processing === student.id}
                  className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-3 py-1 rounded disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {processing === student.id ? '...' : 'Добавить'}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
