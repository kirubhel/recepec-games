'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, ArrowRight, Puzzle, HelpCircle, LayoutGrid } from 'lucide-react';
import PuzzleGame from './PuzzleGame';
import ArrangementGame from './ArrangementGame';

interface Question {
  id: string;
  type: 'mcq' | 'tf' | 'puzzle' | 'arrangement';
  question: string;
  options?: string[];
  answer: string | boolean | number | string[];
  image_url?: string;
  slices?: number;
  word?: string; // for arrangement
  letters?: string[]; // for arrangement
}

interface AssessmentLayerProps {
  questions: Question[];
  heroImage?: string;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export default function AssessmentLayer({ questions, heroImage, onComplete, onClose }: AssessmentLayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answer: any) => {
    let isAnswerCorrect = false;
    if (currentQuestion.type === 'tf') {
      isAnswerCorrect = answer === currentQuestion.answer;
    } else if (currentQuestion.type === 'mcq') {
      isAnswerCorrect = Number(answer) === Number(currentQuestion.answer);
    } else if (currentQuestion.type === 'puzzle' || currentQuestion.type === 'arrangement') {
      isAnswerCorrect = true; // Completion is success
    }

    setIsCorrect(isAnswerCorrect);
    setAnswers({ ...answers, [currentQuestion.id]: answer });
    setShowResult(true);

    if (isAnswerCorrect) {
      if (currentIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setShowResult(false);
          setIsCorrect(null);
        }, 2000);
      } else {
        // Assessment complete!
        setIsFinished(true);
        setTimeout(() => {
          onComplete(100); // 100 points for completion
        }, 3000);
      }
    } else {
        // Allow retry for incorrect MCQ/TF
        setTimeout(() => {
            setShowResult(false);
            setIsCorrect(null);
        }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-transparent backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden border-4 md:border-8 border-white max-h-[90vh] flex flex-col"
      >
        <div className="flex flex-col md:flex-row h-full overflow-y-auto">
            {/* Sidebar / Header info */}
            <div className="w-full md:w-72 bg-white p-6 md:p-10 text-slate-900 flex flex-row md:flex-col justify-between relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-slate-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                
                <div className="relative z-10 flex flex-col justify-center">
                    <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-[0.6rem] font-black uppercase tracking-widest text-primary mb-6 w-fit">
                        <Trophy size={12} /> Summarization
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-1 md:mb-4">Final Check</h2>
                    <p className="hidden md:block text-slate-400 font-bold italic text-xs">Review your progress.</p>
                </div>

                <div className="relative z-10 flex flex-col justify-center min-w-[120px] md:min-w-0">
                    <div className="flex gap-1.5 mb-3 md:mb-6">
                        {questions.map((_, idx) => (
                            <div key={idx} className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= currentIndex ? 'bg-primary' : 'bg-slate-100'}`} />
                        ))}
                    </div>
                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 text-right md:text-left">Step {currentIndex + 1} of {questions.length}</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center min-h-[350px] md:min-h-[500px] relative overflow-y-auto">
                <AnimatePresence mode="wait">
                    {isFinished ? (
                        <motion.div 
                            key="finished"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/20">
                                <Trophy size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Mission Accomplished!</h2>
                                <p className="text-slate-500 font-bold italic">You've successfully completed the activity.</p>
                            </div>
                            <div className="pt-4 animate-pulse">
                                <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary">Redirecting to Lesson...</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={currentIndex}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="w-full max-w-2xl space-y-6 md:space-y-10"
                        >
                        <div className="text-center space-y-3 md:space-y-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 text-slate-900 shadow-sm">
                                {currentQuestion.type === 'puzzle' ? <Puzzle size={24} className="md:w-8 md:h-8" /> : 
                                 currentQuestion.type === 'arrangement' ? <LayoutGrid size={24} className="md:w-8 md:h-8" /> :
                                 <HelpCircle size={24} className="md:w-8 md:h-8" />}
                            </div>
                            <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight uppercase">
                                {currentQuestion.question.toLowerCase().startsWith('http') ? 'Restore the Image' : currentQuestion.question}
                            </h3>
                        </div>

                        {currentQuestion.type === 'tf' && (
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                {[true, false].map((val) => (
                                    <button
                                        key={val.toString()}
                                        onClick={() => handleAnswer(val)}
                                        className="py-6 md:py-10 bg-slate-50 hover:bg-white hover:shadow-xl rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-100 font-black text-xl md:text-2xl uppercase tracking-widest text-slate-900 transition-all hover:border-primary/20 active:scale-95"
                                    >
                                        {val ? 'True' : 'False'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentQuestion.type === 'mcq' && (
                            <div className="space-y-2 md:space-y-4">
                                {currentQuestion.options?.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        className="w-full py-4 md:py-6 px-6 md:px-10 text-left bg-slate-50 hover:bg-white hover:shadow-xl rounded-2xl md:rounded-3xl border-2 border-slate-100 font-bold text-base md:text-lg text-slate-900 transition-all hover:border-primary/20 active:scale-95 flex items-center justify-between group"
                                    >
                                        <span className="truncate pr-4">{opt}</span>
                                        <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentQuestion.type === 'puzzle' && (
                            <div className="flex flex-col items-center w-full">
                                <PuzzleGame 
                                    data={{
                                        image_url: (currentQuestion.image_url || currentQuestion.question) || heroImage || '',
                                        puzzle_type: 'slice',
                                        slices: currentQuestion.slices || 4
                                    }}
                                    onSuccess={() => handleAnswer(true)}
                                />
                            </div>
                        )}

                        {currentQuestion.type === 'arrangement' && (
                            <div className="flex flex-col items-center scale-90 md:scale-100">
                                <ArrangementGame 
                                    data={{
                                        word: currentQuestion.word || (typeof currentQuestion.answer === 'string' ? currentQuestion.answer : ''),
                                        image: currentQuestion.image_url || heroImage,
                                        letters: currentQuestion.letters || (Array.isArray(currentQuestion.answer) ? currentQuestion.answer : [])
                                    }}
                                    onSuccess={() => handleAnswer(true)}
                                />
                            </div>
                        )}
                    </motion.div>
                    )}
                </AnimatePresence>

                {/* Result Message */}
                <AnimatePresence>
                    {showResult && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center mt-4"
                        >
                            <div className={`flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full text-white font-black uppercase tracking-widest text-[0.6rem] md:text-sm shadow-2xl ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                {isCorrect ? <CheckCircle size={16} className="md:w-5 md:h-5" /> : <XCircle size={16} className="md:w-5 md:h-5" />}
                                {isCorrect ? 'Excellent!' : 'Try Again'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
