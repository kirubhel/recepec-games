'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Gamepad2, 
  Plus, 
  LayoutDashboard,
  ChevronRight, 
  Loader2, 
  Settings2,
  Trash2,
  ExternalLink,
  Database,
  LayoutGrid,
  Trophy,
  Users,
  Play,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

type TabType = 'games' | 'courses' | 'grades' | 'preview';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('games');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    courses: any[];
    grades: any[];
    games: any[];
  }>({
    courses: [],
    grades: [],
    games: [],
  });

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [cRes, grRes, gaRes] = await Promise.all([
          fetch(`${API_BASE_URL}/respect/courses`),
          fetch(`${API_BASE_URL}/respect/grade-levels`),
          fetch(`${API_BASE_URL}/respect/games`)
        ]);

        // Helper to safely parse JSON or return empty data on error
        const safeParse = async (res: Response) => {
          if (!res.ok) {
            console.error(`API Error: ${res.status} ${res.statusText}`);
            return { success: false, data: [] };
          }
          try {
            const text = await res.text();
            if (!text || text.trim() === '') return { success: true, data: [] };
            return JSON.parse(text);
          } catch (e) {
            console.error('Failed to parse JSON response:', e);
            return { success: false, data: [] };
          }
        };

        const [cData, grData, gaData] = await Promise.all([
          safeParse(cRes),
          safeParse(grRes),
          safeParse(gaRes)
        ]);

        setData({
          courses: cData.success ? cData.data : [],
          grades: grData.success ? grData.data : [],
          games: gaData.success ? gaData.data : [],
        });
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <main className="min-h-screen py-12 px-6 md:px-20 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link href="/respect-minimal-games/" className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[0.65rem] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white transition-all">
              RESPECT Control Engine
            </Link>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Management Center</h1>
          <p className="text-slate-500 font-medium font-serif italic text-xl">Central orchestration for isolated RESPECT manifestations and game assets.</p>
        </div>
        
        <div className="flex gap-4">
          <Link 
            href="/respect-minimal-games/admin"
            className="flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] font-bold shadow-2xl shadow-slate-300 hover:scale-105 active:scale-95 transition-all text-sm"
          >
            <LayoutDashboard size={20} />
            <span>Mission Dashboard</span>
          </Link>
          <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer shadow-sm">
            <Settings2 size={24} />
          </div>
        </div>
      </div>

      {/* Analytics Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Domains', value: data.courses.length, icon: BookOpen, color: 'text-primary' },
          { label: 'Grade Tracks', value: data.grades.length, icon: GraduationCap, color: 'text-emerald-500' },
          { label: 'Live Quests', value: data.games.length, icon: Gamepad2, color: 'text-amber-500' },
          { label: 'Sync Status', value: 'Enabled', icon: Database, color: 'text-rose-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-2xl transition-all duration-500">
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 leading-none">{loading ? '...' : stat.value}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Primary Management Hub */}
      <div className="bg-white rounded-[4rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-12">
        <div className="flex flex-wrap items-center justify-center gap-4 p-2 bg-slate-50 rounded-[3rem] w-fit mx-auto">
          {[
            { id: 'games', label: 'Quests', icon: Gamepad2 },
            { id: 'courses', label: 'Domains', icon: BookOpen },
            { id: 'grades', label: 'Grade Levels', icon: GraduationCap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-8 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 transition-all ${
                activeTab === tab.id 
                ? 'bg-white text-primary shadow-2xl shadow-primary/10 border border-primary/5' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[500px] flex flex-col items-center justify-center gap-6"
              >
                <div className="relative">
                  <Loader2 size={64} className="animate-spin text-primary" />
                  <Database size={24} className="absolute inset-0 m-auto text-primary/50" />
                </div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-slate-400 italic">Establishing Handshake with Registry...</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {activeTab === 'games' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data.games.map((game) => (
                      <div key={game.id} className="group bg-slate-50 p-8 rounded-[3.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden relative">
                         <div className="flex items-start justify-between relative z-10">
                            <div>
                               <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{game.course_name}</span>
                                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Level {game.grade_name}</span>
                               </div>
                               <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{game.title}</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                               <Link 
                                  href={`/respect-minimal-games/games/${game.id}`} 
                                  target="_blank"
                                  className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
                                  title="Play Manifest"
                               >
                                  <Play size={20} fill="currentColor" />
                               </Link>
                               {/* <Link 
                                  href={`/respect-minimal-games/admin/games/${game.id}/edit`} 
                                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-lg"
                                  title="Edit Quest"
                               >
                                  <Edit size={20} />
                               </Link>
                               <button 
                                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-lg"
                                  title="Delete Quest"
                               >
                                  <Trash2 size={20} />
                               </button> */}
                            </div>
                         </div>
                      </div>
                    ))}
                    
                    <Link 
                      href="/respect-minimal-games/admin/games/new"
                      className="group p-10 h-full rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6 text-slate-300 hover:bg-slate-50 hover:text-primary hover:border-primary/50 transition-all"
                    >
                      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
                         <Plus size={40} />
                      </div>
                      <span className="font-black uppercase tracking-[0.3em] text-xs">Initialize Game Manifest</span>
                    </Link>
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.courses.map((course) => (
                      <div key={course.id} className="bg-slate-50 p-10 rounded-[3.5rem] border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-500 group relative">
                         <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-2xl shadow-slate-200 font-black text-lg group-hover:scale-110 transition-transform">
                               {course.code}
                            </div>
                            <div>
                               <h3 className="text-2xl font-black text-slate-900">{course.name}</h3>
                               <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest italic font-serif">RESPECT_REGISTRY_LINK</p>
                            </div>
                         </div>
                         <div className="absolute top-8 right-8 text-slate-100 group-hover:text-primary/10 transition-colors">
                            <Database size={64} />
                         </div>
                      </div>
                    ))}
                     <button className="p-10 rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-300 hover:bg-slate-100 hover:text-primary transition-all">
                       <Plus size={32} />
                       <span className="font-black text-[0.6rem] uppercase tracking-widest">New Domain</span>
                    </button>
                  </div>
                )}

                {activeTab === 'grades' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data.grades.map((grade) => (
                      <div key={grade.id} className="bg-slate-50 p-10 rounded-[4rem] border border-transparent hover:border-emerald-500/20 hover:bg-white transition-all duration-500 flex items-center justify-between group">
                         <div className="flex items-center gap-10">
                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-emerald-500 shadow-2xl shadow-slate-200 font-black text-3xl group-hover:scale-110 transition-transform">
                               {grade.level_number}
                            </div>
                            <div>
                               <h3 className="text-2xl font-black text-slate-900">{grade.name}</h3>
                               <div className="flex items-center gap-2 text-emerald-500 mt-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] italic">Standard Definition</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-col items-center gap-2">
                            <div className="h-24 w-1.5 bg-slate-100 rounded-full relative overflow-hidden">
                               <div className="absolute top-0 w-full h-1/2 bg-emerald-500 rounded-full" />
                            </div>
                            <span className="text-[0.5rem] font-black uppercase text-slate-400">Activity Level</span>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className="pt-20 border-t border-slate-100 flex items-center justify-between px-10">
        <div className="flex items-center gap-6 text-[0.6rem] font-black uppercase tracking-[0.4em] text-slate-300 italic">
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> xAPI CLOUD SYNC</div>
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> RESILIENT STORAGE</div>
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> OFFLINE READY</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 italic">Powered by RESPECT Engine</span>
          <ExternalLink size={14} className="text-slate-300" />
        </div>
      </footer>
    </main>
  );
}
