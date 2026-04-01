'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Clock, Trophy, Home } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Premium Game Header */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 glass-card border-b-0 rounded-b-[32px] mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/respect-minimal-games/')}
              className="p-3 glass-button rounded-2xl text-slate-700 hover:text-primary transition-all active:scale-95"
              title="Return Home"
            >
              <Home size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{title}</h2>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">{currentDifficulty} MODE</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-white/50 px-5 py-2.5 rounded-2xl border border-white/40 shadow-sm">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-slate-700">{score} XP</span>
            </div>

            {timeRemaining !== null && (
              <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-lg">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
              </div>
            )}

            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors"
            >
              {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center px-6 pb-12 overflow-hidden relative">
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
          {/* Difficulty Selector */}
          <div className="flex justify-center mb-10">
            <div className="glass-button p-1.5 rounded-2xl flex gap-1">
              {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onDifficultyChange(level)}
                  className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
                    currentDifficulty === level 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
