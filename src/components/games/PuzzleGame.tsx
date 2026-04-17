'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PuzzleGameProps {
  data: {
    image_url: string;
    puzzle_type: 'jigsaw' | 'slice';
    pieces?: number;
    slices?: number;
  };
  onSuccess: () => void;
}

const PuzzleGame = forwardRef(({ data, onSuccess }: PuzzleGameProps, ref) => {
  const [complete, setComplete] = useState(false);
  const [pieces, setPieces] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const isSlice = data.puzzle_type === 'slice';
  const count = isSlice ? (data.slices || 4) : (data.pieces || 9);

  useImperativeHandle(ref, () => ({
    handleRetry: () => {
      resetPuzzle();
    },
    handleHint: () => {
      // Show correct positions temporarily
    }
  }));

  const resetPuzzle = () => {
    const newPieces = Array.from({ length: count }).map((_, i) => ({
      id: i,
      currentPos: i,
      correctPos: i
    }));
    
    // Shuffle
    const shuffled = [...newPieces].sort(() => Math.random() - 0.5);
    setPieces(shuffled);
    setComplete(false);
    setSelectedIdx(null);
  };

  useEffect(() => {
    resetPuzzle();
  }, [data]);

  const gridSize = Math.sqrt(count);

  const handlePieceClick = (idx: number) => {
    if (complete) return;
    
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      // Swap pieces
      const newPieces = [...pieces];
      const temp = newPieces[selectedIdx];
      newPieces[selectedIdx] = newPieces[idx];
      newPieces[idx] = temp;
      
      setPieces(newPieces);
      setSelectedIdx(null);
      
      // Check if correct
      const isCorrect = newPieces.every((p, i) => p.id === i);
      if (isCorrect) {
        setComplete(true);
        setTimeout(onSuccess, 1500);
      }
    }
  };

  return (
    <div className="w-full max-w-full aspect-square bg-slate-100 rounded-[2rem] md:rounded-[3rem] p-2 md:p-4 shadow-inner border-2 md:border-4 border-white overflow-hidden relative touch-none">
      <div 
        className="grid h-full gap-1 md:gap-2"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`
        }}
      >
        {pieces.map((piece, i) => (
          <motion.div
            key={piece.id}
            layout
            onClick={() => handlePieceClick(i)}
            className={`
              relative cursor-pointer group overflow-hidden rounded-lg md:rounded-2xl transition-all
              ${selectedIdx === i ? 'ring-4 ring-primary ring-offset-2 z-10 scale-[0.98]' : 'hover:brightness-110'}
            `}
          >
             <div 
               className="w-full h-full bg-cover bg-center"
               style={{ 
                 backgroundImage: `url(${data.image_url})`,
                 backgroundSize: `${gridSize * 100}%`,
                 backgroundPosition: `${(piece.id % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(piece.id / gridSize) * (100 / (gridSize - 1))}%`
               }}
             />
             <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
          </motion.div>
        ))}
      </div>
      
      {complete && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-md z-20"
        >
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl text-center border-2 md:border-4 border-emerald-500">
             <div className="w-12 h-12 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4">
                <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">Solved!</h3>
          </div>
        </motion.div>
      )}
    </div>
  );
});

PuzzleGame.displayName = 'PuzzleGame';

export default PuzzleGame;
