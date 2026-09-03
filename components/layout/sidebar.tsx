'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut, Menu, X } from 'lucide-react';
import { ROLE_NAV_ITEMS, ROLE_LABELS } from '@/lib/nav-config';

interface SidebarProps {
  role: string;
  userName?: string;
  userPhone?: string;
  unreadCount?: number;
}

export function Sidebar({ role, userName, userPhone, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = ROLE_NAV_ITEMS[role] || ROLE_NAV_ITEMS['STUDENT'];

  const navContent = (
    <div className="flex flex-col h-full bg-[#0f172a] border-r border-slate-800 text-slate-300 w-64">
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <Link href={`/${role.toLowerCase()}`} className="flex items-center gap-2.5">
          <img src="/logo-star.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div>
            <span className="text-white font-bold text-base tracking-wide block leading-tight">FRIDAY</span>
            <span className="text-[10px] text-orange-400 font-semibold tracking-wider uppercase block">EDUCATION LMS</span>
          </div>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-2 bg-[#1e293b]/60 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Роль:</span>
        <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase">
          {ROLE_LABELS[role] || role}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2.5 px-2 space-y-0.5">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== `/${role.toLowerCase()}` && pathname.startsWith(it.href));
          const Icon = it.icon;
          const isNotif = it.name.includes('Уведомления');

          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                active
                  ? 'bg-orange-500 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
              <span className="flex-1 truncate">{it.name}</span>
              {isNotif && unreadCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'}`}>
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-800 bg-[#1e293b]/40">
        <div className="mb-2">
          <p className="text-xs font-bold text-white truncate">{userName || 'Пользователь'}</p>
          <p className="text-[10px] text-slate-400 truncate">{userPhone || ''}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden bg-[#0f172a] border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded bg-slate-800 text-slate-200">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-white flex items-center gap-1.5">
            <img src="/logo-star.png" alt="Logo" className="w-6 h-6 object-contain" />
            Friday LMS
          </span>
        </div>
        <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase">
          {ROLE_LABELS[role] || role}
        </span>
      </div>

      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-30">
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">{navContent}</div>
        </div>
      )}
    </>
  );
}