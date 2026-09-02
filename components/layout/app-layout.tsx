'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Search, Bell, User } from 'lucide-react';
import Link from 'next/link';

interface AppLayoutProps {
  role: string;
  userName?: string;
  userPhone?: string;
  unreadCount?: number;
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({
  role,
  userName = 'Пользователь',
  userPhone = '',
  unreadCount = 0,
  children,
  title,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex flex-col lg:flex-row">
      <Sidebar
        role={role}
        userName={userName}
        userPhone={userPhone}
        unreadCount={unreadCount}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-[#0f172a]/90 backdrop-blur border-b border-slate-800 sticky top-0 z-20">
          <div>
            {title && <h1 className="text-lg font-bold text-white tracking-wide">{title}</h1>}
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Button */}
            <Link
              href={`/${role.toLowerCase()}/notifications`}
              className="relative p-2 rounded-lg bg-[#1e293b] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile pill */}
            <div className="flex items-center gap-2.5 bg-[#1e293b] border border-slate-800 px-3 py-1.5 rounded-lg">
              <div className="w-7 h-7 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full flex items-center justify-center font-bold text-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-semibold text-white">{userName}</span>
                <span className="block text-[10px] text-slate-400 uppercase font-medium">{role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}