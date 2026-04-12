'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Clock, Trophy, Home, Lightbulb, RotateCcw, ArrowLeft, Gamepad2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ConfettiEffect from '@/components/games/ConfettiEffect';

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
  showCountdown?: boolean;
  isLevelComplete?: boolean;
  isTimeUp?: boolean;
  stars?: number;
  onNext?: () => void;
  onTryAgain?: () => void;
  isMissionComplete?: boolean;
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
  showCountdown = true,
  isLevelComplete = false,
  isTimeUp = false,
  stars = 0,
  onNext,
  onTryAgain,
  isMissionComplete = false,
}: GameWrapperProps) {
  const router = useRouter();
  const [isPaused, setIsPaused] = useState(showCountdown);
  const [countdown, setCountdown] = useState(showCountdown ? 3 : 0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit || null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && showCountdown && isPaused) {
      setIsPaused(false);
    }
  }, [countdown, showCountdown, isPaused]);

  useEffect(() => {
    if (!isPaused && timeRemaining !== null && timeRemaining > 0 && !isLevelComplete && !isTimeUp && !isMissionComplete) {
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
  }, [isPaused, timeRemaining, onTimeUp, isLevelComplete, isTimeUp, isMissionComplete]);

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
                  disabled={countdown > 0 || isLevelComplete || isTimeUp || isMissionComplete}
                  className="w-8 h-8 flex items-center justify-center text-amber-500 hover:bg-amber-100 rounded-lg transition-all active:scale-90 disabled:opacity-50"
                >
                  <Lightbulb size={18} fill="currentColor" fillOpacity={0.2} />
                </button>
                <button 
                  onClick={() => {
                    if (timeLimit) setTimeRemaining(timeLimit);
                    onRetry?.();
                  }}
                  disabled={countdown > 0 || isLevelComplete || isTimeUp || isMissionComplete}
                  className="w-8 h-8 flex items-center justify-center text-sky-500 hover:bg-sky-100 rounded-lg transition-all active:scale-90 disabled:opacity-50"
                >
                  <RotateCcw size={18} />
                </button>
             </div>
          </div>

          {/* Right Block: Pause */}
          <button 
            onClick={() => setIsPaused(!isPaused)}
            disabled={countdown > 0 || isLevelComplete || isTimeUp || isMissionComplete}
            className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all disabled:opacity-50"
          >
            {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
          </button>

        </div>
      </header>

      {/* Main Game Area - Non-Scrollable */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {isPaused && countdown === 0 && !isLevelComplete && !isTimeUp && !isMissionComplete && (
            <motion.div 
              key="pause-overlay"
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

        <div className={`w-full max-w-lg flex-1 flex flex-col items-center justify-center transition-opacity duration-500 ${countdown > 0 || isLevelComplete || isTimeUp || isMissionComplete ? 'opacity-20 translate-y-10' : 'opacity-100 translate-y-0'}`}>
           {children}
        </div>
      </main>

      {/* Global Overlays - Placed at the very end to ensure 'on top' status */}
      <AnimatePresence mode="wait">
        {countdown > 0 && (
          <motion.div 
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
             <motion.div
               key={countdown}
               initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
               animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
               exit={{ scale: 3, opacity: 0, rotate: 20 }}
               transition={{ 
                 type: 'spring',
                 stiffness: 260,
                 damping: 20,
                 duration: 0.5 
               }}
               className="text-white text-[12rem] font-black italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] leading-none mb-4"
             >
               {countdown}
             </motion.div>
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col items-center gap-2"
             >
               <p className="text-white/80 text-2xl font-black uppercase tracking-[0.4em]">Get Ready</p>
               <div className="h-1.5 w-40 bg-white/20 rounded-full overflow-hidden mt-2">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(255,107,0,0.5)]"
                  />
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLevelComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[510] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <ConfettiEffect active={true} />
            <motion.div 
              initial={{ scale: 0.8, y: 50, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              className="bg-white rounded-[50px] p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col items-center max-w-sm w-full text-center border-b-[12px] border-slate-100 relative"
            >
               <div className="absolute -top-16 w-32 h-32 bg-amber-400 rounded-full flex items-center justify-center shadow-xl border-8 border-white">
                  <Star size={64} className="text-white fill-white" />
               </div>

               <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2 mt-12">Excellent!</h2>
               {questPart && (
                 <p className="text-slate-400 font-bold mb-8 italic tracking-tight">Quest Part {questPart} Complete</p>
               )}

               <div className="flex gap-3 mb-10 items-end">
                  {[1, 2, 3].map((s) => (
                    <motion.div
                      key={s}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + (s * 0.1), type: 'spring' }}
                    >
                      <Star 
                        size={s === 2 ? 84 : 64} 
                        className={`${stars >= s ? 'text-amber-400 fill-amber-400 drop-shadow-lg' : 'text-slate-100'} ${s === 2 ? '-translate-y-4' : ''}`} 
                      />
                    </motion.div>
                  ))}
               </div>
               
               <button 
                 onClick={onNext}
                 className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all outline-none"
               >
                  Next Part
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTimeUp && !isLevelComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[520] bg-slate-900/80 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[50px] p-12 shadow-3xl flex flex-col items-center max-w-sm w-full text-center border-b-[12px] border-slate-200 relative"
            >
               <div className="absolute -top-16 w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center shadow-xl border-8 border-white overflow-hidden">
                  <motion.div
                    animate={{ y: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-6xl"
                  >
                    😢
                  </motion.div>
               </div>

               <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 mt-8">Time's Up!</h2>
               <p className="text-slate-500 font-bold mb-10 italic tracking-tight leading-relaxed px-4">
                  Don't give up! You were so close. Let's try once more!
               </p>
               
               <button 
                 onClick={() => {
                   if (timeLimit) setTimeRemaining(timeLimit);
                   onTryAgain?.();
                 }}
                 className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-slate-400 hover:scale-105 active:scale-95 transition-all outline-none"
               >
                  Try Again
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMissionComplete && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[530] bg-emerald-500 flex flex-col items-center justify-center p-10 text-white"
          >
             <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center text-emerald-500 mb-8 shadow-2xl pulse-emerald">
                <Gamepad2 size={80} />
             </div>
             <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Mission Complete!</h2>
             <p className="text-xl font-bold opacity-80 mb-12">XP Rewards Reported to Learning Cloud</p>
             <div className="text-2xl font-black py-4 px-10 bg-white/20 rounded-full">
                Score: {score}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
