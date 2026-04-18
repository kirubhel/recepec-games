'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourseContentTable, { Chapter } from '@/components/games/CourseContentTable';
import { fetchRespectSections, fetchGamesBySection, fetchRespectCourse } from '@/lib/respect/api';
import { Loader2, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sectionsData, courseData] = await Promise.all([
          fetchRespectSections(id),
          fetchRespectCourse(id)
        ]);
        
        setCourse(courseData);
        
        // Get progress from localStorage
        const progress = JSON.parse(localStorage.getItem('respect_progress') || '{}');
        
        // Sort sections by order_index
        const sortedSections = [...sectionsData].sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

        const fullChapters = await Promise.all(
          sortedSections.map(async (section: any, index: number) => {
            const games = await fetchGamesBySection(section.id);
            // Sort games within section
            const sortedGames = [...games].sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
            
            // Logic for unlocking: 
            // 1. First section is always unlocked
            // 2. Subsequent sections are unlocked if the previous section is completed
            let isLocked = false;
            if (index > 0) {
              const previousSectionId = sortedSections[index - 1].id;
              if (!progress[previousSectionId]) {
                isLocked = true;
              }
            }

            return {
              id: section.id,
              title: section.title,
              description: section.description,
              isLocked: isLocked,
              isCompleted: !!progress[section.id],
              lessons: [
                {
                  id: section.id,
                  title: 'Activities',
                  description: section.description,
                  activities: sortedGames.map((g: any) => ({
                    id: g.id,
                    title: g.title,
                    type: g.game_type === 5 ? 'puzzle' : 'activity',
                    isCompleted: false // Game specific progress can be added later
                  }))
                }
              ]
            };
          })
        );
        
        setChapters(fullChapters);
      } catch (err) {
        console.error('Error loading course details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Building your roadmap...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Dynamic Header */}
      <div className="h-64 bg-slate-900 relative overflow-hidden flex items-end px-10 pb-10">
         {/* Background Image */}
         {course?.background_url && (
            <img 
               src={course.background_url} 
               alt=""
               className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
         <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/20 rounded-full blur-[120px]" />
         
         <div className="relative z-20 w-full max-w-7xl mx-auto flex items-center justify-between text-white">
            <div className="space-y-4">
               <Link href="/respect-minimal-games/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
                  <ArrowLeft size={16} />
                  Back to Hub
               </Link>
               <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                  {course?.name || 'Course Contents'}
               </h1>
               {course?.description && (
                  <div className="mt-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 max-w-2xl">
                     <p className="text-sm md:text-base font-medium text-slate-200 leading-relaxed">
                        {course.description}
                     </p>
                  </div>
               )}
            </div>
            
            <div className="hidden md:flex items-center gap-6">
               <div className="text-right">
                  <p className="text-[0.65rem] font-black uppercase tracking-widest text-primary">Mastery Level</p>
                  <p className="text-2xl font-black">Level 1</p>
               </div>
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                  <Trophy className="text-primary" size={32} />
               </div>
            </div>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-30 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Table Content */}
          <div className="lg:col-span-2">
            <CourseContentTable 
              chapters={chapters} 
              onStartActivity={(activityId) => {
                 // Disable direct routing to activities from roadmap
                 console.log("Activity clicked but direct routing is disabled. Go to Study Content first.");
              }}
              onStartSection={(sectionId) => {
                 router.push(`/respect-minimal-games/student/sections/${sectionId}`);
              }}
              onStartPuzzle={(lessonId) => {
                 // Direct puzzle routing disabled, go to section instead
                 const chapter = chapters.find(c => c.lessons.some((l: any) => l.id === lessonId));
                 router.push(`/respect-minimal-games/student/sections/${chapter?.id}`);
              }}
            />
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8">

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
