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
import { CheckCircle2, XCircle } from 'lucide-react';
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
    hint?: string;
  };
  onSuccess?: () => void;
}

export default function ArrangementGame({ data, onSuccess }: ArrangementGameProps) {
  const [letters, setLetters] = useState<{ id: string; char: string }[]>([]);
  const [showStatus, setShowStatus] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Initialize letters in random order
    const chars = data.word.split('').map((char, index) => ({
      id: `${char}-${index}`,
      char,
    }));
    
    // Simple shuffle
    let shuffled;
    do {
      shuffled = [...chars].sort(() => Math.random() - 0.5);
    } while (shuffled.map(l => l.char).join('') === data.word && data.word.length > 1);
    
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
        if (currentWord === data.word) {
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
        {/* Game Visual (Image or Placeholder) */}
        <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-[48px] shadow-2xl overflow-hidden mb-12 border-8 border-white p-4">
          <div className="w-full h-full bg-slate-100 rounded-[32px] flex items-center justify-center text-8xl">
            {data.image ? <img src={data.image} alt={data.word} className="w-full h-full object-cover rounded-[32px]" /> : '🖼️'}
          </div>
        </div>

        {/* Hint Box */}
        <div className="glass-card px-8 py-3 rounded-2xl mb-12 text-slate-600 font-bold tracking-widest uppercase text-sm border-primary/20 bg-primary/5">
          {data.hint || 'Arrange the letters to spell the word'}
        </div>

        {/* Interaction Area */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 p-10 glass-card rounded-[40px] border-primary/10">
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

        {/* Feedback Message */}
        <div className="h-20 mt-12 flex items-center justify-center">
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
