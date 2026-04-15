'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Gamepad2, 
  Search,
  Filter,
  Play,
  Trophy,
  Sparkles,
  Rocket,
  Palette,
  Atom,
  Languages,
  ChevronDown,
  CheckCircle2,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
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

        const safeParse = async (res: Response) => {
          if (!res.ok) return { success: false, data: [] };
          try {
            const text = await res.text();
            if (!text || text.trim() === '') return { success: true, data: [] };
            return JSON.parse(text);
          } catch (e) {
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

  const filteredGames = useMemo(() => {
    return data.games.filter(game => {
      const matchCourse = selectedCourse === 'all' || game.course_id === selectedCourse;
      const matchGrade = selectedGrade === 'all' || game.grade_level_id === selectedGrade;
      return matchCourse && matchGrade;
    });
  }, [data.games, selectedCourse, selectedGrade]);

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-primary/20 pb-32 relative">
      {/* Top Native Header - Compact & Gradient */}
      <header className="h-[90px] max-w-7xl mx-auto px-6 md:px-20 flex items-center gap-6 transition-all">
        <div className="w-14 h-14 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl rounded-[1.2rem] flex items-center justify-center shadow-xl border border-white/30 overflow-hidden">
          <img src="/respect-minimal-games/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />
        </div>
        <h1 className="text-3xl md:text-4xl font-[900] text-white tracking-tight uppercase drop-shadow-[0_2px_4px_rgba(30,58,138,0.2)]">
          All Games
        </h1>
      </header>

      <main className="pt-2 max-w-7xl mx-auto px-6 md:px-20 space-y-10">
        {/* Playful Search & Filter Row - Compact Gradient Style */}
        <div className="flex gap-3 items-center w-full">
           <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/60 transition-transform group-focus-within:scale-110" size={22} />
              <input 
                type="text" 
                placeholder="Filter Games..."
                className="w-full h-14 bg-white/90 hover:bg-white rounded-[2rem] pl-14 pr-6 font-black text-slate-700 placeholder:text-blue-200 shadow-[0_15px_30px_rgba(0,0,0,0.03)] border-2 border-transparent focus:border-white/50 outline-none transition-all text-sm"
              />
           </div>
           
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setIsFilterExpanded(!isFilterExpanded)}
             className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-xl transition-all duration-300 ${isFilterExpanded ? 'bg-white text-primary' : 'bg-gradient-to-br from-primary to-blue-600 text-white'}`}
           >
              <div className="rotate-90">
                <Filter size={24} />
              </div>
           </motion.button>
        </div>

        {/* Collapsible Selectors - Keeping the logic but refined */}
        <AnimatePresence>
          {isFilterExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/50 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Subject Discovery */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-6">
                      <BookOpen size={16} className="text-blue-600" />
                      <span className="text-xs font-black text-blue-900/40 uppercase tracking-[0.2em]">Domain</span>
                  </div>
                  <div className="relative group">
                      <select 
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full bg-white/80 hover:bg-white border-2 border-transparent focus:border-blue-400 rounded-[2rem] px-8 py-5 outline-none transition-all font-bold text-slate-700 appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="all">Global Explorer 🌍</option>
                        {data.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={20} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-blue-500 transition-colors pointer-events-none" />
                  </div>
                </div>

                {/* Grade Discovery */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-6">
                      <Trophy size={16} className="text-emerald-500" />
                      <span className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.2em]">Level</span>
                  </div>
                  <div className="relative group">
                      <select 
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full bg-white/80 hover:bg-white border-2 border-transparent focus:border-emerald-400 rounded-[2rem] px-8 py-5 outline-none transition-all font-bold text-slate-700 appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="all">All Ranks 🎓</option>
                        {data.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <ChevronDown size={20} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-emerald-500 transition-colors pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-white rounded-[3rem] animate-pulse shadow-sm" />
              ))
            ) : (
              filteredGames.map((game, idx) => {
                // Reactive progress tracking logic
                const getGameStats = () => {
                   if (typeof window === 'undefined') return { stars: 0, progress: 0, hasStarted: false };
                   const saved = localStorage.getItem(`mission_progress_${game.id}_v3`);
                   if (!saved) return { stars: 0, progress: 0, hasStarted: false };
                   try {
                     const pData = JSON.parse(saved);
                     let totalStars = 0;
                     let levelsDone = 0;
                     ['easy', 'medium', 'hard'].forEach(d => {
                        if (pData[d]) {
                           Object.values(pData[d]).forEach((s: any) => {
                              totalStars += (s as number);
                              levelsDone++;
                           });
                        }
                     });
                     // Approximate progress (assuming ~15 levels per mission for the bar visual)
                     const progressPercent = Math.min((levelsDone / 15) * 100, 100);
                     return { stars: totalStars, progress: progressPercent, hasStarted: levelsDone > 0 };
                   } catch { return { stars: 0, progress: 0, hasStarted: false }; }
                };

                const stats = getGameStats();

                return (
                  <motion.div
                    key={game.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/respect-minimal-games/games/${game.id}`} className="block group">
                      <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden bg-white shadow-2xl group-hover:shadow-primary/30 transition-all duration-500 border-4 border-white">
                        {/* Game Thumbnail with Fallback to Logo */}
                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center overflow-hidden">
                           <img 
                              src={game.thumbnail_url || game.image_url || '/respect-minimal-games/logo.png'} 
                              alt={game.title}
                              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${(!game.thumbnail_url && !game.image_url) ? 'opacity-20 translate-y-4 contrast-125' : ''}`}
                           />
                           {(!game.thumbnail_url && !game.image_url) && (
                              <div className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-2 px-10 text-center">
                                 <img src="/respect-minimal-games/logo.png" className="w-20 mb-4 opacity-100 drop-shadow-2xl" alt="Logo" />
                              </div>
                           )}
                        </div>
                        
                        {/* Bottom Info */}
                        <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
                          <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-primary mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Mission Ready</span>
                          <h3 className="text-2xl font-black text-white leading-none mb-3 group-hover:translate-x-1 transition-transform drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">{game.title}</h3>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white/90 text-[0.6rem] font-bold uppercase tracking-widest border border-white/10 shadow-lg">
                                <Trophy size={12} className="text-amber-400" />
                                <span>BEST: {stats.stars}</span>
                             </div>
                             <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stats.progress}%` }}
                                  className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(81,162,255,0.5)]" 
                                />
                             </div>
                          </div>
                        </div>
  
                        {/* Large Play Icon Hub */}
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary shadow-[0_0_50px_rgba(81,162,255,0.5)] hover:scale-110 transition-transform">
                              <Play size={40} fill="currentColor" className="ml-1" />
                           </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating play Hub Navigation - Mobile Only Compact Icon */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] shadow-[0_15px_30px_rgba(0,0,0,0.2)] flex items-center justify-center relative overflow-hidden group border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <Gamepad2 size={28} className="group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
        </motion.button>
      </div>
    </div>
  );
}
