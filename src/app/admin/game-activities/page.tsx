'use client';

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  Play,
  BookOpen,
  GraduationCap,
  Activity,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Game {
  id: string;
  title: string;
  description?: string;
  course_name?: string;
  grade_name?: string;
  is_active?: boolean;
  is_free?: boolean;
  game_type?: number;
  thumbnail_url?: string;
}

interface Course { id: string; name: string; }
interface Grade { id: string; name: string; level_number: number; }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

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

export default function GameActivitiesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [gData, cData, grData] = await Promise.all([
        safeFetch(`${API_BASE_URL}/respect/games`),
        safeFetch(`${API_BASE_URL}/respect/courses`),
        safeFetch(`${API_BASE_URL}/respect/grade-levels`),
      ]);
      setGames(gData.data || []);
      setCourses(cData.data || []);
      setGrades(grData.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`${API_BASE_URL}/respect/games/${deleteTarget.id}`, { method: 'DELETE' });
      setGames((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      setDeleteTarget(null);
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setStatus('error');
    }
  }

  const filtered = games.filter((g) => {
    const matchesSearch =
      g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.course_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || g.course_name === filterCourse;
    const matchesGrade = filterGrade === 'all' || g.grade_name === filterGrade;
    return matchesSearch && matchesCourse && matchesGrade;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Game Activities</h1>
          <p className="text-slate-500 font-medium font-serif italic mt-1">
            All RESPECT game activities — {games.length} total quest{games.length !== 1 ? 's' : ''} linked.
          </p>
        </div>
        <Link
          href="/admin/games/new"
          className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-3xl font-bold shadow-xl shadow-slate-300 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Plus size={20} />
          <span>New Activity</span>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Total Quests', value: games.length, icon: Gamepad2, color: 'text-primary bg-primary/10' },
          { label: 'Domains', value: courses.length, icon: BookOpen, color: 'text-amber-500 bg-amber-50' },
          { label: 'Grade Tracks', value: grades.length, icon: GraduationCap, color: 'text-emerald-500 bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 leading-none">{loading ? '...' : stat.value}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[200px] bg-slate-50 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-600 placeholder:text-slate-300"
          />
        </div>
        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-600 cursor-pointer"
          >
            <option value="all">All Domains</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
          <GraduationCap size={14} className="text-slate-400" />
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-600 cursor-pointer"
          >
            <option value="all">All Grades</option>
            {grades.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Game List */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 size={48} className="animate-spin text-primary" />
          <p className="font-black uppercase tracking-[0.3em] text-[0.6rem] text-slate-400">
            Loading Game Activities...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-16 border-4 border-dashed border-slate-100 flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
            <Gamepad2 size={40} />
          </div>
          <div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-sm mb-2">
              {searchTerm ? 'No results found' : 'No game activities yet'}
            </p>
            <p className="text-slate-300 text-xs font-semibold">
              {searchTerm ? `Try adjusting your search term.` : `Click "New Activity" to add your first game.`}
            </p>
          </div>
          <Link
            href="/admin/games/new"
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg"
          >
            <Plus size={18} /> Add Game Activity
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((game, idx) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.04 }}
                className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 hover:border-primary/20 transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  {/* Thumbnail or icon */}
                  {game.thumbnail_url ? (
                    <img
                      src={game.thumbnail_url}
                      alt={game.title}
                      className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                      <Gamepad2 size={24} />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {game.course_name && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[0.6rem] font-black uppercase tracking-widest">
                          {game.course_name}
                        </span>
                      )}
                      {game.grade_name && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[0.6rem] font-black uppercase tracking-widest">
                          {game.grade_name}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest ${
                        game.is_free ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {game.is_free ? 'Free' : 'Premium'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">
                      {game.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/games/${game.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30"
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Play Mission</span>
                  </Link>
                  <div className="h-8 w-px bg-slate-100 mx-1" />
                  <Link
                    href={`/admin/games/${game.id}/edit`}
                    className="p-3 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(game)}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Delete Activity</h2>
                <button onClick={() => setDeleteTarget(null)} className="text-slate-300 hover:text-slate-900">
                  <X size={20} />
                </button>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900">{deleteTarget.title}</strong>?
                This cannot be undone.
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
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={20} />
            <span className="font-bold uppercase tracking-widest text-xs">Activity Removed</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
