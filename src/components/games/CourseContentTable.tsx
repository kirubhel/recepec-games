'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Puzzle, 
  CheckCircle2, 
  Circle,
  BookOpen,
  ArrowRight,
  Lock,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Activity {
  id: string;
  title: string;
  type: string;
  isCompleted?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  activities: Activity[];
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  isLocked?: boolean;
  isCompleted?: boolean;
  lessons: Lesson[];
}

interface CourseContentTableProps {
  chapters: Chapter[];
  onStartActivity: (activityId: string) => void;
  onStartPuzzle: (lessonId: string) => void;
  onStartSection: (sectionId: string) => void;
}

export default function CourseContentTable({ chapters, onStartActivity, onStartPuzzle, onStartSection }: CourseContentTableProps) {
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    // Expand first unlocked chapter
    const firstUnlocked = chapters.find(c => !c.isLocked);
    return firstUnlocked ? { [firstUnlocked.id]: true } : {};
  });

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/50 overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/30 bg-white/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Course Roadmap</h2>
            <p className="text-slate-500 font-bold italic text-sm">Track your progress and choose your next quest.</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-white/30">
        {chapters.map((chapter, cIdx) => (
          <div key={chapter.id} className="overflow-hidden">
            <button 
              onClick={() => !chapter.isLocked && toggleChapter(chapter.id)}
              className={`w-full px-4 md:px-8 py-6 flex items-center justify-between transition-colors text-left ${
                chapter.isLocked ? 'opacity-60 cursor-not-allowed bg-slate-50/50' : 'hover:bg-white/30'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 transition-colors ${
                  chapter.isCompleted ? 'bg-emerald-500 text-white' : 
                  chapter.isLocked ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white'
                }`}>
                  {chapter.isCompleted ? <CheckCircle2 size={16} /> : cIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 group/title">
                    <h3 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!chapter.isLocked) onStartSection(chapter.id);
                      }}
                      className={`text-lg md:text-xl font-bold leading-tight transition-colors ${
                        chapter.isLocked ? 'text-slate-400' : 'text-slate-800 hover:text-primary cursor-pointer underline decoration-primary/0 hover:decoration-primary/30 underline-offset-4'
                      }`}
                    >
                      {chapter.title}
                    </h3>
                    {chapter.isLocked && <Lock size={14} className="text-slate-300" />}
                    {chapter.isCompleted && <span className="text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest">Mastered</span>}
                  </div>
                </div>
              </div>
              {!chapter.isLocked && (expandedChapters[chapter.id] ? <ChevronDown size={20} className="flex-shrink-0 ml-4" /> : <ChevronRight size={20} className="flex-shrink-0 ml-4" />)}
            </button>

            <AnimatePresence>
              {expandedChapters[chapter.id] && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white/10"
                >
                  <div className="px-4 md:px-8 pb-8 space-y-6">
                    {chapter.lessons.map((lesson) => (
                      <div key={lesson.id} className="bg-white/50 rounded-[2rem] p-5 md:p-6 border border-white/50 shadow-sm">
                        {lesson.description && (
                          <div className="mb-6 p-4 bg-white/30 rounded-2xl border border-white/40">
                             <p className="text-[0.65rem] font-black uppercase tracking-widest text-primary mb-1">Lesson Brief</p>
                             <p className="text-xs font-bold text-slate-500 italic leading-relaxed">{lesson.description}</p>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <h4 
                            onClick={() => onStartSection(lesson.id)}
                            className="text-base md:text-lg font-black text-slate-700 uppercase tracking-tight cursor-pointer hover:text-primary transition-colors underline decoration-transparent hover:decoration-primary/30 underline-offset-4"
                          >
                            {lesson.title}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                             <button 
                               onClick={() => onStartPuzzle(lesson.id)}
                               className="flex-1 sm:flex-none px-4 py-2 bg-amber-100 text-amber-600 rounded-xl text-[0.6rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-200 transition-colors"
                             >
                               <Puzzle size={14} />
                               Puzzle
                             </button>
                             <button 
                               onClick={() => onStartSection(lesson.id)}
                               className="flex-1 sm:flex-none px-4 py-2 bg-blue-100 text-blue-600 rounded-xl text-[0.6rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-200 transition-colors"
                             >
                               <BookOpen size={14} />
                               Study Content
                             </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {lesson.activities.map((activity) => (
                            <div 
                              key={activity.id}
                              className="group flex items-center justify-between p-4 bg-white/80 rounded-2xl border border-transparent"
                            >
                              <div className="flex items-center gap-3">
                                {activity.isCompleted ? (
                                  <CheckCircle2 size={18} className="text-emerald-500" />
                                ) : (
                                  <Circle size={18} className="text-slate-300" />
                                )}
                                <span className="text-sm font-bold text-slate-600">{activity.title}</span>
                              </div>
                              {/* Action button removed to disable direct routing from roadmap */}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
