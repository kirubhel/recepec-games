'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GameWrapper, { DifficultyLevel } from '@/components/games/GameWrapper';
import ArrangementGame from '@/components/games/ArrangementGame';
import { motion, AnimatePresence } from 'framer-motion';
import { useRESPECT } from '@/components/RESPECTProvider';
import { reportProgress } from '@/lib/respect/reporting';
import { fetchRespectGame, parseGameData } from '@/lib/respect/api';
import { Loader2, Gamepad2, AlertCircle } from 'lucide-react';
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
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

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

          // Smart initial difficulty selection: First available difficulty
          const easyLevels = parseGameData(gameData, 'easy');
          const mediumLevels = parseGameData(gameData, 'medium');
          const hardLevels = parseGameData(gameData, 'hard');

          if (easyLevels.length > 0) {
            setDifficulty('easy');
          } else if (mediumLevels.length > 0) {
            setDifficulty('medium');
          } else if (hardLevels.length > 0) {
            setDifficulty('hard');
          } else {
            // Default fallback if no content anywhere (handled by UI)
            setDifficulty('easy');
          }

          // Load local progress for this mission
          const savedProgress = localStorage.getItem(`mission_progress_${id}`);
          if (savedProgress) {
            setCompletedLevels(JSON.parse(savedProgress));
          }
        } else {
          throw new Error('Quest not found in cloud registry or payload is corrupt.');
        }
      } catch (err: any) {
        console.error('RESPECT Sync error:', err);
        setError(err.message || 'System connection failed.');
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  // Robustly extract activities for current difficulty via utility
  const levels = parseGameData(game, difficulty);
  
  const formattedLevels: GameContent[] = levels.map((a: any) => ({
    id: a.id || Math.random().toString(),
    word: a.word || '',
    picture: a.picture || '',
    audio: a.audio || a.audio_url || '',
    hint: a.hint,
    letters: a.letters || []
  }));

  const handleSuccess = () => {
    if (currentIndex === null) return;

    const newScore = score + (game.points_reward || 50);
    setScore(newScore);
    
    // Mission Completed!
    console.log('RESPECT: Level Completed! Reporting progress...');
    
    // Update local progress
    const updatedCompleted = [...new Set([...completedLevels, currentIndex])];
    setCompletedLevels(updatedCompleted);
    localStorage.setItem(`mission_progress_${id}`, JSON.stringify(updatedCompleted));

    setTimeout(async () => {
      // Check if mission is fully complete
      if (updatedCompleted.length >= formattedLevels.length) {
        const maxScore = formattedLevels.length * (game.points_reward || 50);
        
        await reportProgress(
          launchInfo, 
          { id, title: game.title }, 
          { score: newScore, maxScore, success: true }
        );
        
        setGame((prev: any) => ({ ...prev, completed: true }));
        setTimeout(() => router.push('/respect-minimal-games/'), 3000);
      } else {
        // Return to map
        setCurrentIndex(null);
      }
    }, 2500);
  };

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
        levels={formattedLevels}
        difficulty={difficulty}
        completedLevels={completedLevels}
        onLevelSelect={(index) => setCurrentIndex(index)}
        onBack={() => router.push('/respect-minimal-games/')}
      />
    );
  }

  const currentData = formattedLevels[currentIndex];

  return (
    <GameWrapper
      key={`${difficulty}-${currentIndex}`}
      title={game.title}
      onDifficultyChange={(d: DifficultyLevel) => {
        setDifficulty(d);
        setCurrentIndex(null); // Return to map on difficulty change
      }}
      currentDifficulty={difficulty}
      score={score}
      timeLimit={game.time_limit || (difficulty === 'easy' ? 180 : difficulty === 'medium' ? 120 : 60)}
      onBack={() => setCurrentIndex(null)}
    >
      <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* Completion State Decoration */}
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

        {/* Level Indicator */}
        <div className="mb-6 text-center">
            <span className="px-6 py-2 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest">
               Quest Part {currentIndex + 1}
            </span>
        </div>

        {/* Dynamic Game Component Injection */}
        {game.game_type === 4 ? (
          <ArrangementGame 
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
