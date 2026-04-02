'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import ConfettiEffect from './ConfettiEffect';

interface SortableItemProps {
  id: string;
  letter: string;
  isCorrect: boolean;
  showStatus: boolean;
}

function SortableItem({ id, letter, isCorrect, showStatus }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl md:rounded-3xl text-3xl md:text-4xl font-black shadow-lg cursor-grab active:cursor-grabbing transition-all
        ${isDragging ? 'z-50 opacity-50 scale-110 rotate-3' : 'opacity-100'}
        ${!showStatus ? 'bg-white text-slate-800 border-2 border-slate-200' : 
          isCorrect ? 'bg-emerald-500 text-white border-none shadow-emerald-200/50' : 
          'bg-red-500 text-white border-none shadow-red-200/50'}
      `}
    >
      {letter}
    </div>
  );
}

interface ArrangementGameProps {
  data: {
    word: string;
    image?: string;
    audio?: string;
    hint?: string;
    letters?: string[];
  };
  onSuccess?: () => void;
}

export default function ArrangementGame({ data, onSuccess }: ArrangementGameProps) {
  const [letters, setLetters] = useState<{ id: string; char: string }[]>([]);
  const [showStatus, setShowStatus] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const playAudio = () => {
    if (data.audio) {
      const audio = new Audio(data.audio);
      audio.play().catch(e => console.error("Audio playback failed", e));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Initialize letters in random order
    // Use data.letters if provided, otherwise split the word
    const charList = (data.letters && data.letters.length > 0) 
      ? data.letters 
      : data.word.split('');

    const chars = charList.map((char, index) => ({
      id: `${char}-${index}-${Math.random().toString(36).substr(2, 4)}`, // Add randomness to ID to avoid collisions
      char,
    }));
    
    // Simple shuffle
    let shuffled;
    const target = charList.join('');
    do {
      shuffled = [...chars].sort(() => Math.random() - 0.5);
    } while (shuffled.map(l => l.char).join('') === target && charList.length > 1);
    
    setLetters(shuffled);
    setShowStatus(false);
    setIsSuccess(false);
  }, [data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLetters((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArr = arrayMove(items, oldIndex, newIndex);
        
        // Check if correct
        const currentWord = newArr.map(l => l.char).join('');
        const targetWord = data.letters && data.letters.length > 0
          ? data.letters.join('')
          : data.word;

        if (currentWord === targetWord) {
          setShowStatus(true);
          setIsSuccess(true);
          if (onSuccess) {
            setTimeout(onSuccess, 3000);
          }
        }
        
        return newArr;
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence>
        {isSuccess && <ConfettiEffect active={true} />}
      </AnimatePresence>

      <motion.div 
        key={data.word}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-3xl flex flex-col items-center"
      >
        {/* Game Visual (Image) - Only show if image exists */}
        {data.image && data.image.trim() !== '' && (
          <div 
            onClick={playAudio}
            className={`
              w-48 h-48 md:w-64 md:h-64 bg-white rounded-[40px] shadow-xl overflow-hidden mb-8 border-4 border-white p-2 
              relative cursor-pointer hover:scale-105 active:scale-95 transition-all group/img
            `}
          >
            <div className="w-full h-full bg-slate-50 rounded-[32px] flex items-center justify-center">
              <img src={data.image} alt={data.word} className="w-full h-full object-cover rounded-[32px]" />
            </div>
            {data.audio && (
              <div className="absolute bottom-4 right-4 z-20 flex items-center justify-center animate-bounce-subtle">
                 <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-xl border-4 border-primary/20 hover:scale-110 active:scale-95 transition-all duration-300">
                    <Volume2 size={24} fill="currentColor" />
                 </div>
              </div>
            )}
            
            {/* Visual hint that it's clickable */}
            <div className="absolute inset-0 border-4 border-emerald-400 group-hover/img:opacity-100 opacity-0 transition-opacity rounded-[40px] pointer-events-none" />
          </div>
        )}

        {/* Hint Box (Compact) */}
        {!isSuccess && (
          <div className="glass-card px-6 py-2 rounded-xl mb-8 text-slate-500 font-black tracking-widest uppercase text-[10px] border-primary/10 bg-primary/5">
            {data.hint || 'Arrange the letters'}
          </div>
        )}

        {/* Interaction Area (Compact) */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 p-6 md:p-8 glass-card rounded-[32px] border-primary/5 shadow-inner">
            <SortableContext
              items={letters.map((l) => l.id)}
              strategy={horizontalListSortingStrategy}
            >
              {letters.map((letter, index) => (
                <SortableItem
                  key={letter.id}
                  id={letter.id}
                  letter={letter.char}
                  isCorrect={isSuccess}
                  showStatus={showStatus}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>

        {/* Feedback Message (Compact) */}
        <div className="h-12 mt-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-emerald-600 font-black text-3xl tracking-tight"
              >
                <CheckCircle2 className="w-10 h-10 fill-emerald-100" />
                Excellent! "{data.word}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
