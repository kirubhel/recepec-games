'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap,
  Gamepad2,
  ChevronRight,
  Activity
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard',       href: '/respect-minimal-games/admin',                 icon: LayoutDashboard },
  { name: 'Subjects',        href: '/respect-minimal-games/admin/subjects',         icon: BookOpen        },
  { name: 'Game Activity',   href: '/respect-minimal-games/admin/game-activities',  icon: Activity        },
  { name: 'Grade Levels',    href: '/respect-minimal-games/admin/grade-levels',     icon: GraduationCap   },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Get current page name for breadcrumb
  const currentPage = navItems
    .slice()
    .reverse()
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm">
        {/* Brand */}
        <Link href="/respect-minimal-games/" className="p-6 pb-4 block hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Gamepad2 size={22} />
            </div>
            <div>
              <h1 className="font-black text-slate-900 leading-none tracking-tight">RESPECT</h1>
              <p className="text-[0.65rem] text-slate-400 mt-0.5 font-semibold uppercase tracking-widest">
                Admin Panel
              </p>
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <p className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-slate-300 px-4 py-3">
            Management
          </p>
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon
                  size={18}
                  className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}
                />
                <span className="font-bold text-sm">{item.name}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom brand strip — no sign out */}
        <div className="p-5 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Gamepad2 size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 leading-none">RESPECT Engine</p>
              <p className="text-[0.6rem] text-slate-400 mt-0.5 uppercase tracking-widest">v2.1</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">Admin</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-900 font-bold">
              {currentPage?.name || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/respect-minimal-games/admin/games/new"
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all duration-200"
            >
              <Activity size={14} />
              New Activity
            </Link>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
            <span className="font-bold text-slate-700 text-sm">Spix Admin</span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
