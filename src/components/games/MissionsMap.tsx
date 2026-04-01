'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Trophy, Home, Play, Hexagon } from 'lucide-react';

interface MissionsMapProps {
  title: string;
  levels: any[];
  onLevelSelect: (index: number) => void;
  onBack?: () => void;
  difficulty: string;
  completedLevels: number[];
}

export default function MissionsMap({
  title,
  levels,
  onLevelSelect,
  onBack,
  difficulty,
  completedLevels
}: MissionsMapProps) {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
         <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-[100px]" />
         <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="w-full max-w-4xl px-6 pt-12 pb-8 flex items-center justify-between relative z-10">
        <button 
          onClick={onBack}
          className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-800 hover:bg-slate-900 hover:text-white transition-all transform hover:scale-110 active:scale-95"
          title="Return Home"
        >
          <Home size={24} />
        </button>
        
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">
            {title}
          </h1>
          <p className="text-xs font-black text-primary uppercase tracking-[0.3em] opacity-80">
            Current Path: {difficulty}
          </p>
        </div>

        <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-amber-500">
           <Trophy size={24} />
        </div>
      </header>

      {/* Map Content */}
      <main className="w-full max-w-6xl flex-1 relative flex flex-col items-center p-10 overflow-y-auto">
         <div className="w-full">
            {/* Level Nodes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-x-4 gap-y-12 items-start justify-items-center">
               {levels.map((level, i) => {
                 const isCompleted = completedLevels.includes(i);
                 const isUnlocked = i === 0 || completedLevels.includes(i - 1);
                 const isActive = i === completedLevels.length;

                 return (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, scale: 0.5 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.03 }}
                     className="relative flex flex-col items-center group/node"
                   >
                     {/* Bridge to Next Node */}
                     {i < levels.length - 1 && (
                       <div 
                         className={`
                           absolute top-7 left-[60%] w-[80%] h-1 z-0 rounded-full transition-all duration-700
                           ${isCompleted && completedLevels.includes(i + 1) ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-200'}
                           hidden md:block
                         `} 
                         style={{
                           // Hide if it's the last element in a 10-column row
                           display: (i + 1) % 10 === 0 ? 'none' : 'block'
                         }}
                       />
                     )}

                     {/* Mobile Bridge (2-col) */}
                     {i < levels.length - 1 && (
                       <div 
                         className={`
                           absolute top-7 left-[60%] w-[80%] h-1 z-0 rounded-full transition-all duration-700
                           ${isCompleted && completedLevels.includes(i + 1) ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-200'}
                           block md:hidden
                         `} 
                         style={{
                           display: (i + 1) % 2 === 0 ? 'none' : 'block'
                         }}
                       />
                     )}

                     {/* Vertical Row-End Bridge (Desktop) */}
                     {i < levels.length - 1 && (i + 1) % 10 === 0 && (
                       <div 
                         className={`
                           absolute top-[80%] left-1/2 -translate-x-1/2 w-1 h-[80%] z-0 rounded-full transition-all duration-700
                           ${isCompleted && completedLevels.includes(i + 1) ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-200'}
                           hidden md:block
                         `} 
                       />
                     )}

                     {/* Vertical Row-End Bridge (Mobile 2-col) */}
                     {i < levels.length - 1 && (i + 1) % 2 === 0 && (
                       <div 
                         className={`
                           absolute top-[80%] left-1/2 -translate-x-1/2 w-1 h-[80%] z-0 rounded-full transition-all duration-700
                           ${isCompleted && completedLevels.includes(i + 1) ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-200'}
                           block md:hidden
                         `} 
                       />
                     )}

                     <button
                       onClick={() => isUnlocked && onLevelSelect(i)}
                       className={`
                         w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center transition-all transform relative z-10
                         ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110 ring-4 ring-primary/20' : 
                          isCompleted ? 'bg-emerald-500 text-white shadow-lg' : 
                          isUnlocked ? 'bg-white text-slate-800 shadow-md border-2 border-slate-100 hover:border-primary/30' : 
                                       'bg-slate-200 text-slate-400 cursor-not-allowed'}
                       `}
                     >
                       {isCompleted ? (
                         <div className="flex flex-col items-center">
                            <Star size={16} fill="currentColor" />
                            <span className="text-[8px] font-black mt-0.5">DONE</span>
                         </div>
                       ) : !isUnlocked ? (
                         <Lock size={18} />
                       ) : isActive ? (
                         <div className="flex flex-col items-center">
                            <Play size={20} fill="currentColor" className="ml-1" />
                            <span className="text-[8px] font-black mt-0.5 uppercase">Play</span>
                         </div>
                       ) : (
                         <span className="text-xl font-black">{i + 1}</span>
                       )}
                     </button>

                     {/* Label (Compact) */}
                     <div className="mt-3 text-center w-full px-1">
                        <p className={`text-[9px] font-black uppercase tracking-tighter truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                           {level.word || `Lv ${i + 1}`}
                        </p>
                        {isActive && (
                          <div className="mt-1 h-1 w-4 bg-primary mx-auto rounded-full" />
                        )}
                     </div>

                     {/* Completion Ribbon */}
                     {isCompleted && (
                       <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                          <Hexagon size={10} fill="currentColor" />
                       </div>
                     )}
                   </motion.div>
                 );
               })}
            </div>
         </div>
      </main>

      <footer className="w-full p-10 text-center relative z-10">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
            &copy; {new Date().getFullYear()} KOKEB LEARNING CLOUD &bull; MISSION CONTROL
         </p>
      </footer>
    </div>
  );
}
