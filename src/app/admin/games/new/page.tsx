'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Gamepad2,
  BookOpen,
  GraduationCap,
  Save,
  Loader2,
  AlertCircle,
  FileText,
  Settings,
  Globe,
  ArrowLeft,
  Image,
  Volume2,
  Clock,
  Star,
  Hash,
  ToggleLeft,
  LayoutTemplate,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import DynamicGameDataEditor from '@/components/admin/DynamicGameDataEditor';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

// Mirrored from the client admin GAME_TYPES constant
const GAME_TYPES: Record<number, string> = {
  0:  'Drag and Drop',
  1:  'Multiple Choice',
  2:  'Matching',
  3:  'Fill in the Blank',
  4:  'Arrangement',
  5:  'Puzzle',
  6:  'Drag and Put in Box',
  7:  'Unity',
  8:  'Categorization',
  9:  'Color the Picture',
  10: 'Stack and Bridge',
  11: 'Number Nexus',
  12: 'Size Arrangement',
  13: 'Maze Adventure',
  14: 'Connect The Dots',
  15: 'Listen and Repeat',
};

interface GradeLevel { id: string; name: string; level_number: number; }
interface Course     { id: string; name: string; code: string; }

interface FormData {
  title:                   string;
  description:             string;
  subject_id:              string;
  game_type:               number;
  grade_level_id:          string;
  difficulty_level:        number;
  thumbnail_url:           string;
  instructions:            string;
  points_reward:           number;
  time_limit:              number | '';
  order_index:             number;
  is_active:                boolean;
  is_free:                  boolean;
  enable_instruction_audio: boolean;
  game_data:                any;
}

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

const DIFFICULTIES = [
  { value: 1, label: 'Easy',   color: 'bg-emerald-500' },
  { value: 2, label: 'Medium', color: 'bg-amber-500'   },
  { value: 3, label: 'Hard',   color: 'bg-red-500'     },
];

