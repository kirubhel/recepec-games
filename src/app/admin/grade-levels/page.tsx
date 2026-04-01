'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  X, 
  CheckCircle2,
  ChevronRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GradeLevel {
  id: string;
  name: string;
  level_number: number;
  description?: string;
  is_active: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

export default function GradeLevelsPage() {
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    fetchGradeLevels();
  }, []);

  async function fetchGradeLevels() {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/respect/grade-levels`);
      const result = await response.json();
      
      if (result.status === 'success' || result.success) {
        setGradeLevels(result.data || []);
      } else {
        throw new Error('Failed to fetch grade levels');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Connection failed. Cloud systems might be unreachable.');
      // Local fallback for dev
      setGradeLevels([
        { id: '1', name: 'Grade 1', level_number: 1, is_active: true },
        { id: '2', name: 'Grade 2', level_number: 2, is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      level_number: parseInt(formData.get('level_number') as string),
      description: formData.get('description') as string,
      is_active: true
    };

    try {
      setIsSubmitting(true);
      const url = selectedGrade 
        ? `${API_BASE_URL}/respect/grade-levels/${selectedGrade.id}`
        : `${API_BASE_URL}/respect/grade-levels`;
      
      const response = await fetch(url, {
        method: selectedGrade ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to save grade level');
      
      await fetchGradeLevels();
      setShowModal(false);
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGrades = gradeLevels.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Grade Tracks</h1>
          <p className="text-slate-500 font-medium font-serif italic mt-1">Management of respect_grade_levels within the cloud ecosystem.</p>
        </div>
        
        <button 
          onClick={() => { setSelectedGrade(null); setShowModal(true); }}
          className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-3xl font-bold shadow-xl shadow-slate-300 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Plus size={20} />
          <span>New Grade Track</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4">
             <Loader2 size={48} className="animate-spin text-primary" />
             <p className="font-black uppercase tracking-[0.3em] text-[0.6rem] text-slate-400">Syncing Grade Tables...</p>
          </div>
        ) : filteredGrades.map((grade) => (
          <div key={grade.id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-all group-hover:scale-110">
                <GraduationCap size={32} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedGrade(grade); setShowModal(true); }} className="p-2 text-slate-300 hover:text-primary transition-colors"><Edit size={18} /></button>
                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest">Live Cloud Track</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{grade.name}</h3>
                <p className="text-slate-400 text-sm font-semibold italic font-serif">Level {grade.level_number}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSave} className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Database size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedGrade ? 'Edit' : 'New'} Grade Track</h2>
                  </div>
                  <button type="button" onClick={() => setShowModal(false)} className="text-slate-300 hover:text-slate-900"><X /></button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-1">Track Name</label>
                    <input name="name" defaultValue={selectedGrade?.name} required className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all" placeholder="e.g. Grade 1" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-1">Level Number</label>
                    <input name="level_number" type="number" defaultValue={selectedGrade?.level_number} required className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all" placeholder="1" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (selectedGrade ? 'Update Cloud' : 'Initialize Track')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sync Status */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
             <CheckCircle2 size={24} />
             <span className="font-bold uppercase tracking-widest text-xs">Cloud Manifest Updated Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
