'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap,
  Gamepad2,
  ChevronRight,
  Activity,
  Lock,
  User,
  LogIn,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard',       href: '/respect-minimal-games/admin',                 icon: LayoutDashboard },
  { name: 'Courses',         href: '/respect-minimal-games/admin/subjects',         icon: BookOpen        },
  { name: 'Game Activity',   href: '/respect-minimal-games/admin/game-activities',  icon: Activity        },
  { name: 'Grade Levels',    href: '/respect-minimal-games/admin/grade-levels',     icon: GraduationCap   },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('respect_admin_auth');
    setIsAuthenticated(auth === 'true');
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'respectadmin' && password === 'Admin@123') {
      sessionStorage.setItem('respect_admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('respect_admin_auth');
    setIsAuthenticated(false);
  };

  // Prevent flash
  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem]" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-50 rounded-tr-[4rem]" />

          <div className="relative z-10">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl shadow-primary/30 mb-8 mx-auto">
              <Lock size={40} strokeWidth={2.5} />
            </div>
            
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Admin Gateway</h1>
              <p className="text-[0.65rem] text-slate-400 mt-3 font-bold uppercase tracking-[0.2em]">Restricted Infrastructure</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-2">Operator ID</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-5 font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-2">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-5 font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-50 text-rose-500 p-4 rounded-xl text-xs font-bold flex items-center gap-3"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
              >
                Initialize Access <LogIn size={18} />
              </button>
            </form>

            <Link href="/respect-minimal-games/" className="block text-center mt-10 text-[0.65rem] font-black uppercase tracking-widest text-slate-300 hover:text-primary transition-colors">
              Return to Student Portal
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard View
  const currentPage = navItems
    .slice()
    .reverse()
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm flex-shrink-0">
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
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-slate-300 px-4 py-3">
            Management
          </p>
          {navItems.map((item) => {
            const isActive =
              item.href === '/respect-minimal-games/admin'
                ? pathname === '/respect-minimal-games/admin'
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

        {/* Sign Out */}
        <div className="p-5 border-t border-slate-100 space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all font-black uppercase tracking-widest text-[0.65rem]"
          >
            <LogOut size={16} />
            Sign Out Session
          </button>

          <div className="flex items-center gap-3 px-3">
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
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">Admin</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-900 font-bold">
              {currentPage?.name || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/respect-minimal-games/admin/game-activities"
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all duration-200"
            >
              <Activity size={14} />
              Activities
            </Link>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[0.6rem] font-black text-slate-500 uppercase">
              RA
            </div>
            <span className="font-bold text-slate-700 text-sm">Respect Admin</span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
