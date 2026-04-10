'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Clock, Trophy, Home, Lightbulb, RotateCcw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface GameWrapperProps {
  children: React.ReactNode;
  title: string;
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
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: 'url("/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Dimmer/Overlay for Readability */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] pointer-events-none" />

      {/* Minimized Top Nav - Title Only */}
      <header className="sticky top-0 z-40 w-full px-6 py-3 bg-white/30 backdrop-blur-md rounded-b-[24px] mb-4 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push('/respect-minimal-games/')}
            className="w-12 h-12 bg-orange-500/80 hover:bg-orange-600 flex items-center justify-center rounded-full transition-all transform hover:scale-110 shadow-xl border-2 border-white/30 backdrop-blur-sm"
            title="Go Back"
          >
            <ArrowLeft className="w-6 h-6 text-white stroke-[3px]" />
          </button>
          
          <h2 className="text-xl font-black text-slate-950 tracking-tight drop-shadow-sm flex-1 text-center pr-10">
            {title}
          </h2>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center px-6 pb-32 overflow-hidden relative">
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
                className="max-w-md w-full glass-card p-10 rounded-[40px] text-center"
              >
                <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Pause className="w-10 h-10 text-primary fill-current" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-4">Game Paused</h3>
                <p className="text-slate-600 mb-10 text-lg leading-relaxed">
                  Take a quick break! The timer has stopped. Ready to jump back in?
                </p>
                <button 
                  onClick={() => setIsPaused(false)}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-primary/30 hover:bg-primary-hover transition-all"
                >
                  Resume Playing
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-5xl flex-1 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>

      {/* Persistent Floating Controls Bar - Bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
        <div className="bg-slate-900/90 backdrop-blur-2xl px-6 py-4 rounded-[32px] shadow-2xl border border-white/20 flex items-center justify-between gap-6 pointer-events-auto">
          {/* Stats Group */}
          <div className="flex items-center gap-3">
             <button 
               onClick={onHint}
               className="w-12 h-12 bg-white/10 hover:bg-white/20 text-amber-400 rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-white/10" 
               title="Get Hint"
             >
               <Lightbulb size={24} fill="currentColor" fillOpacity={0.2} />
             </button>
             <button 
               onClick={() => {
                 if (timeLimit) setTimeRemaining(timeLimit);
                 onRetry?.();
               }}
               className="w-12 h-12 bg-white/10 hover:bg-white/20 text-sky-400 rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-white/10" title="Try Again"
             >
               <RotateCcw size={24} />
             </button>
          </div>

          {/* Center Timer Display */}
          {timeRemaining !== null && (
             <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/5 shadow-inner">
                   <Clock className="w-5 h-5 text-sky-400 animate-pulse" />
                   <span className="font-mono text-2xl font-black text-white tracking-widest">{formatTime(timeRemaining)}</span>
                </div>
             </div>
          )}

          {/* Primary Action Button */}
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="w-14 h-14 bg-sky-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-sky-500/30 hover:bg-sky-400 transition-all active:scale-95 border-2 border-white/20"
          >
            {isPaused ? <Play className="w-7 h-7 fill-current" /> : <Pause className="w-7 h-7 fill-current" />}
          </button>
        </div>
      </div>
    </div>
  );
}
