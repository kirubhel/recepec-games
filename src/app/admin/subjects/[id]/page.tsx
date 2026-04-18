'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Save, Layout, Type, Info, ChevronRight,
  UploadCloud, CheckCircle2, AlertCircle, Loader2, Database, BookOpen,
  Settings, MoreVertical, Layers, Puzzle, Gamepad2, Edit2, ListFilter,
  Video, Image as ImageIcon, FileText, HelpCircle, X, Check, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRespectCourse, fetchRespectSections, fetchGamesBySection } from '@/lib/respect/api';
import DynamicGameDataEditor from '@/components/admin/DynamicGameDataEditor';

interface Question {
  id: string;
  type: 'mcq' | 'tf' | 'puzzle';
  question: string;
  options?: string[];
  answer: string | boolean | number;
  image_url?: string;
  slices?: number;
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  game_type: number;
  order_index: number;
  image_url?: string;
  video_url?: string;
  content_body?: string;
  summary_questions?: Question[];
  respect_grade_level_id?: string;
  instructions?: string;
  points_reward?: number;
  time_limit?: number;
  game_data?: any;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  image_url?: string;
  video_url?: string;
  content_body?: string;
  summary_questions?: Question[];
  activities: Activity[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

export default function CurriculumManager({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const courseId = resolvedParams.id;
  
  const [course, setCourse] = useState<any>(null);
  const [gradeLevels, setGradeLevels] = useState<any[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<null | 'success' | 'error'>(null);
  const [statusMsg, setStatusMsg] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState<null | 'section' | 'activity'>(null);
  const [modalTab, setModalTab] = useState<'basics' | 'media' | 'content' | 'questions' | 'game' | 'settings'>('basics');
  
  // Form states merged for both section and activity
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'section' | 'activity'; title: string } | null>(null);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    image_url: '',
    video_url: '',
    content_body: [''],
    instructions: '',
    points_reward: 10,
    time_limit: 60,
    is_active: true,
    is_free: true,
    enable_instruction_audio: true,
    game_type: 4,
    grade_level_id: '',
    order_index: 0,
    game_data: {}
  });

  const parseContentBody = (content: any): string[] => {
    if (Array.isArray(content)) return content;
    if (!content) return [''];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return content.split('\n\n').filter((s: string) => s.trim() !== '') || [''];
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const updateContentSection = (index: number, value: string) => {
    const newContent = [...formData.content_body];
    newContent[index] = value;
    handleFieldChange('content_body', newContent);
  };

  const addContentSection = () => {
    handleFieldChange('content_body', [...formData.content_body, '']);
  };

  const removeContentSection = (index: number) => {
    const newContent = formData.content_body.filter((_: any, i: number) => i !== index);
    handleFieldChange('content_body', newContent.length > 0 ? newContent : ['']);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      const endpoint = deleteTarget.type === 'section' 
        ? `${API_BASE_URL}/respect/sections/${deleteTarget.id}`
        : `${API_BASE_URL}/respect/games/${deleteTarget.id}`;
      
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      
      await loadCurriculum();
      setDeleteTarget(null);
      notify(`${deleteTarget.type === 'section' ? 'Section' : 'Activity'} deleted`, 'success');
    } catch (err) {
      notify('Error deleting item', 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadCurriculum();
  }, [courseId]);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      const [cData, sData, glData] = await Promise.all([
        fetchRespectCourse(courseId),
        fetchRespectSections(courseId),
        fetch(`${API_BASE_URL}/respect/grade-levels`).then(res => res.json())
      ]);
      setCourse(cData);
      setGradeLevels(glData.data || []);
      
      const enrichedSections = await Promise.all(
        sData.map(async (sec: any) => {
          const activities = await fetchGamesBySection(sec.id);
          // Sort activities within section
          const sortedActivities = activities.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
          return { ...sec, activities: sortedActivities };
        })
      );
      
      // Sort sections by order_index
      const sortedSections = enrichedSections.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
      setSections(sortedSections);
      
      // Default grade level for new items
      if (glData.data?.length > 0) {
        setFormData((prev: any) => ({ ...prev, grade_level_id: glData.data[0].id }));
      }
    } catch (err) {
      console.error('Curriculum Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isSection = showModal === 'section';
    
    const contentStr = Array.isArray(formData.content_body) 
      ? formData.content_body.join('\n\n') 
      : formData.content_body;

    const payload: any = {
      title: formData.title,
      description: formData.description,
      image_url: formData.image_url,
      video_url: formData.video_url,
      content_body: contentStr,
      summary_questions: questions,
      is_active: true
    };

    if (isSection) {
      payload.respect_course_id = courseId;
      payload.order_index = parseInt(formData.order_index as string) || (editingItem ? editingItem.order_index : sections.length + 1);
    } else {
      payload.respect_section_id = activeSectionId;
      payload.game_type = parseInt(formData.game_type as string);
      payload.grade_level_id = formData.grade_level_id || gradeLevels[0]?.id || '';
      payload.order_index = parseInt(formData.order_index as string) || (editingItem ? editingItem.order_index : 0);
      payload.course_id = courseId;
      payload.instructions = formData.instructions;
      payload.points_reward = formData.points_reward;
      payload.time_limit = formData.time_limit;
      payload.is_active = formData.is_active;
      payload.is_free = formData.is_free;
      payload.enable_instruction_audio = formData.enable_instruction_audio;
      payload.game_data = formData.game_data || {};
      payload.content_body = contentStr;
      payload.image_url = formData.image_url;
      payload.video_url = formData.video_url;
    }

    try {
      setSaving(true);
      const endpoint = isSection 
        ? (editingItem ? `${API_BASE_URL}/respect/sections/${editingItem.id}` : `${API_BASE_URL}/respect/sections`)
        : (editingItem ? `${API_BASE_URL}/respect/games/${editingItem.id}` : `${API_BASE_URL}/respect/games`);
      
      const res = await fetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save');
      
      await loadCurriculum();
      setShowModal(null);
      setEditingItem(null);
      setQuestions([]);
      notify(`${isSection ? 'Section' : 'Activity'} saved successfully`, 'success');
    } catch (err) {
      notify('Error saving changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (type: 'mcq' | 'tf' | 'puzzle') => {
    const newQ: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      question: '',
      options: type === 'mcq' ? ['', '', ''] : undefined,
      answer: type === 'mcq' ? '' : true
    };
    setQuestions([...questions, newQ]);
  };

  const notify = (msg: string, type: 'success' | 'error') => {
    setStatusMsg(msg);
    setStatus(type);
    setTimeout(() => setStatus(null), 3000);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 size={64} className="animate-spin text-primary" />
        <p className="font-black uppercase tracking-widest text-slate-400">Syncing Curriculum...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/respect-minimal-games/admin/subjects" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              {course?.name} <span className="text-slate-300 font-light mx-2">/</span> Curriculum
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
              <Layers size={14} className="text-primary" /> {sections.length} Sections Defined
            </p>
          </div>
        </div>
        <button 
          onClick={() => { 
            setEditingItem(null); 
            setQuestions([]); 
            setFormData({ title: '', description: '', image_url: '', video_url: '', content_body: [''], game_type: 4, order_index: sections.length + 1 });
            setShowModal('section'); 
            setModalTab('basics'); 
          }}
          className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={20} /> Add Section
        </button>
      </div>

      {/* Curriculum Grid */}
      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.id} className="space-y-6">
             <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                   <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                      {section.order_index}
                   </span>
                   <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">{section.title}</h2>
                      {section.description && <p className="text-[0.7rem] font-bold text-slate-400 italic max-w-2xl leading-relaxed">{section.description}</p>}
                      {section.content_body && (
                         <div className="flex items-center gap-2 text-[0.6rem] font-black text-primary uppercase tracking-widest mt-1 opacity-80">
                            <BookOpen size={10} /> {section.content_body.replace(/<[^>]*>/g, '').length > 100 
                              ? section.content_body.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                              : section.content_body.replace(/<[^>]*>/g, '')}
                         </div>
                      )}
                   </div>
                   <button 
                     onClick={() => { 
                       setEditingItem(section); 
                       setQuestions(section.summary_questions || []);
                       setFormData({
                         title: section.title || '',
                         description: section.description || '',
                         image_url: section.image_url || '',
                         video_url: section.video_url || '',
                         content_body: parseContentBody(section.content_body),
                         game_type: 4,
                         grade_level_id: gradeLevels[0]?.id || '',
                         instructions: '',
                         points_reward: 10,
                         time_limit: 60,
                         game_data: {}
                       });
                       setShowModal('section'); 
                       setModalTab('basics'); 
                     }}
                     className="p-2 text-slate-300 hover:text-primary transition-colors"
                   >
                     <Edit2 size={16} />
                   </button>
                   <button 
                     onClick={() => setDeleteTarget({ id: section.id, type: 'section', title: section.title })}
                     className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
                <button 
                  onClick={() => { 
                    setActiveSectionId(section.id); 
                    setEditingItem(null); 
                    setQuestions([]);
                    setFormData({ 
                      title: '', 
                      description: '', 
                      image_url: '', 
                      video_url: '', 
                      content_body: [''], 
                      game_type: 4,
                      grade_level_id: gradeLevels[0]?.id || '',
                      instructions: '',
                      points_reward: 10,
                      time_limit: 60,
                      is_active: true,
                      is_free: true,
                      enable_instruction_audio: true,
                      game_data: {}
                    });
                    setShowModal('activity'); 
                    setModalTab('basics');
                  }}
                  className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:underline decoration-2"
                >
                  <Plus size={16} /> Add Activity
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {section.activities.map((activity) => (
                  <div key={activity.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                     <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[0.6rem] font-black">
                               {activity.order_index}
                            </span>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                           activity.game_type === 5 ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                        }`}>
                           {activity.game_type === 5 ? <Puzzle size={20} /> : <Gamepad2 size={20} />}
                        </div>
                         </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { 
                              setActiveSectionId(section.id); 
                              setEditingItem(activity); 
                              setQuestions(activity.summary_questions || []);
                            setFormData({
                              title: activity.title || '',
                              description: activity.description || '',
                              image_url: activity.image_url || '',
                              video_url: activity.video_url || '',
                              content_body: parseContentBody(activity.content_body),
                              game_type: activity.game_type || 4,
                              grade_level_id: activity.respect_grade_level_id || gradeLevels[0]?.id || '',
                              order_index: activity.order_index || 0,
                              instructions: activity.instructions || '',
                              points_reward: activity.points_reward || 10,
                              time_limit: activity.time_limit || 60,
                              game_data: activity.game_data || {}
                            });
                            setShowModal('activity'); 
                            setModalTab('basics');
                            }}
                            className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => setDeleteTarget({ id: activity.id, type: 'activity', title: activity.title })}
                            className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                     </div>
                     <h3 className="font-black text-slate-900 leading-tight mb-2 uppercase text-sm">{activity.title}</h3>
                     <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">
                        {activity.game_type === 5 ? 'Puzzle Activity' : 
                         activity.game_type === 4 ? 'Arrangement Activity' : 
                         activity.game_type === 1 ? 'Quiz Activity' : 
                         activity.game_type === 2 ? 'True/False' : 'Standard Activity'}
                     </p>
                     <Link href={`/respect-minimal-games/admin/subjects/${courseId}/activities/${activity.id}`} className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50 group/link">
                        <span className="text-[0.65rem] font-black text-primary uppercase tracking-widest group-hover/link:underline">Edit Content</span>
                        <ChevronRight size={14} className="text-primary" />
                     </Link>
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* Unified Management Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-6xl bg-white rounded-[3.5rem] overflow-hidden shadow-2xl flex h-[85vh]">
                {/* Modal Sidebar */}
                <div className="w-72 bg-slate-50 p-10 border-r border-slate-100 flex flex-col justify-between">
                   <div className="space-y-8">
                      <div>
                         <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
                            {editingItem ? 'Edit' : 'New'} {showModal === 'section' ? 'Section' : 'Activity'}
                         </h2>
                         <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mt-2">Curriculum Builder</p>
                      </div>
                      
                      <nav className="space-y-2">
                         {[
                           { id: 'basics', label: 'Basic Info', icon: Info },
                           { id: 'media', label: 'Media Assets', icon: ImageIcon },
                           ...(showModal === 'activity' ? [
                              { id: 'game', label: 'Game & Assessment', icon: Gamepad2 },
                              { id: 'settings', label: 'Settings', icon: Settings }
                           ] : []),
                           { id: 'content', label: 'Body Content', icon: FileText },
                         ].map((tab) => (
                           <button 
                             key={tab.id}
                             onClick={() => setModalTab(tab.id as any)}
                             className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                               modalTab === tab.id ? 'bg-white text-primary shadow-lg shadow-primary/10 ring-1 ring-primary/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                             }`}
                           >
                             <tab.icon size={18} /> {tab.label}
                           </button>
                         ))}
                      </nav>
                   </div>
                   
                   <div className="p-6 bg-black rounded-[2rem] text-white space-y-2">
                      <Layers size={24} className="text-primary mb-2" />
                      <p className="text-[0.6rem] font-bold opacity-50 uppercase tracking-widest">Platform Sync</p>
                      <p className="text-xs font-serif italic text-slate-300">Changes deploy to all native apps instantly.</p>
                   </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 flex flex-col">
                   <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                         <div className="max-w-2xl mx-auto">
                            <AnimatePresence mode="wait">
                                {modalTab === 'basics' && (
                                 <motion.div key="basics" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                    <div className="space-y-3">
                                       <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Display Title</label>
                                       <input name="title" required value={formData.title} onChange={(e) => handleFieldChange('title', e.target.value)} placeholder="e.g. Battle of Adwa" className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 font-black text-2xl text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-200" />
                                    </div>
                                    <div className="space-y-3">
                                       <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Brief Summary</label>
                                       <textarea name="description" rows={4} value={formData.description} onChange={(e) => handleFieldChange('description', e.target.value)} placeholder="Short teaser for the curriculum list..." className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 font-bold text-slate-600 focus:ring-4 focus:ring-primary/10 transition-all resize-none placeholder:text-slate-200" />
                                    </div>
                                    {showModal === 'activity' && (
                                       <div className="space-y-3">
                                          <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Target Grade Level</label>
                                          <select 
                                            name="grade_level_id" 
                                            value={formData.grade_level_id} 
                                            onChange={(e) => handleFieldChange('grade_level_id', e.target.value)} 
                                            className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 font-black text-slate-900 focus:ring-4 focus:ring-primary/10 appearance-none"
                                          >
                                             {gradeLevels.map((gl: any) => (
                                               <option key={gl.id} value={gl.id}>{gl.name}</option>
                                             ))}
                                          </select>
                                       </div>
                                    )}
                                    <div className="space-y-3">
                                       <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Order Position</label>
                                       <input 
                                         type="number" 
                                         value={formData.order_index} 
                                         onChange={(e) => handleFieldChange('order_index', e.target.value)} 
                                         className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 font-black text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-200" 
                                       />
                                    </div>
                                 </motion.div>
                               )}

                               {modalTab === 'game' && (
                                  <motion.div key="game" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                     {/* Game Type Selector */}
                                     <div className="space-y-3">
                                        <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Game Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                           {[
                                             { value: 1, label: 'Multiple Choice', icon: HelpCircle, color: 'primary' },
                                             { value: 2, label: 'True / False', icon: Check, color: 'emerald' },
                                             { value: 5, label: 'Puzzle', icon: Puzzle, color: 'amber' },
                                             { value: 4, label: 'Arrangement', icon: Gamepad2, color: 'violet' },
                                           ].map((gt) => (
                                              <button
                                                key={gt.value}
                                                type="button"
                                                onClick={() => handleFieldChange('game_type', gt.value)}
                                                className={`p-5 rounded-3xl border-2 text-left transition-all ${
                                                  formData.game_type === gt.value
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                }`}
                                              >
                                                 <gt.icon size={20} className="mb-2" />
                                                 <div className="text-[0.6rem] font-black uppercase tracking-widest">{gt.label}</div>
                                              </button>
                                           ))}
                                        </div>
                                     </div>

                                     {/* Arrangement: Word/Image Editor */}
                                     {formData.game_type === 4 && (
                                        <DynamicGameDataEditor 
                                           gameType={4} 
                                           gameData={formData.game_data}
                                           onChange={(data) => handleFieldChange('game_data', data)}
                                        />
                                     )}

                                     {/* MCQ / T/F / Puzzle: Question Builder */}
                                     {[1, 2, 5].includes(formData.game_type) && (
                                        <div className="space-y-6">
                                           <div className="flex items-center justify-between">
                                              <h3 className="font-black text-slate-900 uppercase tracking-tighter">Questions</h3>
                                              <div className="flex gap-2">
                                                 {formData.game_type === 1 && <button type="button" onClick={() => addQuestion('mcq')} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[0.6rem] font-black uppercase tracking-widest">+ MCQ</button>}
                                                 {formData.game_type === 2 && <button type="button" onClick={() => addQuestion('tf')} className="px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-[0.6rem] font-black uppercase tracking-widest">+ T/F</button>}
                                                 {formData.game_type === 5 && <button type="button" onClick={() => addQuestion('puzzle')} className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-xl text-[0.6rem] font-black uppercase tracking-widest">+ Puzzle</button>}
                                              </div>
                                           </div>
                                           <div className="space-y-6">
                                              {questions.map((q, idx) => (
                                                <div key={q.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group/q">
                                                   <button type="button" onClick={() => setQuestions(questions.filter(item => item.id !== q.id))} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                      <X size={16} />
                                                   </button>
                                                   <div className="flex gap-6">
                                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${ q.type === 'puzzle' ? 'bg-emerald-500 text-white' : 'bg-black text-white' }`}>
                                                         {q.type === 'puzzle' ? <Puzzle size={16} /> : idx + 1}
                                                      </div>
                                                      <div className="flex-1 space-y-4">
                                                         <input 
                                                           value={q.question} 
                                                           onChange={e => { const updated = [...questions]; updated[idx].question = e.target.value; setQuestions(updated); }}
                                                           placeholder={q.type === 'puzzle' ? 'Image URL for puzzle...' : 'Enter question text...'} 
                                                           className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-slate-900 shadow-sm" 
                                                         />
                                                         {q.type === 'mcq' && (
                                                            <div className="space-y-3">
                                                               <div className="grid grid-cols-2 gap-3">
                                                                  {q.options?.map((opt, oIdx) => (
                                                                    <div key={oIdx} className="relative group/opt">
                                                                       <input 
                                                                         value={opt}
                                                                         onChange={e => { const updated = [...questions]; updated[idx].options![oIdx] = e.target.value; setQuestions(updated); }}
                                                                         placeholder={`Option ${oIdx + 1}`}
                                                                         className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
                                                                       />
                                                                       {q.options!.length > 2 && (
                                                                         <button type="button" onClick={() => { const updated = [...questions]; updated[idx].options = q.options!.filter((_, i) => i !== oIdx); if (updated[idx].answer === oIdx) updated[idx].answer = 0; else if (Number(updated[idx].answer) > oIdx) updated[idx].answer = Number(updated[idx].answer) - 1; setQuestions(updated); }} className="absolute top-1/2 -right-2 -translate-y-1/2 p-1.5 bg-white shadow-md border border-slate-100 rounded-lg text-slate-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-all">
                                                                            <X size={10} />
                                                                         </button>
                                                                       )}
                                                                       <button type="button" onClick={() => { const updated = [...questions]; updated[idx].answer = oIdx; setQuestions(updated); }} className={`absolute top-1/2 right-4 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full border transition-all ${ String(q.answer) === String(oIdx) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-transparent hover:border-emerald-300' }`}>
                                                                          <Check size={10} strokeWidth={4} />
                                                                       </button>
                                                                    </div>
                                                                  ))}
                                                               </div>
                                                               {q.options!.length < 6 && (
                                                                 <button type="button" onClick={() => { const updated = [...questions]; updated[idx].options = [...q.options!, '']; setQuestions(updated); }} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[0.6rem] font-black uppercase tracking-widest text-slate-300 hover:text-primary hover:border-primary/40 transition-all">+ Add Option</button>
                                                               )}
                                                            </div>
                                                         )}
                                                         {q.type === 'tf' && (
                                                            <div className="flex gap-4">
                                                               {['True', 'False'].map(val => (
                                                                 <button key={val} type="button" onClick={() => { const updated = [...questions]; updated[idx].answer = val === 'True'; setQuestions(updated); }} className={`px-6 py-3 rounded-xl text-[0.6rem] font-black uppercase tracking-widest border transition-all ${ (q.answer === (val === 'True')) ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-200' }`}>{val}</button>
                                                               ))}
                                                            </div>
                                                         )}
                                                         {q.type === 'puzzle' && (
                                                            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                                                               <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Grid Size</span>
                                                               <select value={q.slices || 4} onChange={e => { const updated = [...questions]; updated[idx].slices = parseInt(e.target.value); setQuestions(updated); }} className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-black">
                                                                  <option value="4">2×2 Basic</option>
                                                                  <option value="9">3×3 Standard</option>
                                                                  <option value="16">4×4 Expert</option>
                                                               </select>
                                                            </div>
                                                         )}
                                                      </div>
                                                   </div>
                                                </div>
                                              ))}
                                           </div>
                                        </div>
                                     )}
                                  </motion.div>
                               )}

                               {modalTab === 'settings' && (
                                  <motion.div key="settings" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                           <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Points Reward</label>
                                           <input type="number" value={formData.points_reward} onChange={(e) => handleFieldChange('points_reward', parseInt(e.target.value))} className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 font-black text-slate-900 focus:ring-0" />
                                        </div>
                                        <div className="space-y-3">
                                           <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Time Limit (s)</label>
                                           <input type="number" value={formData.time_limit} onChange={(e) => handleFieldChange('time_limit', parseInt(e.target.value))} className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 font-black text-slate-900 focus:ring-0" />
                                        </div>
                                     </div>
                                     <div className="space-y-3">
                                        <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 px-1">In-Game Instructions</label>
                                        <textarea rows={4} value={formData.instructions} onChange={(e) => handleFieldChange('instructions', e.target.value)} placeholder="Guide the student..." className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 font-bold text-slate-600 focus:ring-0 resize-none" />
                                     </div>
                                     <div className="flex gap-4">
                                        <button type="button" onClick={() => handleFieldChange('enable_instruction_audio', !formData.enable_instruction_audio)} className={`flex-1 p-6 rounded-3xl border-2 transition-all text-left ${formData.enable_instruction_audio ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                                           <div className="text-[0.6rem] font-black uppercase tracking-widest mb-1">Audio Instructions</div>
                                           <div className="text-sm font-black">{formData.enable_instruction_audio ? 'ENABLED' : 'DISABLED'}</div>
                                        </button>
                                        <button type="button" onClick={() => handleFieldChange('is_free', !formData.is_free)} className={`flex-1 p-6 rounded-3xl border-2 transition-all text-left ${formData.is_free ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                                           <div className="text-[0.6rem] font-black uppercase tracking-widest mb-1">Access Level</div>
                                           <div className="text-sm font-black">{formData.is_free ? 'FREE CONTENT' : 'PREMIUM'}</div>
                                        </button>
                                     </div>
                                  </motion.div>
                               )}

                               {modalTab === 'media' && (
                                 <motion.div key="media" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-10">
                                    <div className="grid grid-cols-2 gap-8">
                                       <div className="space-y-4">
                                          <div className="aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 relative overflow-hidden group">
                                             {formData.image_url ? <img src={formData.image_url} className="absolute inset-0 w-full h-full object-cover" /> : <ImageIcon size={48} />}
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <UploadCloud className="text-white" />
                                             </div>
                                          </div>
                                          <div className="space-y-2">
                                             <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Image Asset URL</label>
                                             <input name="image_url" value={formData.image_url} onChange={(e) => handleFieldChange('image_url', e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-slate-900" />
                                          </div>
                                       </div>
                                       <div className="space-y-4">
                                          <div className="aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 relative overflow-hidden group">
                                             <Video size={48} />
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[0.6rem] font-black uppercase tracking-widest">Preview Video</div>
                                          </div>
                                          <div className="space-y-2">
                                             <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Video Asset URL</label>
                                             <input name="video_url" value={formData.video_url} onChange={(e) => handleFieldChange('video_url', e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-slate-900" />
                                          </div>
                                       </div>
                                    </div>
                                 </motion.div>
                                )}

                                {modalTab === 'content' && (
                                 <motion.div key="content" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6 pb-20">
                                    <div className="flex items-center justify-between mb-4">
                                       <div>
                                          <h3 className="font-black text-slate-900 uppercase tracking-tighter">Dynamic Body Sections</h3>
                                          <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Add up to 10 sections for structured learning</p>
                                       </div>
                                       <button 
                                          type="button" 
                                          onClick={addContentSection}
                                          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[0.6rem] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                                       >
                                          <Plus size={14} /> Add Section
                                       </button>
                                    </div>

                                    <div className="space-y-8">
                                       {Array.isArray(formData.content_body) && formData.content_body.map((section: string, idx: number) => (
                                          <div key={idx} className="relative group">
                                             <div className="absolute -left-4 top-4 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[0.6rem] font-black shadow-lg">
                                                   {idx + 1}
                                                </div>
                                                {formData.content_body.length > 1 && (
                                                   <button 
                                                      type="button" 
                                                      onClick={() => removeContentSection(idx)}
                                                      className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-all shadow-sm border border-rose-100"
                                                   >
                                                      <Trash2 size={12} />
                                                   </button>
                                                )}
                                             </div>
                                             
                                             <div className="p-2 border border-slate-100 rounded-[2.5rem] bg-slate-50/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                                                <div className="flex gap-2 p-4 border-b border-slate-100 mb-4">
                                                   {['Bold', 'Italic', 'H1', 'H2', 'Link'].map(tool => (
                                                   <div key={tool} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[0.6rem] font-black uppercase text-slate-400 cursor-not-allowed">{tool}</div>
                                                   ))}
                                                   <span className="ml-auto text-[0.6rem] font-black text-primary uppercase tracking-widest">Section {idx + 1}</span>
                                                </div>
                                                <textarea 
                                                   value={section} 
                                                   onChange={(e) => updateContentSection(idx, e.target.value)} 
                                                   rows={6} 
                                                   placeholder={`Write section ${idx + 1} content here...`} 
                                                   className="w-full bg-transparent border-none px-6 py-2 font-serif text-lg leading-relaxed text-slate-700 focus:ring-0 resize-none" 
                                                />
                                             </div>
                                          </div>
                                       ))}
                                    </div>

                                    {/* Quick Fill Button (Example for User) */}
                                    <div className="pt-10 border-t border-slate-100">
                                       <button 
                                          type="button"
                                          onClick={() => {
                                             const example = [
                                                "LESSON 1: The Brave King Returns",
                                                "Long ago, Ethiopia had a wise and respected leader. His name was Haile Selassie I. He was an emperor who loved his country and cared deeply for his people. He worked hard to bring peace, education, and progress to Ethiopia.",
                                                "One day, a strong enemy came to Ethiopia. The enemy army was powerful and wanted to take control of the country. The people were afraid, and the situation became very difficult.",
                                                "Haile Selassie knew he could not fight alone at that moment. So, he made a hard decision. He left Ethiopia and traveled to other countries to ask for help.",
                                                "Before he left, he spoke to his people. “Stay strong,” he said. “I will return.” Even though he was far away, he never forgot his country. The Ethiopian people also stayed strong. They believed in their leader and hoped for freedom.",
                                                "After some years, help finally came. Haile Selassie returned to Ethiopia. The people were filled with joy. They sang, danced, and welcomed him with open hearts.",
                                                "Ethiopia became free again, and the emperor continued to lead his people with strength and wisdom."
                                             ];
                                             handleFieldChange('content_body', example);
                                          }}
                                          className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-[0.7rem] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
                                       >
                                          <Sparkles size={18} /> Load Example Lesson Content
                                       </button>
                                    </div>
                                 </motion.div>
                               )}

                               {modalTab === 'questions' && (
                                 <motion.div key="questions" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8 pb-10">
                                    <div className="flex items-center justify-between">
                                       <h3 className="font-black text-slate-900 uppercase tracking-tighter">Summarization Pack</h3>
                                       <div className="flex gap-2">
                                          <button type="button" onClick={() => addQuestion('mcq')} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[0.6rem] font-black uppercase tracking-widest">+ MCQ</button>
                                          <button type="button" onClick={() => addQuestion('tf')} className="px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-[0.6rem] font-black uppercase tracking-widest">+ T/F</button>
                                          <button type="button" onClick={() => addQuestion('puzzle')} className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-xl text-[0.6rem] font-black uppercase tracking-widest">+ Puzzle</button>
                                       </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                       {questions.map((q, idx) => (
                                         <div key={q.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group/q">
                                            <button type="button" onClick={() => setQuestions(questions.filter(item => item.id !== q.id))} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors">
                                               <X size={16} />
                                            </button>
                                            <div className="flex gap-6">
                                               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${
                                                 q.type === 'puzzle' ? 'bg-emerald-500 text-white' : 'bg-black text-white'
                                               }`}>{q.type === 'puzzle' ? <Puzzle size={16} /> : idx + 1}</div>
                                               <div className="flex-1 space-y-4">
                                                  <input 
                                                    value={q.question} 
                                                    onChange={e => {
                                                      const updated = [...questions];
                                                      updated[idx].question = e.target.value;
                                                      setQuestions(updated);
                                                    }}
                                                    placeholder={q.type === 'puzzle' ? "Puzzle objective (e.g. Assemble the Hero)" : "Enter the question text..."} 
                                                    className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-slate-900 shadow-sm" 
                                                  />
                                                  
                                                  {q.type === 'mcq' && (
                                                     <div className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-3">
                                                           {q.options?.map((opt, oIdx) => (
                                                             <div key={oIdx} className="relative group/opt">
                                                                <input 
                                                                  value={opt}
                                                                  onChange={e => {
                                                                     const updated = [...questions];
                                                                     updated[idx].options![oIdx] = e.target.value;
                                                                     setQuestions(updated);
                                                                  }}
                                                                  placeholder={`Option ${oIdx + 1}`}
                                                                  className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
                                                                />
                                                                {q.options!.length > 2 && (
                                                                  <button 
                                                                    type="button" 
                                                                    onClick={() => {
                                                                      const updated = [...questions];
                                                                      updated[idx].options = q.options!.filter((_, i) => i !== oIdx);
                                                                      // If the answer was the removed index, reset or shift
                                                                      if (updated[idx].answer === oIdx) updated[idx].answer = 0;
                                                                      else if (Number(updated[idx].answer) > oIdx) updated[idx].answer = Number(updated[idx].answer) - 1;
                                                                      setQuestions(updated);
                                                                    }}
                                                                    className="absolute top-1/2 -right-2 -translate-y-1/2 p-1.5 bg-white shadow-md border border-slate-100 rounded-lg text-slate-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-all"
                                                                  >
                                                                     <X size={10} />
                                                                  </button>
                                                                )}
                                                                
                                                                {/* Correct Answer Indicator */}
                                                                <button
                                                                   type="button"
                                                                   onClick={() => {
                                                                      const updated = [...questions];
                                                                      updated[idx].answer = oIdx;
                                                                      setQuestions(updated);
                                                                   }}
                                                                   className={`absolute top-1/2 right-4 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full border transition-all ${
                                                                     String(q.answer) === String(oIdx) 
                                                                     ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                                     : 'bg-white border-slate-200 text-transparent hover:border-emerald-300'
                                                                   }`}
                                                                >
                                                                   <Check size={10} strokeWidth={4} />
                                                                </button>
                                                             </div>
                                                           ))}
                                                        </div>
                                                        {q.options!.length < 6 && (
                                                          <button 
                                                            type="button" 
                                                            onClick={() => {
                                                              const updated = [...questions];
                                                              updated[idx].options = [...q.options!, ''];
                                                              setQuestions(updated);
                                                            }}
                                                            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[0.6rem] font-black uppercase tracking-widest text-slate-300 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                                                          >
                                                             + Add Option
                                                          </button>
                                                        )}
                                                     </div>
                                                  )}

                                                  {q.type === 'tf' && (
                                                     <div className="flex gap-4">
                                                        {['True', 'False'].map(val => (
                                                          <button key={val} type="button" onClick={() => {
                                                            const updated = [...questions];
                                                            updated[idx].answer = val === 'True';
                                                            setQuestions(updated);
                                                          }} className={`px-6 py-3 rounded-xl text-[0.6rem] font-black uppercase tracking-widest border transition-all ${
                                                            (q.answer === (val === 'True')) ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-200'
                                                          }`}>{val}</button>
                                                        ))}
                                                     </div>
                                                  )}

                                                  {q.type === 'puzzle' && (
                                                     <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100">
                                                        <div className="flex items-center justify-between">
                                                           <div>
                                                              <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Puzzle Source</p>
                                                              <p className="text-xs font-bold text-slate-900 mt-1">Using Course Hero Image</p>
                                                           </div>
                                                           <select 
                                                              value={q.slices || 4} 
                                                              onChange={e => {
                                                                 const updated = [...questions];
                                                                 updated[idx].slices = parseInt(e.target.value);
                                                                 setQuestions(updated);
                                                              }}
                                                              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-black"
                                                           >
                                                              <option value="4">2 x 2 (Basic)</option>
                                                              <option value="9">3 x 3 (Standard)</option>
                                                              <option value="16">4 x 4 (Expert)</option>
                                                           </select>
                                                        </div>
                                                     </div>
                                                  )}
                                               </div>
                                            </div>
                                         </div>
                                       ))}
                                    </div>
                                 </motion.div>
                               )}
                            </AnimatePresence>
                         </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="p-10 border-t border-slate-100 flex items-center justify-between bg-white px-16">
                         <button type="button" onClick={() => setShowModal(null)} className="text-sm font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">Discard</button>
                         <div className="flex gap-6">
                            <div className="flex items-center gap-2 text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                               <CheckCircle2 size={14} className="text-emerald-500" /> Auto-saved to Cloud
                            </div>
                            <button type="submit" disabled={saving} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all">
                               {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                               <span>{saving ? 'Syncing...' : (editingItem ? 'Publish Updates' : 'Publish to Cloud')}</span>
                            </button>
                         </div>
                      </div>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Delete {deleteTarget.type}?</h2>
                <p className="text-slate-500 font-medium">Are you sure you want to remove <span className="text-slate-900 font-bold">"{deleteTarget.title}"</span>? This action cannot be undone.</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all">Yes, Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {status && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-50 ${status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
             <CheckCircle2 className="text-white" size={24} />
             <span className="font-black uppercase tracking-widest text-white text-xs">{statusMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
