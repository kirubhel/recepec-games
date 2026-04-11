'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GameWrapper, { DifficultyLevel } from '@/components/games/GameWrapper';
import ArrangementGame from '@/components/games/ArrangementGame';
import { motion, AnimatePresence } from 'framer-motion';
import { useRESPECT } from '@/components/RESPECTProvider';
import { reportProgress } from '@/lib/respect/reporting';
import { fetchRespectGame, parseGameData } from '@/lib/respect/api';
import { Loader2, Gamepad2, AlertCircle, Star } from 'lucide-react';
import ConfettiEffect from '@/components/games/ConfettiEffect';
import Link from 'next/link';

interface GameContent {
  id: string;
  word: string;
  picture: string;
  audio?: string;
  hint?: string;
  letters?: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

export default function GamePlayPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { launchInfo } = useRESPECT();
  
  const [game, setGame] = useState<any>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLevels, setCompletedLevels] = useState<Record<DifficultyLevel, Record<number, number>>>({
    easy: {},
    medium: {},
    hard: {}
  });

  const gameRef = useRef<any>(null);
  const [levelAids, setLevelAids] = useState({ hintUsed: false, retryCount: 0 });
  const [levelComplete, setLevelComplete] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [starsAchieved, setStarsAchieved] = useState(0);

  // Reset level aids on level change
  useEffect(() => {
    setLevelAids({ hintUsed: false, retryCount: 0 });
    setLevelComplete(false);
    setTimeUp(false);
    setRetryKey(0);
  }, [currentIndex, difficulty]);

  // Load real data from API using central utility
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        
        const gameData = await fetchRespectGame(id);
        
        if (gameData) {
          console.log(`Successfully synced mission: ${gameData.title}`);
          setGame(gameData);

          // Smart initial difficulty selection
          const easyLevels = parseGameData(gameData, 'easy');
          const mediumLevels = parseGameData(gameData, 'medium');
          const hardLevels = parseGameData(gameData, 'hard');

          if (easyLevels.length > 0) setDifficulty('easy');
          else if (mediumLevels.length > 0) setDifficulty('medium');
          else if (hardLevels.length > 0) setDifficulty('hard');

          // Load local progress
          const savedProgress = localStorage.getItem(`mission_progress_${id}_v3`);
          if (savedProgress) {
            setCompletedLevels(JSON.parse(savedProgress));
          } else {
            // Migration from v2
            const v2 = localStorage.getItem(`mission_progress_${id}_v2`);
            if (v2) {
              const old = JSON.parse(v2);
              const migrated: any = { easy: {}, medium: {}, hard: {} };
              Object.keys(old).forEach((diff) => {
                old[diff].forEach((idx: number) => {
                  migrated[diff][idx] = 3; // Default 3 stars for migrated
                });
              });
              setCompletedLevels(migrated);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'System connection failed.');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleSuccess = () => {
    if (currentIndex === null) return;

    const newScore = score + (game.points_reward || 50);
    setScore(newScore);
    
    // Performance-based stars: 3 max, -1 per hint, -1 per retry
    const stars = Math.max(3 - (levelAids.hintUsed ? 1 : 0) - levelAids.retryCount, 1);
    setStarsAchieved(stars);
    
    const updatedForDiff = {
      ...(completedLevels[difficulty] || {}),
      [currentIndex]: stars
    };
    const newCompleted = {
      ...completedLevels,
      [difficulty]: updatedForDiff
    };
    
    setCompletedLevels(newCompleted);
    localStorage.setItem(`mission_progress_${id}_v3`, JSON.stringify(newCompleted));
    setLevelComplete(true);

    // Handle Reporter
    const currentLevels = parseGameData(game, difficulty);
    if (currentIndex + 1 >= currentLevels.length) {
      if (Object.keys(updatedForDiff).length >= currentLevels.length) {
        reportProgress(
          launchInfo, 
          { id, title: game.title }, 
          { score: newScore, maxScore: currentLevels.length * 50, success: true }
        );
      }
    }
  };

  const handleNextPart = () => {
    const currentLevels = parseGameData(game, difficulty);
    const nextIndex = (currentIndex || 0) + 1;

    if (nextIndex < currentLevels.length) {
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex(null);
    }
    setLevelComplete(false);
  };

  const levels = parseGameData(game, difficulty);
  
  const formattedLevels: GameContent[] = levels.map((a: any) => ({
    id: a.id || Math.random().toString(),
    word: a.word || '',
    picture: a.picture || '',
    audio: a.audio || a.audio_url || '',
    hint: a.hint,
    letters: a.letters || []
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-20 h-20 rounded-[2rem] border-4 border-primary border-t-transparent shadow-xl mb-8"
        />
        <p className="text-xl font-black text-slate-800 uppercase tracking-widest animate-pulse">Syncing Mission Data...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-24 h-24 bg-red-100 rounded-[3rem] flex items-center justify-center text-red-500 mb-8">
           <AlertCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Mission Error</h2>
        <p className="text-slate-500 mb-10 max-w-sm font-semibold italic">{error || 'Unable to load quest payload.'}</p>
        <Link href="/respect-minimal-games/" className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-slate-200">
           Abort Mission
        </Link>
      </div>
    );
  }

  if (formattedLevels.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-[3rem] flex items-center justify-center text-amber-500 mb-8">
           <Gamepad2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Empty Quest</h2>
        <p className="text-slate-500 mb-10 max-w-sm font-semibold italic">This quest has no content for the selected difficulty.</p>
        <Link href="/respect-minimal-games/" className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-slate-200">
           Return Home
        </Link>
      </div>
    );
  }

  // Show Map View if no level is selected
  if (currentIndex === null) {
    return (
      <MissionsMap 
        title={game.title}
        game={game}
        completedProgress={completedLevels}
        onLevelSelect={(diff, index) => {
          setDifficulty(diff);
          setCurrentIndex(index);
        }}
        onBack={() => router.push('/respect-minimal-games/')}
      />
    );
  }

  const currentData = formattedLevels[currentIndex as number];

  return (
    <GameWrapper
      key={`${difficulty}-${currentIndex}-${retryKey}`}
      title={game.title}
      questPart={currentIndex + 1}
      onDifficultyChange={(d: DifficultyLevel) => {
        setDifficulty(d);
        setCurrentIndex(null); // Return to map on difficulty change
      }}
      currentDifficulty={difficulty}
      score={score}
      timeLimit={game.time_limit || (difficulty === 'easy' ? 180 : difficulty === 'medium' ? 120 : 60)}
      onTimeUp={() => setTimeUp(true)}
      onBack={() => setCurrentIndex(null)}
      onHint={() => {
        if (!levelAids.hintUsed) {
          setLevelAids(prev => ({ ...prev, hintUsed: true }));
          gameRef.current?.handleHint?.();
        }
      }}
      onRetry={() => {
        setLevelAids(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
        gameRef.current?.handleRetry?.();
      }}
    >
      <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* Success Overlay with Stars and Next Button */}
        <AnimatePresence>
          {levelComplete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6"
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

                 <div className="flex gap-3 mb-8 mt-16 items-end">
                    {[1, 2, 3].map((s) => (
                      <motion.div
                        key={s}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + (s * 0.1), type: 'spring' }}
                      >
                        <Star 
                          size={s === 2 ? 84 : 64} 
                          className={`${starsAchieved >= s ? 'text-amber-400 fill-amber-400 drop-shadow-lg' : 'text-slate-100'} ${s === 2 ? '-translate-y-4' : ''}`} 
                        />
                      </motion.div>
                    ))}
                 </div>
                 <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Excellent!</h2>
                 <p className="text-slate-400 font-bold mb-10 italic tracking-tight">Quest Part {(currentIndex || 0) + 1} Complete</p>
                 
                 <button 
                   onClick={handleNextPart}
                   className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all outline-none"
                 >
                    Next Part
                 </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeout Overlay (Sad Face + Try Again) */}
        <AnimatePresence>
          {timeUp && !levelComplete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-2xl flex items-center justify-center p-6"
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
                     setTimeUp(false);
                     setRetryKey(prev => prev + 1);
                   }}
                   className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-slate-400 hover:scale-105 active:scale-95 transition-all outline-none"
                 >
                    Try Again
                 </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion State Decoration (Full Mission) */}
        {game.completed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[60] bg-emerald-500 flex flex-col items-center justify-center p-10 text-white"
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

        {/* Dynamic Game Component Injection */}
        {game.game_type === 4 ? (
          <ArrangementGame 
            ref={gameRef}
            data={{
              word: currentData.word,
              image: currentData.picture,
              audio: currentData.audio,
              hint: currentData.hint,
              letters: currentData.letters
            }} 
            onSuccess={handleSuccess} 
          />
        ) : (
          <div className="p-20 glass-card rounded-[40px] text-center max-w-md border-primary/20">
             <AlertCircle className="w-16 h-16 text-primary mx-auto mb-6" />
             <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase">Unsupported Type</h3>
             <p className="text-slate-500 font-bold italic">
               Quest type {game.game_type} is not yet integrated with the player engine.
             </p>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}

// Sub-components used in the page
import MissionsMap from '@/components/games/MissionsMap';
