'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronRight,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  Database,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  background_url?: string;
  is_active?: boolean;
  games_count?: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

async function safeFetch(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return { data: [] };
    const text = await res.text();
    if (!text.trim()) return { data: [] };
    const json = JSON.parse(text);
    return json.status === 'success' || json.success ? json : { data: [] };
  } catch {
    return { data: [] };
  }
}

export default function SubjectsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const [cData, gData] = await Promise.all([
        safeFetch(`${API_BASE_URL}/respect/courses`),
        safeFetch(`${API_BASE_URL}/respect/games`),
      ]);

      const games = Array.isArray(gData.data) ? gData.data : [];
      const enriched = (cData.data || []).map((c: Course) => ({
        ...c,
        games_count: games.filter((g: any) => g.course_name === c.name).length,
      }));
      setCourses(enriched);
    } catch (err) {
      console.error(err);
      setError('Connection failed — showing local fallback data.');
      setCourses([
        { id: '1', name: 'English',     code: 'EN', games_count: 5 },
        { id: '2', name: 'Amharic',     code: 'AM', games_count: 3 },
        { id: '3', name: 'Affan Oromo', code: 'AO', games_count: 2 },
        { id: '4', name: 'Maths',       code: 'MA', games_count: 4 },
        { id: '5', name: 'Science',     code: 'SC', games_count: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setSelectedCourse(null);
    setShowModal(true);
  }

  function openEdit(course: Course, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCourse(course);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name:           fd.get('name') as string,
      code:           (fd.get('code') as string).toUpperCase(),
      description:    fd.get('description') as string,
      background_url: fd.get('background_url') as string,
      is_active:      true,
    };

    try {
      setIsSubmitting(true);
      const url = selectedCourse
        ? `${API_BASE_URL}/respect/courses/${selectedCourse.id}`
        : `${API_BASE_URL}/respect/courses`;

      const res = await fetch(url, {
        method:  selectedCourse ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Save failed');

      await fetchCourses();
      setShowModal(false);
      setStatusMsg(selectedCourse ? 'Course updated.' : 'Course added to RESPECT registry.');
      setStatus('success');
      setTimeout(() => setStatus(null), 3500);
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to save. Check API connectivity.');
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`${API_BASE_URL}/respect/courses/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      setStatusMsg('Course removed from registry.');
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalGames = courses.reduce((s, c) => s + (c.games_count || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Courses</h1>
          <p className="text-slate-500 font-medium font-serif italic mt-1">
            RESPECT course registry — {courses.length} course{courses.length !== 1 ? 's' : ''} linked.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-3xl font-bold shadow-xl shadow-slate-300 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Plus size={20} />
          <span>Add Course</span>
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-700 font-semibold animate-pulse">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total Courses',   value: courses.length, dot: 'bg-primary'      },
          { label: 'Linked Games',    value: totalGames,     dot: 'bg-emerald-500'   },
          { label: 'Registry Status', value: 'LIVE',         dot: 'bg-amber-400'     },
          { label: 'Endpoint Access', value: 'Public',       dot: 'bg-rose-400'      },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
            <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stat.value}</span>
              <div className={`w-2 h-2 rounded-full ${stat.dot}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-100 rounded-2xl flex items-center px-6 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search size={20} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search courses..."
          className="w-full bg-transparent border-none focus:ring-0 px-4 py-4 font-semibold text-slate-600 placeholder:text-slate-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-slate-300 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 size={48} className="animate-spin text-primary" />
          <p className="font-black uppercase tracking-[0.3em] text-xs">Syncing courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map((course) => (
            <Link
              key={course.id}
              href={`/respect-minimal-games/admin/subjects/${course.id}`}
              className="group block bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2 transition-all duration-300 relative"
            >
              {/* Edit / Delete actions */}
              <div className="absolute top-4 left-4 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => openEdit(course, e)}
                  className="p-1.5 bg-white rounded-xl shadow-md text-slate-400 hover:text-primary transition-colors"
                  title="Edit course"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(course); }}
                  className="p-1.5 bg-white rounded-xl shadow-md text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete course"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Card image area */}
              <div className="aspect-[4/3] w-full bg-slate-900 rounded-[2rem] mb-6 overflow-hidden relative flex items-center justify-center group-hover:bg-slate-800 transition-colors shadow-inner">
                {course.background_url ? (
                  <>
                    <img 
                      src={course.background_url} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
                      alt={course.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-600/10" />
                )}
                
                <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl text-white group-hover:scale-110 transition-all border border-white/20">
                  <BookOpen size={40} />
                </div>
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest shadow-lg border border-white/10">
                  {course.code}
                </div>
              </div>

              <div className="px-3 pb-4">
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest">Live Registry</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                  {course.name}
                </h3>
                <p className="text-slate-400 text-sm font-semibold italic font-serif">
                  {course.games_count} Quest{course.games_count !== 1 ? 's' : ''}
                </p>

                <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-primary font-black text-xs uppercase tracking-widest">
                    Manage Games
                  </span>
                  <ChevronRight size={16} className="text-primary" />
                </div>
              </div>
            </Link>
          ))}

          {/* Add new card */}
          <button
            onClick={openAdd}
            className="group block bg-white rounded-[2.5rem] p-4 border-4 border-dashed border-slate-100 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[220px] text-slate-300 hover:text-primary"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-400">
              <Plus size={32} />
            </div>
            <span className="font-black uppercase tracking-widest text-xs">Add Course</span>
          </button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                {/* Modal header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Database size={22} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 leading-none">
                        {selectedCourse ? 'Edit Course' : 'Add Course'}
                      </h2>
                      <p className="text-[0.65rem] text-slate-400 font-semibold uppercase tracking-widest mt-1">
                        {selectedCourse ? 'Update RESPECT registry' : 'Create new RESPECT course'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-slate-300 hover:text-slate-900 transition-colors"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-1">
                      Course Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="name"
                      required
                      defaultValue={selectedCourse?.name}
                      placeholder="e.g. English, Amharic, Maths"
                      className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-1">
                      Course Code <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="code"
                      required
                      maxLength={5}
                      defaultValue={selectedCourse?.code}
                      placeholder="e.g. EN, AM, MA"
                      className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 font-black text-slate-900 placeholder:text-slate-300 uppercase tracking-widest focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-1">
                      Background Image URL
                    </label>
                    <input
                      name="background_url"
                      defaultValue={selectedCourse?.background_url}
                      placeholder="e.g. https://learningcloud.et/..."
                      className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={selectedCourse?.description}
                      placeholder="Optional description for this subject..."
                      className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 font-semibold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-none px-6 py-4 rounded-[2rem] border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : selectedCourse ? (
                      'Update Course'
                    ) : (
                      <>
                        <Plus size={18} /> Add to Registry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl space-y-6"
            >
              <h2 className="text-2xl font-black text-slate-900">Remove Course?</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                This will permanently remove{' '}
                <strong className="text-slate-900">{deleteTarget.name}</strong> from the RESPECT
                registry. All linked games will be orphaned.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-100 transition-all"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 ${
              status === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            <CheckCircle2 size={20} className="text-white" />
            <span className="font-bold uppercase tracking-widest text-xs text-white">{statusMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
