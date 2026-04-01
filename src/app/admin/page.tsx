'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Gamepad2, 
  Plus, 
  ChevronRight, 
  Loader2, 
  Settings2,
  ExternalLink,
  Database,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Play,
  Trash2,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';
// Link to the main Kokeb Learning Cloud admin panel
const MAIN_ADMIN_URL = 'https://learningcloud.et/dashboard';

type TabType = 'games' | 'courses' | 'grades';

interface Game { id: string; title: string; course_name?: string; grade_name?: string; is_active?: boolean; is_free?: boolean; }
interface Course { id: string; name: string; code: string; }
interface Grade { id: string; name: string; level_number: number; }

async function safeFetch(url: string) {
  const res = await fetch(url);
  if (!res.ok) return { data: [] };
  const text = await res.text();
  if (!text.trim()) return { data: [] };
  const json = JSON.parse(text);
  return json.status === 'success' || json.success ? json : { data: [] };
}

export default function AdminLanding() {
  const [activeTab, setActiveTab] = useState<TabType>('games');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<{ courses: Course[]; grades: Grade[]; games: Game[] }>({
    courses: [],
    grades: [],
    games: [],
  });

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [cData, grData, gaData] = await Promise.all([
          safeFetch(`${API_BASE_URL}/respect/courses`),
          safeFetch(`${API_BASE_URL}/respect/grade-levels`),
          safeFetch(`${API_BASE_URL}/respect/games`),
        ]);
        setData({
          courses: cData.data || [],
          grades: grData.data || [],
          games: gaData.data || [],
        });
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const filteredGames = data.games.filter((g) =>
    g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCourses = data.courses.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredGrades = data.grades.filter((g) =>
    g.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabConfig: { id: TabType; label: string; count: number; icon: React.ElementType; color: string }[] = [
    { id: 'games',   label: 'Game Activities', count: data.games.length,   icon: Gamepad2,     color: 'text-primary bg-primary/10'   },
    { id: 'courses', label: 'Domains',          count: data.courses.length, icon: BookOpen,     color: 'text-amber-500 bg-amber-50'   },
    { id: 'grades',  label: 'Grade Tracks',     count: data.grades.length,  icon: GraduationCap, color: 'text-emerald-500 bg-emerald-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[0.6rem] font-black uppercase tracking-widest border border-primary/20">
              RESPECT Engine
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">RESPECT Control Center</h1>
          <p className="text-slate-500 font-medium font-serif italic">
            Manage grade levels, subjects, and game activities for the RESPECT ecosystem.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Link back to main admin */}
          <a
            href={MAIN_ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-[2rem] font-bold shadow-sm hover:shadow-xl hover:border-primary/20 hover:text-primary transition-all duration-300 text-sm"
          >
            <ExternalLink size={18} />
            <span>Main Admin Panel</span>
            <ArrowUpRight size={14} className="opacity-50" />
          </a>
          
          <Link 
            href="/admin/games/new"
            className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-bold shadow-2xl shadow-slate-300 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>Add Game Activity</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        {tabConfig.map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group bg-white p-8 rounded-[2.5rem] border transition-all duration-300 flex items-center justify-between ${
              activeTab === tab.id
                ? 'border-primary/20 shadow-2xl shadow-primary/10 ring-4 ring-primary/5'
                : 'border-slate-100 shadow-sm hover:shadow-xl'
            }`}
          >
            <div className="text-left">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{tab.label}</p>
              <p className="text-4xl font-black text-slate-900 leading-none">{loading ? '...' : tab.count}</p>
            </div>
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${tab.color} group-hover:scale-110 transition-transform`}>
              <tab.icon size={28} />
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content System */}
      <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
        {/* Tab Bar + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-[2.5rem]">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white text-primary shadow-xl shadow-primary/10' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-50 rounded-2xl px-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-transparent focus-within:border-primary/10">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 bg-transparent border-none focus:ring-0 py-3 px-3 text-sm font-semibold text-slate-600 placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-[400px] flex flex-col items-center justify-center gap-4"
              >
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 italic">
                  Querying RESPECT Registry...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* GAMES TAB */}
                {activeTab === 'games' && (
                  <div className="space-y-4">
                    {filteredGames.length === 0 ? (
                      <EmptyState label="game activities" icon={Gamepad2} href="/admin/games/new" />
                    ) : filteredGames.map((game) => (
                      <div key={game.id} className="group bg-slate-50 p-6 rounded-[2rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                            <Gamepad2 size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {game.course_name && (
                                <span className="text-[0.6rem] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  {game.course_name}
                                </span>
                              )}
                              {game.grade_name && (
                                <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">
                                  {game.grade_name}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-black text-slate-900">{game.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest ${
                            game.is_free ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {game.is_free ? 'Free' : 'Premium'}
                          </span>
                          <Link href={`/admin/games/${game.id}/edit`} className="p-3 bg-white text-slate-400 hover:text-primary rounded-xl transition-all hover:shadow-lg">
                            <Settings2 size={18} />
                          </Link>
                          <button className="p-3 bg-white text-slate-400 hover:text-red-500 rounded-xl transition-all hover:shadow-lg">
                            <Trash2 size={18} />
                          </button>
                          <Link href={`/games/${game.id}`} className="p-3 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all hover:shadow-lg">
                            <Play size={18} />
                          </Link>
                        </div>
                      </div>
                    ))}
                    <Link 
                      href="/admin/games/new"
                      className="w-full py-8 rounded-[2.5rem] border-4 border-dashed border-slate-100 flex items-center justify-center gap-4 text-slate-300 hover:bg-slate-50 hover:text-primary hover:border-primary/40 transition-all font-black uppercase tracking-widest text-xs group"
                    >
                      <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                      Add New Game Activity
                    </Link>
                  </div>
                )}

                {/* COURSES TAB */}
                {activeTab === 'courses' && (
                  <div className="grid grid-cols-2 gap-6">
                    {filteredCourses.length === 0 ? (
                      <div className="col-span-2"><EmptyState label="domains" icon={BookOpen} href="/admin/subjects" /></div>
                    ) : filteredCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/admin/subjects/${course.id}`}
                        className="group bg-slate-50 p-8 rounded-[2.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg font-black text-sm group-hover:scale-110 transition-transform">
                            {course.code}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{course.name}</h3>
                            <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">RESPECT Domain</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* GRADES TAB */}
                {activeTab === 'grades' && (
                  <div className="grid grid-cols-2 gap-6">
                    {filteredGrades.length === 0 ? (
                      <div className="col-span-2"><EmptyState label="grade tracks" icon={GraduationCap} href="/admin/grade-levels" /></div>
                    ) : filteredGrades.map((grade) => (
                      <Link
                        key={grade.id}
                        href="/admin/grade-levels"
                        className="group bg-slate-50 p-8 rounded-[2.5rem] border border-transparent hover:border-emerald-500/20 hover:bg-white hover:shadow-2xl transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg font-black text-xl group-hover:scale-110 transition-transform">
                            {grade.level_number}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{grade.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <p className="text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest">Active Track</p>
                            </div>
                          </div>
                        </div>
                        <CheckCircle2 size={20} className="text-emerald-200 group-hover:text-emerald-500 transition-colors" />
                      </Link>
                    ))}
                    <Link
                      href="/admin/grade-levels"
                      className="p-8 rounded-[2.5rem] border-4 border-dashed border-slate-100 flex items-center justify-center gap-4 text-slate-300 hover:bg-slate-50 hover:text-emerald-500 transition-all font-black uppercase tracking-widest text-xs"
                    >
                      <Plus size={24} /> Manage Tracks
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 text-[0.6rem] font-black uppercase tracking-[0.4em] text-slate-300 italic">
        <div className="flex items-center gap-2">
          <Database size={12} className="text-primary" />
          xAPI Cloud Registry v2
        </div>
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-emerald-500" />
          RESPECT Engine
        </div>
        <a
          href={MAIN_ADMIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          Learning Cloud <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

function EmptyState({ 
  label, 
  icon: Icon, 
  href 
}: { label: string; icon: React.ElementType; href: string }) {
  return (
    <Link
      href={href}
      className="block py-16 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-300 hover:bg-slate-50 hover:text-primary hover:border-primary/40 transition-all text-center group"
    >
      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
        <Icon size={40} />
      </div>
      <span className="font-black uppercase tracking-widest text-xs">No {label} yet</span>
      <span className="text-[0.6rem] font-semibold text-slate-300">Click to manage →</span>
    </Link>
  );
}
