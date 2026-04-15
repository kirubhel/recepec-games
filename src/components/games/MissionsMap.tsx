'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Trophy, Home, ArrowLeft, Gift } from 'lucide-react';
import { parseGameData } from '@/lib/respect/api';
import Image from 'next/image';

type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface MissionsMapProps {
  title: string;
  game: any;
  onLevelSelect: (difficulty: DifficultyLevel, index: number) => void;
  onBack?: () => void;
  completedProgress: Record<string, Record<number, number>>;
}

// Wooden Ladder Component
const WoodenLadder = ({ className }: { className?: string }) => (
  <div className={`relative w-16 h-28 flex flex-col items-center justify-center ${className}`}>
    <div className="absolute inset-y-0 left-0 w-3 bg-[#5d4037] rounded-full shadow-lg border-r border-[#3e2723]" />
    <div className="absolute inset-y-0 right-0 w-3 bg-[#5d4037] rounded-full shadow-lg border-l border-[#3e2723]" />
    <div className="absolute top-4 inset-x-1 h-3 bg-[#795548] rounded-sm shadow-md border-b-2 border-[#3e2723]/30" />
    <div className="absolute top-10 inset-x-1 h-3 bg-[#795548] rounded-sm shadow-md border-b-2 border-[#3e2723]/30" />
    <div className="absolute top-16 inset-x-1 h-3 bg-[#795548] rounded-sm shadow-md border-b-2 border-[#3e2723]/30" />
    <div className="absolute top-22 inset-x-1 h-3 bg-[#795548] rounded-sm shadow-md border-b-2 border-[#3e2723]/30" />
  </div>
);

