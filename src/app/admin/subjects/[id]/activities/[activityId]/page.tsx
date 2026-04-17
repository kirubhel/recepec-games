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
  Database,
  Terminal
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRespectGame } from '@/lib/respect/api';
import { useParams, useRouter } from 'next/navigation';

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

export default function ActivityContentManager() {
  const params = useParams();
  const subjectId = params.id as string;
  const activityId = params.activityId as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Difficulty>('easy');
  const [gameData, setGameData] = useState<GameData>({
    easy: [],
    medium: [],
    hard: [],
  });

  const [gameTitle, setGameTitle] = useState('Activity Content');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState<null | 'success' | 'error'>(null);

  useEffect(() => {
    async function fetchGame() {
      if (!activityId) return;
      try {
        setLoading(true);
        const fullGame = await fetchRespectGame(activityId);
        
        if (fullGame) {
          setGameTitle(fullGame.title);
          if (fullGame.game_data) {
            let data = fullGame.game_data;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch (e) { data = {}; }
            }

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
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Connection failed. Using local drafting mode.');
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [activityId]);

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

      const response = await fetch(`${API_BASE_URL}/respect/games/${activityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_data: gameData })
      });

      if (!response.ok) throw new Error('Cloud synchronization failed');
      
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
        <Loader2 size={64} className="animate-spin text-primary" />
        <p className="font-black uppercase tracking-widest text-slate-400">Loading Content Editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-5 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => router.back()} 
            className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-widest flex items-center gap-2">
                <Terminal size={10} /> {gameTitle}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-none">Content Editor</h1>
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
          <span>{saving ? 'Processing...' : 'Save Content'}</span>
        </button>
      </div>

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
                }`}>{gameData[diff].length} Units</span>
              </div>
              <ChevronRight size={20} className={activeTab === diff ? 'text-primary' : 'text-slate-300 group-hover:translate-x-1 transition-transform'} />
            </button>
          ))}
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
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Details Area */}
                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-wider text-slate-400 px-1">
                            <Type size={12} className="text-primary" /> Target Word
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-xl text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all uppercase placeholder:text-slate-200"
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
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-600 focus:ring-4 focus:ring-secondary/10 transition-all placeholder:text-slate-200"
                            placeholder="e.g. Meows"
                            value={question.hint}
                            onChange={(e) => updateQuestion(question.id, 'hint', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-end">
                         <button 
                           onClick={() => deleteQuestion(question.id)}
                           className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
                className="w-full py-10 rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 font-black uppercase tracking-[0.3em]"
              >
                <Plus size={32} />
                <span>New Unit</span>
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Success/Error Notifier */}
      <AnimatePresence>
        {showStatus === 'success' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-50"
          >
            <CheckCircle2 size={24} />
            <span className="font-black uppercase tracking-widest text-xs">Content Saved</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
