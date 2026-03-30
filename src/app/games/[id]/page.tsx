'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GameWrapper, { DifficultyLevel } from '@/components/games/GameWrapper';
import ArrangementGame from '@/components/games/ArrangementGame';
import { motion, AnimatePresence } from 'framer-motion';
import { useRESPECT } from '@/components/RESPECTProvider';
import { reportProgress } from '@/lib/respect/reporting';

// Mock data for the specific "Letter Arrangement" game
const MOCK_LEVELS: Record<DifficultyLevel, { word: string; hint: string; image: string; }[]> = {
  easy: [
    { word: 'CAT', hint: 'A furry pet that meows', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400' },
    { word: 'DOG', hint: 'Man\'s best friend', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400' },
    { word: 'SUN', hint: 'The big bright star in the sky', image: 'https://images.unsplash.com/photo-1534840690959-ffc9710d868a?w=400' },
  ],
  medium: [
    { word: 'BIRD', hint: 'An animal that flies', image: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?w=400' },
    { word: 'FISH', hint: 'An animal that swims', image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400' },
    { word: 'TREE', hint: 'A tall plant with leaves', image: 'https://images.unsplash.com/photo-1544139159-4596d17af96d?w=400' },
  ],
  hard: [
    { word: 'ORANGE', hint: 'A round citrus fruit', image: 'https://images.unsplash.com/photo-1582284540020-8acaf0382b7c?w=400' },
    { word: 'PLANET', hint: 'A large rock in space', image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400' },
    { word: 'ROCKET', hint: 'Used to fly to the moon', image: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=400' },
  ]
};

export default function GamePlayPage() {
  const params = useParams();
  const id = params.id as string;
  const { launchInfo } = useRESPECT();
  
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load data (simulate API)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [id]);

  const currentData = MOCK_LEVELS[difficulty][currentIndex];

  const handleSuccess = () => {
    const newScore = score + 50;
    setScore(newScore);
    
    // Move to next level if available
    setTimeout(async () => {
      if (currentIndex < MOCK_LEVELS[difficulty].length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Completed all levels for this difficulty!
        console.log('RESPECT: Mission Completed! Reporting progress...');
        await reportProgress(
          launchInfo, 
          { id, title: 'Letter Arrangement' }, 
          { score: newScore, maxScore: MOCK_LEVELS[difficulty].length * 50, success: true }
        );
        
        // Return to home after delay
        setTimeout(() => window.location.href = '/', 2000);
      }
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-6"
        />
        <p className="text-xl font-bold text-slate-800 animate-pulse">Loading Mission...</p>
      </div>
    );
  }

  return (
    <GameWrapper
      title="Letter Arrangement"
      onDifficultyChange={(d: DifficultyLevel) => {
        setDifficulty(d);
        setCurrentIndex(0);
      }}
      currentDifficulty={difficulty}
      score={score}
    >
      <div className="w-full flex flex-col items-center">
        {/* Progress Dots */}
        <div className="flex gap-3 mb-12">
          {MOCK_LEVELS[difficulty].map((_, idx) => (
            <div 
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-primary w-10 scale-110' : 
                idx < currentIndex ? 'bg-emerald-400' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <ArrangementGame 
          data={currentData} 
          onSuccess={handleSuccess} 
        />
      </div>
    </GameWrapper>
  );
}
