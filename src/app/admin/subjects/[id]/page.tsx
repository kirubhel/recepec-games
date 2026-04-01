'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Layout, 
  Type, 
  Info,
  ChevronRight,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  Database
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRespectGame } from '@/lib/respect/api';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  id: string;
  word: string;
  hint: string;
  image: string;
}

interface GameData {
  easy: Question[];
  medium: Question[];
  hard: Question[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

export default function GameContentManager({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [activeTab, setActiveTab] = useState<Difficulty>('easy');
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameData, setGameData] = useState<GameData>({
    easy: [],
    medium: [],
    hard: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState<null | 'success' | 'error'>(null);

  useEffect(() => {
    async function fetchGame() {
      try {
        setLoading(true);
        // 1. Search for Letter Arrangement (type 4) for this subject
        const listResponse = await fetch(`${API_BASE_URL}/respect/games`);
        const listResult = await listResponse.json();
        const listData = listResult.data || listResult;

        const foundGame = listData.find((g: any) => 
          g.subject_id === resolvedParams.id && g.game_type === 4
        );

        if (foundGame) {
          setGameId(foundGame.id);
          
          // 2. Use the robust fetch strategy from our API utility
          const fullGame = await fetchRespectGame(foundGame.id);
          
          if (fullGame && fullGame.game_data) {
            let data = fullGame.game_data;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch (e) { data = {}; }
            }

            // Extract using hierarchical fallback consistent with student player
            const easy = data.difficultyLevels?.easy || data.easy || [];
            const medium = data.difficultyLevels?.medium || data.medium || 
                          data.questions || data.levels || data.items || [];
            const hard = data.difficultyLevels?.hard || data.hard || [];

            setGameData({
              easy: Array.isArray(easy) ? easy : [],
              medium: Array.isArray(medium) ? medium : [],
              hard: Array.isArray(hard) ? hard : [],
            });
          }
        } else {
          console.warn('No Letter Arrangement game found for this subject');
          setError('No Arrangement game exists for this subject. Click save to initialize one.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Connection failed. Using local drafting mode.');
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [resolvedParams.id]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      word: '',
      hint: '',
      image: '',
    };
    setGameData({
      ...gameData,
      [activeTab]: [...gameData[activeTab], newQuestion]
    });
  };

  const updateQuestion = (id: string, field: keyof Question, value: string) => {
    const updated = gameData[activeTab].map(q => 
      q.id === id ? { ...q, [field]: value } : q
    );
    setGameData({ ...gameData, [activeTab]: updated });
  };

  const deleteQuestion = (id: string) => {
    const filtered = gameData[activeTab].filter(q => q.id !== id);
    setGameData({ ...gameData, [activeTab]: filtered });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const endpoint = gameId 
        ? `${API_BASE_URL}/games/${gameId}` 
        : `${API_BASE_URL}/games`;
      const method = gameId ? 'PUT' : 'POST';

      const body = gameId 
        ? { game_data: gameData, is_free: true } 
        : { 
            title: 'Letter Arrangement', 
            subject_id: resolvedParams.id, 
            game_type: 4, 
            game_data: gameData,
            is_active: true,
            is_free: true
          };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Cloud synchronization failed');
      
      const result = await response.json();
      if (result.status === 'success' && !gameId) {
        setGameId(result.data.id);
      }

      setShowStatus('success');
      setTimeout(() => setShowStatus(null), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setShowStatus('error');
      setError('Failed to push updates to Learning Cloud');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 size={64} className="animate-spin text-primary" />
          <Database size={24} className="absolute inset-0 m-auto text-primary/50" />
        </div>
        <div className="text-center">
          <p className="font-black uppercase tracking-[0.4em] text-sm text-slate-800">Establishing Session</p>
          <p className="text-slate-400 font-serif italic text-xs mt-1 underline decoration-primary/20">querying subject manifest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-5 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-8">
          <Link 
            href="/admin/subjects" 
            className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-90"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-widest flex items-center gap-2">
                <Terminal size={10} /> Letter Arrangement
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 font-bold text-sm italic">{gameId ? `Synced ID: ${gameId.substring(0,8)}...` : 'Uninitialized'}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-none">Quest Content Editor</h1>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] font-bold shadow-2xl transition-all active:scale-95 ${
            saving ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black shadow-slate-300/50'
          }`}
        >
          {saving ? (
            <Loader2 size={20} className="animate-spin" />
          ) : <Save size={20} />}
          <span>{saving ? 'Processing...' : 'Push to Cloud'}</span>
        </button>
      </div>

      {error && !gameId && (
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-[2rem] flex items-center gap-4 text-primary font-bold">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm">Initialization Required</p>
            <p className="text-xs font-serif italic text-slate-500">This subject doesn't have an arrangement config yet. Use the editor below then click "Push to Cloud" to initialize.</p>
          </div>
        </div>
      )}

      {/* Main Form Area */}
      <div className="grid grid-cols-12 gap-10">
        {/* Left Column: Navigation Tabs */}
        <div className="col-span-3 space-y-4">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setActiveTab(diff)}
              className={`w-full group relative flex items-center justify-between px-8 py-6 rounded-[2rem] border transition-all duration-300 ${
                activeTab === diff 
                ? 'bg-white border-primary shadow-2xl shadow-primary/10 ring-4 ring-primary/5' 
                : 'bg-transparent border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col items-start gap-1">
                <span className={`text-[0.65rem] font-black uppercase tracking-[0.2em] ${
                  activeTab === diff ? 'text-primary' : 'text-slate-400'
                }`}>{diff} LEVEL</span>
                <span className={`text-xl font-black ${
                  activeTab === diff ? 'text-slate-900' : 'text-slate-500'
                }`}>{gameData[diff].length} Questions</span>
              </div>
              <ChevronRight size={20} className={activeTab === diff ? 'text-primary' : 'text-slate-300 group-hover:translate-x-1 transition-transform'} />
            </button>
          ))}
          
          <div className="mt-10 p-8 bg-black rounded-[2.5rem] text-white space-y-4 shadow-2xl shadow-slate-300">
            <Layout size={32} className="text-primary mb-2" />
            <h3 className="font-extrabold text-xl leading-tight italic font-serif underline underline-offset-8 decoration-primary">RESPECT Standards</h3>
            <ul className="text-xs font-semibold text-slate-400 space-y-3 pt-4">
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" /> Word data is exported for AI training.</li>
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" /> Native app pre-fetches all synced assets.</li>
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" /> Changes apply to OPDS catalog instantly.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Question List */}
        <div className="col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {gameData[activeTab].map((question, index) => (
                <div key={question.id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 relative">
                  <div className="absolute -left-4 top-10 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg">
                    {index + 1}
                  </div>

                  <div className="flex gap-8">
                    {/* Image Upload Area */}
                    <div className="w-48 space-y-3 flex-shrink-0">
                      <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all overflow-hidden relative group/img shadow-inner">
                        {question.image ? (
                          <img src={question.image} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                          <>
                            <UploadCloud size={32} className="mb-2" />
                            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-center px-4">Cloud Asset</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              const file = e.target.files[0];
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('bucket', 'elearning-assets');
                              
                              try {
                                // Real upload to Go backend
                                const uploadRes = await fetch(`${API_BASE_URL}/storage/upload`, {
                                    method: 'POST',
                                    body: formData
                                });
                                const uploadResult = await uploadRes.json();
                                if (uploadResult.status === 'success') {
                                    updateQuestion(question.id, 'image', uploadResult.data.url);
                                }
                              } catch (err) {
                                console.error('Upload failed:', err);
                                updateQuestion(question.id, 'image', URL.createObjectURL(file));
                              }
                            }
                          }}
                        />
                      </div>
                      <p className="text-[0.6rem] text-center font-black text-slate-400 uppercase tracking-widest italic decoration-primary/30 underline underline-offset-4">CDN Linked</p>
                    </div>

                    {/* Question Details Area */}
                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-wider text-slate-400 px-1">
                            <Type size={12} className="text-primary" /> Target Word
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-xl text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all uppercase placeholder:italic placeholder:font-serif placeholder:font-medium placeholder:text-slate-200"
                            placeholder="e.g. CAT"
                            value={question.word}
                            onChange={(e) => updateQuestion(question.id, 'word', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-wider text-slate-400 px-1">
                            <Info size={12} className="text-secondary" /> Context Hint
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-600 focus:ring-4 focus:ring-secondary/10 transition-all placeholder:italic placeholder:font-serif placeholder:font-medium placeholder:text-slate-200"
                            placeholder="e.g. Meows"
                            value={question.hint}
                            onChange={(e) => updateQuestion(question.id, 'hint', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between">
                         <div className="flex gap-2">
                            {(question.word || '???').split('').map((char, i) => (
                              <div key={i} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-300 text-xs shadow-sm">
                                {char}
                              </div>
                            ))}
                         </div>
                         <button 
                           onClick={() => deleteQuestion(question.id)}
                           className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                         >
                           <Trash2 size={20} />
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={addQuestion}
                className="w-full py-10 rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 font-black uppercase tracking-[0.3em] group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
                  <Plus size={32} />
                </div>
                <span>New Unit</span>
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Status Notifier */}
      <AnimatePresence>
        {showStatus === 'success' && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-10 py-5 rounded-[2rem] shadow-2xl shadow-emerald-500/50 flex items-center gap-4 z-50 pointer-events-none"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="font-black text-lg leading-tight uppercase tracking-widest">DATA SYNCED</p>
              <p className="text-sm font-bold opacity-80">RESPECT manifestations updated successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
