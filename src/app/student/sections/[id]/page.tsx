'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, PlayCircle, BookOpen, CheckCircle, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRESPECT } from '@/components/RESPECTProvider';
import { fetchRespectSections, fetchGamesBySection } from '@/lib/respect/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

export default function SectionPlayerPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<any>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [contentSections, setContentSections] = useState<string[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({
    totalActivities: 0,
    completedCount: 0,
    completion: 0,
    xpEarned: 0
  });

  const handleComplete = (xp: number) => {
    setCompleted(true);
    // Save progress to localStorage
    const progress = JSON.parse(localStorage.getItem('respect_progress') || '{}');
    progress[id] = {
      completed: true,
      xp: xp,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('respect_progress', JSON.stringify(progress));
  };

  useEffect(() => {
    if (activities.length > 0) {
      let done = 0;
      let xp = 0;
      
      activities.forEach((activity, idx) => {
        const saved = localStorage.getItem(`mission_progress_${activity.id}_v3`);
        if (saved) {
          try {
            const pData = JSON.parse(saved);
            // Check for summary completion OR any level progress
            const isActivityDone = pData.summary?.completed || 
                                   Object.values(pData).some((d: any) => d && typeof d === 'object' && Object.keys(d).length > 0);
            
            if (isActivityDone) {
              done++;
              xp += (idx + 1) * 10;
            }
          } catch (e) {}
        }
      });
      
      const percent = Math.round((done / activities.length) * 100);
      setStats({
        totalActivities: activities.length,
        completedCount: done,
        completion: percent,
        xpEarned: xp
      });

      if (done === activities.length && activities.length > 0 && !completed) {
        handleComplete(xp);
      }
    }
  }, [activities, completed, id]);

  useEffect(() => {
    async function fetchSection() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/respect/sections/${id}`);
        if (res.ok) {
          const json = await res.json();
          const data = json.data;
          setSection(data);
          
          // Fetch activities (games) for this section
          const games = await fetchGamesBySection(id);
          setActivities(games);
          
          // Check if already completed
          const progress = JSON.parse(localStorage.getItem('respect_progress') || '{}');
          if (progress[id]) setCompleted(true);
          
          // Parse content sections
          if (data.content_body) {
            let parsed = data.content_body;
            if (typeof parsed === 'string' && parsed.startsWith('[')) {
              try { parsed = JSON.parse(parsed); } catch (e) { parsed = parsed.split('\n\n').filter((s: string) => s.trim() !== ''); }
            } else if (typeof parsed === 'string') {
              parsed = parsed.split('\n\n').filter((s: string) => s.trim() !== '');
            }
            setContentSections(Array.isArray(parsed) ? parsed : [parsed]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch section:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSection();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Entering the Vault...</p>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-4">CONTENT MISSING</h2>
        <Link href="/respect-minimal-games/" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">
            Back to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="h-48 bg-slate-900 relative overflow-hidden flex items-end px-10 pb-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-50" />
        <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
            <div className="space-y-2">
                <Link href={`/respect-minimal-games/student/courses/${section.respect_course_id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-2">
                    <ArrowLeft size={16} /> Back to RoadMap
                </Link>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{section.title}</h1>
            </div>
            <div className="hidden md:flex gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <BookOpen className="text-primary" size={28} />
                </div>
            </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-10 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Content Area */}
            <div className="lg:col-span-2 space-y-8">
                {/* Media Section */}
                <div className="bg-white rounded-[3rem] p-4 shadow-xl border border-white relative overflow-hidden group">
                    {section.video_url ? (
                        <div className="aspect-video rounded-[2.5rem] bg-slate-900 overflow-hidden relative shadow-2xl">
                            <iframe 
                                src={section.video_url.includes('youtube.com') ? section.video_url.replace('watch?v=', 'embed/') : section.video_url} 
                                className="w-full h-full"
                                allowFullScreen
                            />
                        </div>
                    ) : section.image_url ? (
                        <div className="aspect-video rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                            <img src={section.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="aspect-video rounded-[2.5rem] bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                            <PlayCircle size={64} className="mb-4 opacity-20" />
                            <p className="font-black uppercase tracking-widest text-xs">No visual media artifact</p>
                        </div>
                    )}
                </div>

                {/* Content Body */}
                <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl border border-white space-y-8">

                    {contentSections.length > 0 && (
                        <div className="pt-8 border-t border-slate-100 italic space-y-8">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-[0.6rem] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <BookOpen size={12} /> Part {currentPage + 1} of {contentSections.length}
                                </div>
                                <div className="flex gap-1">
                                    {contentSections.map((_, i) => (
                                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentPage ? 'w-6 bg-primary' : 'w-2 bg-slate-200'}`} />
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={currentPage}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="prose prose-slate prose-lg max-w-none font-medium text-slate-700 leading-loose whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ 
                                        __html: contentSections[currentPage]?.includes('<') 
                                            ? contentSections[currentPage] 
                                            : contentSections[currentPage]?.replace(/\n/g, '<br/>')
                                    }} 
                                />
                            </AnimatePresence>

                            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        currentPage === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    Previous
                                </button>
                                
                                {currentPage < contentSections.length - 1 ? (
                                    <button 
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        Next Part <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-[0.6rem] animate-bounce">
                                        <CheckCircle size={16} /> Reading Complete
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar / Stats / Activities */}
            <div className="space-y-8">
                <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                        <Sparkles size={20} className="text-primary" />
                        Lesson Activities
                    </h3>
                    
                    <div className="space-y-4">
                        {activities.length > 0 ? (
                            activities.map((activity, idx) => {
                                // Check if game is completed
                                let isDone = false;
                                const saved = localStorage.getItem(`mission_progress_${activity.id}_v3`);
                                if (saved) {
                                    try {
                                        const pData = JSON.parse(saved);
                                        isDone = pData.summary?.completed || 
                                                 Object.values(pData).some((d: any) => d && typeof d === 'object' && Object.keys(d).length > 0);
                                    } catch (e) {}
                                }

                                const hasSummary = activity.summary_questions && (Array.isArray(activity.summary_questions) ? activity.summary_questions.length > 0 : (typeof activity.summary_questions === 'string' && activity.summary_questions !== '[]'));
                                const typeLabel = hasSummary ? 'Quiz' : (activity.game_type === 5 ? 'Puzzle' : 'Activity');
                                const labelColor = isDone ? 'text-emerald-500' : (hasSummary ? 'text-amber-400' : 'text-primary');

                                return (
                                    <button 
                                        key={activity.id}
                                        onClick={() => router.push(`/respect-minimal-games/games/${activity.id}`)}
                                        className={`w-full p-4 hover:bg-white/10 border rounded-2xl transition-all flex items-center justify-between group/act ${isDone ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-3 text-left">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-white/40'}`}>
                                                {isDone ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-40" />}
                                            </div>
                                            <div>
                                                <p className={`text-[0.65rem] font-black uppercase tracking-widest ${labelColor} mb-0.5 flex items-center gap-1.5`}>
                                                    {typeLabel} {isDone && <span className="w-1 h-1 bg-emerald-500 rounded-full" />}
                                                </p>
                                                <p className={`text-sm font-bold truncate w-32 ${isDone ? 'text-emerald-100' : 'text-white'}`}>{activity.title}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className={`${isDone ? 'text-emerald-500' : 'text-slate-500'} group-hover/act:text-white group-hover/act:translate-x-1 transition-all`} />
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-500">No linked activities</p>
                            </div>
                        )}

                        <div className="pt-6 border-t border-white/10">
                            <button 
                                onClick={() => handleComplete(stats.xpEarned)}
                                disabled={completed}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${
                                    completed 
                                    ? 'bg-emerald-500 text-white cursor-default' 
                                    : 'bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95'
                                }`}
                            >
                                {completed ? (
                                    <><CheckCircle size={20} /> Section Mastered</>
                                ) : (
                                    'Complete Lesson'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                        <Sparkles size={20} className="text-primary" />
                        Quick Stats
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Total Activities</span>
                            <span className="text-xl font-black text-white">{stats.totalActivities}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Completion</span>
                            <span className="text-xl font-black text-emerald-400">{stats.completion}%</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">XP Earned</span>
                            <span className="text-xl font-black text-primary">{stats.xpEarned}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl">
                    <h3 className="text-xl font-black mb-6 text-slate-900 uppercase">Mission Tips</h3>
                    <p className="text-sm font-bold text-slate-500 italic leading-relaxed">
                        "Puzzles are unlocked after completing the basic activities in each section. Complete them to earn extra stars!"
                    </p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