export default function MissionsMap({
  title,
  game,
  onLevelSelect,
  onBack,
  completedProgress
}: MissionsMapProps) {
  
  const episodes = [
    {
      name: 'Easy Mode',
      backgroundImage: 'https://learningcloud.et/api/storage/proxy?bucket=elearning-assets&objectName=alphbet.png',
      difficulty: 'easy' as const,
      color: '#10b981',
      decorations: ['🌸', '🌻', '🦋', '🐝', '🌿'],
      animals: ['🐶', '🐱', '🐰'],
      bgColor: 'from-green-100 to-emerald-200',
      props: ['🏡', '🏮', '🌳', '🌺'],
    },
    {
      name: 'Medium Mode',
      backgroundImage: 'https://learningcloud.et/api/storage/proxy?bucket=elearning-assets&objectName=valley.png',
      difficulty: 'medium' as const,
      color: '#f59e0b',
      decorations: ['☀️', '🌳', '🐫', '🦅', '🏜️'],
      animals: ['🦁', '🦒', '🐘'],
      bgColor: 'from-orange-100 to-amber-200',
      props: ['🏜️', '🏮', '🌴', '☀️'],
    },
    {
      name: 'Hard Mode',
      backgroundImage: 'https://learningcloud.et/api/storage/proxy?bucket=elearning-assets&objectName=ice.webp',
      difficulty: 'hard' as const,
      color: '#ef4444',
      decorations: ['🔥', '🌋', '💣', '⚡'],
      animals: ['🐉', '🦖', '🐅'],
      bgColor: 'from-red-100 to-orange-200',
      props: ['🌋', '🏮', '🛖', '🔥'],
    },
  ];

  const isUnlocked = (difficulty: DifficultyLevel, index: number) => {
    if (difficulty === 'easy' && index === 0) return true;
    if (index > 0) return (completedProgress[difficulty] || {})[index - 1] !== undefined;
    const diffs: DifficultyLevel[] = ['easy', 'medium', 'hard'];
    const currentDiffIdx = diffs.indexOf(difficulty);
    if (currentDiffIdx > 0) {
      const prevDiff = diffs[currentDiffIdx - 1];
      const prevLevels = parseGameData(game, prevDiff);
      if (prevLevels.length === 0) return true;
      return (completedProgress[prevDiff] || {})[prevLevels.length - 1] !== undefined;
    }
    return false;
  };

  // Calculate Star Progress
  const totalPotentialStars = episodes.reduce((acc, ep) => acc + parseGameData(game, ep.difficulty).length * 3, 0);
  const earnedStars = Object.values(completedProgress).reduce((acc, diff) => {
    return acc + Object.values(diff).reduce((sum, s) => sum + (s as number), 0);
  }, 0);
  const starPercentage = totalPotentialStars > 0 ? (earnedStars / totalPotentialStars) * 100 : 0;

  return (
    <div 
      className="min-h-screen flex flex-col relative pt-4 pb-40 overflow-x-hidden"
      style={{
        backgroundImage: 'url("/respect-minimal-games/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Dimmer/Overlay for Readability */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] pointer-events-none" />

      {/* Immersive Home-like Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-7xl opacity-5 animate-float" style={{ animationDuration: '8s' }}>☁️</div>
        <div className="absolute top-60 right-20 text-8xl opacity-5 animate-float" style={{ animationDuration: '12s' }}>☁️</div>
        <div className="absolute bottom-40 left-1/3 text-6xl opacity-3 animate-float" style={{ animationDuration: '10s' }}>☁️</div>
      </div>

      {/* Top Bar - High Contrast Progress */}
      <div className="relative z-50 px-4 mb-4">
        <div className="container mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 bg-orange-500/80 hover:bg-orange-600 flex items-center justify-center rounded-full transition-all transform hover:scale-110 shadow-xl border-2 border-white/30 backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6 text-white stroke-[3px]" />
          </button>

          <div className="flex-1 flex items-center gap-4">
            <div className="relative transform hover:scale-110 transition-transform">
              <div className="w-16 h-16 bg-white rounded-[1.2rem] flex items-center justify-center shadow-2xl border-4 border-orange-400 rotate-12 relative z-10">
                 <Star className="w-10 h-10 text-amber-400 fill-amber-400 drop-shadow-md" />
              </div>
              <div className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-black px-3 py-1 rounded-full z-20 shadow-xl border-2 border-white animate-bounce-slow">
                {earnedStars}
              </div>
            </div>
            <div className="flex-1 h-10 rounded-[1.2rem] border-4 border-white/40 overflow-hidden shadow-2xl relative bg-blue-900/10 backdrop-blur-sm">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${starPercentage}%` }}
                 className="h-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_25px_rgba(251,191,36,0.6)]"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="relative z-40 container mx-auto px-4 max-w-4xl pt-10">
        <div className="space-y-16">
          {episodes.map((episode, epIdx) => {
            const epLevels = parseGameData(game, episode.difficulty);
            if (epLevels.length === 0) return null;

            const colsPerRow = 5;
            const rowsCount = Math.ceil(epLevels.length / colsPerRow);
            const containerHeight = Math.max(340, rowsCount * 180 + 40);

            const nextEp = episodes[epIdx + 1];
            const nextLevels = nextEp ? parseGameData(game, nextEp.difficulty) : [];
            const hasNextConnection = nextLevels.length > 0;

            const getPos = (i: number) => {
              const r = Math.floor(i / colsPerRow);
              const c = i % colsPerRow;
              const x = 12 + c * 19; // %
              const y = 100 + r * 180 + (c % 2 === 0 ? 0 : 80); // px
              return { x, y };
            };

            return (
              <div key={epIdx} className="relative">
                <div 
                  className={`relative rounded-[4rem] overflow-hidden shadow-2xl border-[14px] border-white/50 bg-gradient-to-br ${episode.bgColor}`}
                  style={{ minHeight: `${containerHeight}px` }}
                >
                  <div className="absolute inset-0">
                    <img src={episode.backgroundImage} className="w-full h-full object-cover opacity-50 mix-blend-multiply" alt={episode.name} />
                  </div>

                  <div className="relative z-10 p-10 h-full">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      {/* Global String Layer - Entry */}
                      {epIdx > 0 && (
                         <g>
                            {(() => {
                               const firstP = getPos(0);
                               return (
                                  <>
                                     <path d={`M 50% -120 C 50% -20, ${firstP.x}% 20, ${firstP.x}% ${firstP.y}`} stroke="rgba(255,255,255,0.6)" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="8,8" />
                                  </>
                               );
                            })()}
                         </g>
                      )}

                      {epLevels.map((_, idx) => {
                        if (idx === 0) return null;
                        const p1 = getPos(idx - 1);
                        const p2 = getPos(idx);
                        const starsEarned = (completedProgress[episode.difficulty] as any)?.[idx] || 0;
                        const complete = starsEarned > 0;
                        return (
                          <g key={idx}>
                             <path 
                               d={`M ${p1.x}% ${p1.y} C ${p1.x}% ${p1.y + 60}, ${p2.x}% ${p2.y - 60}, ${p2.x}% ${p2.y}`} 
                               stroke={complete ? 'white' : 'rgba(255,255,255,0.4)'} 
                               strokeWidth="5" 
                               strokeDasharray={complete ? "0" : "8,8"} 
                               fill="none" 
                               strokeLinecap="round" 
                             />
                          </g>
                        );
                      })}

                      {/* Global String Layer - Exit */}
                      {hasNextConnection && (
                         <g>
                            {(() => {
                               const lastP = getPos(epLevels.length - 1);
                               return (
                                  <>
                                     <path d={`M ${lastP.x}% ${lastP.y} C ${lastP.x}% ${lastP.y + 60}, 50% ${containerHeight - 20}, 50% ${containerHeight + 60}`} stroke="rgba(255,255,255,0.6)" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="8,8" />
                                  </>
                               );
                            })()}
                         </g>
                      )}
                    </svg>

                    {epLevels.map((level: any, idx: number) => {
                      const { x, y } = getPos(idx);
                      const stars = (completedProgress[episode.difficulty] as any)?.[idx] || 0;
                      const unlocked = isUnlocked(episode.difficulty, idx);
                      const current = unlocked && stars === 0;

                      return (
                        <div key={idx} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}px` }}>
                           {current && (
                              <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-16 left-1/2 -translate-x-1/2 text-5xl z-30 drop-shadow-lg">
                                {episode.animals[idx % episode.animals.length]}
                              </motion.div>
                           )}
                           <motion.div whileHover={{ scale: unlocked ? 1.1 : 1 }} whileTap={{ scale: unlocked ? 0.95 : 1 }}>
                              <button
                                onClick={() => unlocked && onLevelSelect(episode.difficulty, idx)}
                                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl transition-all shadow-xl border-4 border-white relative z-20 ${unlocked ? 'cursor-pointer' : 'grayscale opacity-50 cursor-not-allowed'}`}
                                style={{ 
                                  backgroundColor: current ? '#2563eb' : stars > 0 ? episode.color : '#cbd5e1',
                                  boxShadow: unlocked ? '0 6px 0 rgba(0,0,0,0.15)' : 'none'
                                }}
                              >
                                {!unlocked ? <Lock size={24} className="opacity-40" /> : <span>{idx + 1}</span>}
                              </button>
                           </motion.div>
                           
                           {/* Stars with White Background Pill */}
                           <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 flex gap-1 py-1 px-3 bg-white rounded-full shadow-md border border-slate-100 z-30">
                              {[...Array(3)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={10} 
                                  className={`${i < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} drop-shadow-sm`} 
                                />
                              ))}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {hasNextConnection && (
                  <div className="flex justify-center -my-14 relative z-50">
                    <WoodenLadder className="scale-110 opacity-60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
