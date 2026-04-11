'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Clock, Trophy, Home, Lightbulb, RotateCcw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface GameWrapperProps {
  children: React.ReactNode;
  title: string;
  questPart?: number;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  currentDifficulty: DifficultyLevel;
  timeLimit?: number;
  onTimeUp?: () => void;
  score?: number;
  onBack?: () => void;
  onHint?: () => void;
  onRetry?: () => void;
}

export default function GameWrapper({
  children,
  title,
  questPart,
  onDifficultyChange,
  currentDifficulty,
  timeLimit,
  onTimeUp,
  score = 0,
  onBack,
  onHint,
  onRetry,
}: GameWrapperProps) {
  const router = useRouter();
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit || null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPaused && timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev !== null && prev <= 1) {
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isPaused, timeRemaining, onTimeUp]);

  useEffect(() => {
    if (timeLimit) setTimeRemaining(timeLimit);
  }, [timeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: 'url("/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Dimmer/Overlay for Readability */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none" />

      {/* Optimized Top Nav - Compact Metrics */}
      <header className="sticky top-0 z-40 w-full px-4 py-3 bg-white/40 backdrop-blur-xl rounded-b-[32px] mb-2 border-b border-white/30 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left Block: Back & Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack || (() => router.back())}
              className="w-10 h-10 bg-orange-500 flex items-center justify-center rounded-full transition-all active:scale-90 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 text-white stroke-[3.5px]" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-black text-slate-900 leading-none mb-1">{title}</h2>
              {questPart && (
                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                   Quest Part {questPart}
                </span>
              )}
            </div>
          </div>

          {/* Center Block: Timer & Actions */}
          <div className="flex items-center gap-2 bg-slate-900/5 px-4 py-1.5 rounded-2xl">
             {timeRemaining !== null && (
               <div className="flex items-center gap-2 pr-2 border-r border-slate-900/10">
                  <Clock size={16} className="text-sky-500" />
                  <span className="font-mono text-lg font-black text-slate-900">{formatTime(timeRemaining)}</span>
               </div>
             )}
             <div className="flex items-center gap-1 pl-1">
                <button 
                  onClick={onHint}
                  className="w-8 h-8 flex items-center justify-center text-amber-500 hover:bg-amber-100 rounded-lg transition-all active:scale-90"
                >
                  <Lightbulb size={18} fill="currentColor" fillOpacity={0.2} />
                </button>
                <button 
                  onClick={() => {
                    if (timeLimit) setTimeRemaining(timeLimit);
                    onRetry?.();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-sky-500 hover:bg-sky-100 rounded-lg transition-all active:scale-90"
                >
                  <RotateCcw size={18} />
                </button>
             </div>
          </div>

          {/* Right Block: Pause */}
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all"
          >
            {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
          </button>

        </div>
      </header>

      {/* Main Game Area - Non-Scrollable */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4 overflow-hidden">
        <AnimatePresence>
          {isPaused && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full glass-card p-10 rounded-[40px] text-center shadow-3xl border-primary/20"
              >
                <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Pause className="w-10 h-10 text-primary fill-current" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Paused</h3>
                <p className="text-slate-600 mb-10 text-lg font-medium leading-relaxed">
                  Ready to continue the mission?
                </p>
                <button 
                  onClick={() => setIsPaused(false)}
                  className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                  Resume
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center">
           {children}
        </div>
      </main>
    </div>
  );
}
