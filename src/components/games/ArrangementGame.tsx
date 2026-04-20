'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
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
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Volume2 } from 'lucide-react';
import ConfettiEffect from './ConfettiEffect';

interface SortableItemProps {
  id: string;
  letter: string;
  isCorrect: boolean;
  showStatus: boolean;
  sizeClass: string;
}

function SortableItem({ id, letter, isCorrect, showStatus, sizeClass }: SortableItemProps) {
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
      style={{ ...style, touchAction: 'none' }}
      {...attributes}
      {...listeners}
      className={`
        ${sizeClass} flex items-center justify-center rounded-2xl md:rounded-3xl font-black shadow-lg cursor-grab active:cursor-grabbing transition-all
        ${isDragging ? 'z-50 opacity-50 scale-110 rotate-3 shadow-2xl ring-4 ring-primary/20' : 'opacity-100'}
        ${!showStatus ? 'bg-white text-slate-800 border-2 border-slate-200' : 
          isCorrect ? 'bg-emerald-500 text-white border-none shadow-emerald-200/50 scale-105' : 
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

const ArrangementGame = forwardRef((props: ArrangementGameProps, ref) => {
  const { data, onSuccess } = props;
  const [letters, setLetters] = useState<{ id: string; char: string }[]>([]);
  const [showStatus, setShowStatus] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hintIndex, setHintIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const initGame = () => {
    const charList = (data.letters && data.letters.length > 0) 
      ? data.letters 
      : data.word.split('');

    const chars = charList.map((char, index) => ({
      id: `${char}-${index}-${Math.random().toString(36).substr(2, 4)}`,
      char,
    }));
    
    let shuffled;
    const target = charList.join('');
    do {
      shuffled = [...chars].sort(() => Math.random() - 0.5);
    } while (shuffled.map(l => l.char).join('') === target && charList.length > 1);
    
    setLetters(shuffled);
    setShowStatus(false);
    setIsSuccess(false);
    setHintIndex(null);
  };

  useImperativeHandle(ref, () => ({
    handleRetry: () => {
      initGame();
    },
    handleHint: () => {
      if (isSuccess) return;
      const targetWord = data.letters && data.letters.length > 0 ? data.letters.join('') : data.word;
      const currentWordArr = letters.map(l => l.char);
      
      let firstBadIdx = -1;
      for (let i = 0; i < targetWord.length; i++) {
        if (currentWordArr[i] !== targetWord[i]) {
          firstBadIdx = i;
          break;
        }
      }

      if (firstBadIdx !== -1) {
        setHintIndex(firstBadIdx);
        setTimeout(() => setHintIndex(null), 2000);
      }
    }
  }));

  useEffect(() => {
    initGame();
  }, [data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
       setLetters((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArr = arrayMove(items, oldIndex, newIndex);
        
        const currentWord = newArr.map(l => l.char).join('');
        const targetWord = data.letters && data.letters.length > 0 ? data.letters.join('') : data.word;

        if (currentWord === targetWord) {
          setShowStatus(true);
          setIsSuccess(true);
          if (onSuccess) setTimeout(onSuccess, 3000);
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
        key={`${data.word}-body`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-3xl flex flex-col items-center"
      >
        {data.image && data.image !== 'null' && data.image.trim() !== '' && (
          <div onClick={() => data.audio && new Audio(data.audio).play()}
            className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-[40px] shadow-2xl overflow-hidden mb-6 border-4 border-white p-3 relative cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group/img"
          >
            <div className="w-full h-full bg-slate-50 rounded-[32px] flex items-center justify-center">
              <img src={data.image} alt={data.word} className="w-full h-full object-cover rounded-[32px]" />
            </div>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 p-4 md:p-6 glass-card rounded-[32px] border-primary/5 shadow-inner">
            <SortableContext items={letters.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
              {letters.map((letter, index) => {
                const boxSize = letters.length > 8 ? 'w-12 h-12 md:w-14 md:h-14 text-xl md:text-2xl' : 
                               letters.length > 5 ? 'w-14 h-14 md:w-16 md:h-16 text-2xl md:text-3xl' : 
                               'w-16 h-16 md:w-20 md:h-20 text-3xl md:text-4xl';
                return (
                  <div key={letter.id} className={hintIndex === index ? 'ring-4 ring-amber-400 rounded-3xl animate-pulse z-40 relative' : ''}>
                    <SortableItem
                      id={letter.id}
                      letter={letter.char}
                      isCorrect={isSuccess}
                      showStatus={showStatus}
                      sizeClass={boxSize}
                    />
                  </div>
                );
              })}
            </SortableContext>
          </div>
        </DndContext>

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
});

export default ArrangementGame;
