'use client';

import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Play,
  Loader2,
  ChevronRight,
  Star,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

export default function StudentHome() {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/respect/games`);
        if (res.ok) {
          const json = await res.json();
          setGames(json.data || []);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  const filteredGames = games.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase()) || 
    g.course_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Student Header */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                <Trophy size={24} />
             </div>
             <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Student Portal</h1>
                <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Kokeb Learning Cloud</p>
             </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
             <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-black text-slate-700">1,240 XP</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 border-2 border-white shadow-lg" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Welcome Section */}
        <section className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl">
           <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/20 rounded-full blur-[120px]" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="space-y-6 max-w-xl">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-[0.65rem] font-black uppercase tracking-widest">New Quests Available</span>
                 </div>
                 <h2 className="text-5xl font-black tracking-tight leading-none">Ready for your next learning mission?</h2>
                 <p className="text-slate-400 text-lg font-serif italic italic leading-relaxed">
                    Explore interactive games, earn XP, and climb the leaderboard. Your educational journey continues here.
                 </p>
                 <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search for a subject or level..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                    />
                 </div>
              </div>
              <div className="relative group perspective-1000 hidden md:block">
                 <motion.div 
                   animate={{ rotateY: [0, 10, -10, 0], rotateX: [0, -10, 10, 0] }}
                   transition={{ repeat: Infinity, duration: 8 }}
                   className="w-64 h-64 bg-primary/20 rounded-[3rem] border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl preserve-3d"
                 >
                    <div className="w-40 h-40 bg-white rounded-[2rem] flex items-center justify-center text-primary shadow-2xl group-hover:scale-110 transition-transform">
                       <Gamepad2 size={80} />
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* Quests Grid */}
        <section className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Mission Registry</h3>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Filter by:</span>
                 <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option>All Subjects</option>
                    <option>Mathematics</option>
                    <option>English</option>
                 </select>
              </div>
           </div>

           {loading ? (
             <div className="h-[400px] flex flex-col items-center justify-center gap-6">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-slate-400 italic">Accessing Digital Archives...</p>
             </div>
           ) : filteredGames.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredGames.map((game, idx) => (
                 <motion.div
                   key={game.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="group bg-white p-8 rounded-[3.5rem] border border-slate-100 hover:border-primary/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden relative"
                 >
                    <div className="space-y-6">
                       <div className="flex items-start justify-between">
                          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                             {game.thumbnail_url ? (
                               <img src={game.thumbnail_url} alt="" className="w-full h-full object-cover rounded-3xl" />
                             ) : (
                               <Gamepad2 size={32} />
                             )}
                          </div>
                          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[0.6rem] font-black uppercase tracking-widest">
                             {game.grade_name || 'Level 1'}
                          </div>
                       </div>

                       <div>
                          <div className="flex items-center gap-2 mb-2">
                             <BookOpen size={14} className="text-slate-400" />
                             <span className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-slate-400 font-serif italic">
                                {game.course_name || 'Curriculum'}
                             </span>
                          </div>
                          <h4 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">
                             {game.title}
                          </h4>
                          <p className="text-xs font-bold text-slate-500 line-clamp-2 italic font-serif">
                             {game.description || 'Embark on a unique interactive learning quest specially designed for excellence.'}
                          </p>
                       </div>

                       <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                                ))}
                             </div>
                             <span className="text-[0.6rem] font-black text-slate-400">12 PLAYERS</span>
                          </div>
                          <Link 
                            href={`/games/${game.id}`}
                            className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                          >
                             <Play size={20} fill="currentColor" />
                          </Link>
                       </div>
                    </div>

                    {/* Decorative Card Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 scale-0 group-hover:scale-100 transition-transform duration-700" />
                 </motion.div>
               ))}
             </div>
           ) : (
             <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                   <Search size={32} />
                </div>
                <h4 className="text-xl font-black text-slate-900 uppercase">No Quests Found</h4>
                <p className="text-slate-400 font-bold italic font-serif">Try adjusting your search criteria.</p>
             </div>
           )}
        </section>
      </main>

      <footer className="w-full py-16 px-6 border-t border-slate-100 bg-white">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <BookOpen size={20} />
               </div>
               <span className="text-xs font-black uppercase tracking-[0.3em]">Kokeb Learning Cloud</span>
            </div>
            <div className="flex items-center gap-8">
               <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">&copy; 2026 KOKEB EDUCATION TECHNOLOGY</span>
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[0.6rem] font-black text-slate-900 uppercase tracking-widest">Server Status: Online</span>
               </div>
            </div>
         </div>
      </footer>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
}