export default function NewGamePage() {
  const router = useRouter();
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [courses, setCourses]         = useState<Course[]>([]);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);

  const [form, setForm] = useState<FormData>({
    title:                   '',
    description:             '',
    subject_id:              '',
    game_type:               4, // Locked to Arrangement
    grade_level_id:          '',
    difficulty_level:        1,
    thumbnail_url:           '',
    instructions:            '',
    points_reward:           10,
    time_limit:              '',
    order_index:             0,
    is_active:                true,
    is_free:                  true,
    enable_instruction_audio: true,
    game_data:                {},
  });

  useEffect(() => {
    async function load() {
      try {
        const [grData, cData] = await Promise.all([
          safeFetch(`${API_BASE_URL}/respect/grade-levels`),
          safeFetch(`${API_BASE_URL}/respect/courses`),
        ]);
        setGradeLevels(grData.data || []);
        setCourses(cData.data || []);
      } catch (e) {
        console.error(e);
        setError('Failed to load form configuration from cloud.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) { setError('Game title is required.'); return; }
    if (!form.subject_id)   { setError('Please select a subject domain.'); return; }
    if (!form.grade_level_id) { setError('Please select a grade level.'); return; }
    if (form.game_type < 0) { setError('Please select a game type.'); return; }

    const payload = {
      title:                   form.title.trim(),
      description:             form.description.trim() || undefined,
      subject_id:              form.subject_id,
      course_id:               form.subject_id,
      game_type:               form.game_type,
      grade_level_id:          form.grade_level_id,
      difficulty_level:        form.difficulty_level,
      thumbnail_url:           form.thumbnail_url.trim() || undefined,
      instructions:            form.instructions.trim() || undefined,
      points_reward:           form.points_reward,
      time_limit:              form.time_limit !== '' ? Number(form.time_limit) : undefined,
      order_index:             form.order_index,
      is_active:                form.is_active,
      is_free:                  form.is_free,
      enable_instruction_audio: form.enable_instruction_audio,
      game_data:                form.game_data || {},
    };

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/respect/games`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Server error');
      }

      const result = await res.json();
      if (result.status === 'success' || result.success) {
        setSuccess(true);
        setTimeout(() => router.push('/respect-minimal-games/admin/game-activities'), 1200);
      } else {
        throw new Error(result.message || 'Failed to create game');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create game on Learning Cloud.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="font-black uppercase tracking-[0.3em] text-xs text-slate-400">
          Loading RESPECT Configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/respect-minimal-games/admin/game-activities"
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            New Game Activity
          </h1>
          <p className="text-slate-400 font-semibold font-serif italic mt-1">
            Define a new educational quest for the RESPECT platform.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section 1: Basic Information ── */}
        <Section icon={<FileText size={20} />} title="Basic Information" accent="primary">
          <div className="space-y-5">
            <Field label="Game Title" required>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Maths Adventure, Letter Quest"
                className={inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the educational goals of this game..."
                className={inputClass + ' resize-none'}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Subject Domain" required>
                <select
                  required
                  value={form.subject_id}
                  onChange={(e) => set('subject_id', e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select Subject</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {courses.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">No subjects found — add them first.</p>
                )}
              </Field>

              <Field label="Grade Level">
                <select
                  value={form.grade_level_id}
                  onChange={(e) => set('grade_level_id', e.target.value)}
                  className={selectClass}
                >
                  <option value="">All Grade Levels</option>
                  {gradeLevels.map((gl) => (
                    <option key={gl.id} value={gl.id}>{gl.name}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </Section>

        {/* ── Section 2: Game Type ── */}
        <Section icon={<Gamepad2 size={20} />} title="Game Type" accent="primary" dark>
          <div className="space-y-2">
            <p className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 mb-4">
              Select the type of game activity <span className="text-red-400">*</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(GAME_TYPES).map(([key, label]) => {
                const typeNum = parseInt(key);
                const isSelected = form.game_type === typeNum;
                // Only Arrangement (4) is selectable as per user request
                const isDisabled = typeNum !== 4;
                
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && set('game_type', typeNum)}
                    className={`py-3 px-3 rounded-2xl font-bold text-xs transition-all border-2 text-center leading-tight ${
                      isSelected
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                        : isDisabled
                        ? 'bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {form.game_type >= 0 && (
              <p className="text-xs font-bold text-primary mt-3">
                ✓ Selected: <span className="font-black">{GAME_TYPES[form.game_type]}</span> (type {form.game_type})
              </p>
            )}
          </div>
        </Section>

        {/* ── Section 3: Difficulty ── */}
        <Section icon={<Star size={20} />} title="Difficulty Level" accent="amber">
          <div className="flex gap-4">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => set('difficulty_level', d.value)}
                className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                  form.difficulty_level === d.value
                    ? `${d.color} border-transparent text-white shadow-lg`
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Section>

        {/* ── Section 4: Game Settings ── */}
        <Section icon={<Settings size={20} />} title="Game Settings" accent="primary">
          <div className="space-y-5">

            <Field label="Thumbnail URL">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <Image size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="url"
                  value={form.thumbnail_url}
                  onChange={(e) => set('thumbnail_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 py-4 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </Field>

            <Field label="Instructions">
              <textarea
                rows={3}
                value={form.instructions}
                onChange={(e) => set('instructions', e.target.value)}
                placeholder="Describe how to play this game..."
                className={inputClass + ' resize-none'}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Default Points Reward" icon={<Star size={14} />}>
                <input
                  type="number"
                  min={0}
                  value={form.points_reward}
                  onChange={(e) => set('points_reward', parseInt(e.target.value) || 0)}
                  className={inputClass}
                />
              </Field>

              <Field label="Default Time Limit (sec)" icon={<Clock size={14} />}>
                <input
                  type="number"
                  min={0}
                  value={form.time_limit}
                  onChange={(e) => set('time_limit', e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>

              <Field label="Order Index" icon={<Hash size={14} />}>
                <input
                  type="number"
                  min={0}
                  value={form.order_index}
                  onChange={(e) => set('order_index', parseInt(e.target.value) || 0)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* ── Section 5: Access & Flags ── */}
        <Section icon={<Globe size={20} />} title="Access & Flags" accent="emerald">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                key:     'is_active' as keyof FormData,
                label:   'Active',
                desc:    'Game is visible to students',
                checked: form.is_active,
              },
              {
                key:     'is_free' as keyof FormData,
                label:   'Free to Play',
                desc:    'No subscription required',
                checked: form.is_free,
              },
              {
                key:     'enable_instruction_audio' as keyof FormData,
                label:   'Audio Instructions',
                desc:    'Enable audio reader for instructions',
                checked: form.enable_instruction_audio,
              },
            ].map((flag) => (
              <button
                key={flag.key}
                type="button"
                onClick={() => set(flag.key, !flag.checked as any)}
                className={`text-left p-5 rounded-2xl border-2 transition-all ${
                  flag.checked
                    ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-black text-sm ${flag.checked ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {flag.label}
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all relative ${flag.checked ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${flag.checked ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </div>
                <p className={`text-xs font-medium ${flag.checked ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {flag.desc}
                </p>
              </button>
            ))}
          </div>
        </Section>

        {/* ── Section 6: Game Content ── */}
        {form.game_type >= 0 && (
          <Section 
            icon={<ClipboardList size={20} />} 
            title="Game Content & Levels"
            accent="primary"
          >
            <div className="space-y-4">
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 mb-6 px-1">
                Define the educational content for each difficulty track
              </p>
              <DynamicGameDataEditor 
                gameType={form.game_type}
                gameData={{}} // Empty for new game
                onChange={(gd) => set('game_data' as any, gd)}
              />
            </div>
          </Section>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 p-5 rounded-[2rem] flex items-center gap-4 text-red-600 font-bold"
            >
              <AlertCircle size={22} />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit row */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-5 rounded-[2rem] bg-white border border-slate-200 font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || success}
            className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all shadow-2xl ${
              success
                ? 'bg-emerald-500 text-white shadow-emerald-200'
                : submitting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:scale-[1.02] active:scale-[0.98] shadow-slate-300'
            }`}
          >
            {success ? (
              <>✓ Created — Redirecting...</>
            ) : submitting ? (
              <><Loader2 size={20} className="animate-spin" /> Saving to Cloud...</>
            ) : (
              <><Plus size={20} /> Create Game Activity</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Reusable UI helpers ── */

const inputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all text-sm';

const selectClass =
  'w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all text-sm cursor-pointer';

function Field({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-1">
        {icon}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function Section({
  icon,
  title,
  accent,
  dark,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`p-8 rounded-[3rem] border space-y-6 ${
        dark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-100 shadow-sm'
      }`}
    >
      <div className={`flex items-center gap-4 ${dark ? 'text-primary' : 'text-slate-700'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
          {icon}
        </div>
        <h2 className={`font-black text-sm uppercase tracking-widest ${dark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
