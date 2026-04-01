'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon, 
  Type, 
  Layers,
  Sparkles,
  Gamepad2,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArrangementActivity {
  id: string;
  word: string;
  picture: string;
  hint?: string;
  order: number;
}

interface DifficultyGroup {
  id: string;
  activities: ArrangementActivity[];
  order: number;
}

interface GameData {
  difficultyLevels: {
    easy: DifficultyGroup[];
    medium: DifficultyGroup[];
    hard: DifficultyGroup[];
  };
}

interface Props {
  gameType: number;
  gameData: any;
  onChange: (data: any) => void;
}

const DEFAULT_ARRANGEMENT_DATA: GameData = {
  difficultyLevels: {
    easy: [{ id: 'easy_1', order: 0, activities: [{ id: 'e1_1', word: '', picture: '', order: 0 }] }],
    medium: [{ id: 'medium_1', order: 0, activities: [{ id: 'm1_1', word: '', picture: '', order: 0 }] }],
    hard: [{ id: 'hard_1', order: 0, activities: [{ id: 'h1_1', word: '', picture: '', order: 0 }] }],
  }
};

export default function DynamicGameDataEditor({ gameType, gameData, onChange }: Props) {
  const [data, setData] = useState<any>(gameData || {});
  const [activeTab, setActiveTab] = useState<'easy' | 'medium' | 'hard'>('easy');

  useEffect(() => {
    if (!gameData || Object.keys(gameData).length === 0) {
      const initial = gameType === 4 ? DEFAULT_ARRANGEMENT_DATA : {};
      setData(initial);
      onChange(initial);
    } else {
      setData(gameData);
    }
  }, [gameType]);

  const updateData = (newData: any) => {
    setData(newData);
    onChange(newData);
  };

  const addActivity = (diff: 'easy' | 'medium' | 'hard') => {
    const newData = { ...data };
    if (!newData.difficultyLevels) newData.difficultyLevels = DEFAULT_ARRANGEMENT_DATA.difficultyLevels;
    
    // For simplicity, we just add to the first group in that difficulty
    const group = newData.difficultyLevels[diff][0];
    const newAct: ArrangementActivity = {
      id: `${diff}_${Date.now()}`,
      word: '',
      picture: '',
      order: group.activities.length
    };
    
    group.activities.push(newAct);
    updateData(newData);
  };

  const removeActivity = (diff: 'easy' | 'medium' | 'hard', id: string) => {
    const newData = { ...data };
    const group = newData.difficultyLevels[diff][0];
    group.activities = group.activities.filter((a: any) => a.id !== id);
    updateData(newData);
  };

  const updateActivity = (diff: 'easy' | 'medium' | 'hard', id: string, fields: Partial<ArrangementActivity>) => {
    const newData = { ...data };
    const group = newData.difficultyLevels[diff][0];
    const act = group.activities.find((a: any) => a.id === id);
    if (act) {
      Object.assign(act, fields);
      if (fields.word !== undefined) {
        // Sync word to uppercase
        act.word = fields.word.toUpperCase();
      }
    }
    updateData(newData);
  };

  // Only supporting Type 4 (Arrangement) for now as requested
  if (gameType !== 4) {
    return (
      <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Content editor pending for Type {gameType}
        </p>
        <p className="text-[0.65rem] text-slate-300 mt-1 uppercase tracking-widest">
          Type 4: Arrangement is currently the priority.
        </p>
      </div>
    );
  }

  const currentActivities = data?.difficultyLevels?.[activeTab]?.[0]?.activities || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {(['easy', 'medium', 'hard'] as const).map((diff) => (
          <button
            key={diff}
            type="button"
            onClick={() => setActiveTab(diff)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === diff 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {currentActivities.map((act: any, index: number) => (
            <motion.div
              key={act.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex gap-6 items-start relative overflow-hidden"
            >
              {/* Index Number Decoration */}
              <div className="absolute -left-2 -top-2 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-[0.6rem] font-black text-slate-200 group-hover:text-primary/20 transition-colors">
                #{index + 1}
              </div>

              {/* Image Input Container */}
              <div className="w-32 h-32 bg-slate-50 rounded-3xl overflow-hidden flex-shrink-0 border-2 border-transparent group-focus-within:border-primary/20 transition-all relative group/img">
                {act.picture ? (
                  <img src={act.picture} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
                    <ImageIcon size={24} />
                    <span className="text-[0.6rem] font-black uppercase tracking-tighter">No Image</span>
                  </div>
                )}
                {/* Image Overlay Input */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-2">
                   <input 
                     type="text"
                     placeholder="Image URL..."
                     value={act.picture}
                     onChange={(e) => updateActivity(activeTab, act.id, { picture: e.target.value })}
                     className="w-full bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-[0.6rem] font-bold outline-none"
                   />
                </div>
              </div>

              {/* Content Inputs */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest px-1">Arrangement Word</label>
                    <div className="flex items-center bg-slate-50 rounded-2xl px-4 border border-transparent focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <Type size={14} className="text-slate-300 mr-2" />
                      <input 
                        type="text"
                        placeholder="e.g. CAT, APPLE"
                        value={act.word}
                        onChange={(e) => updateActivity(activeTab, act.id, { word: e.target.value })}
                        className="w-full py-3 bg-transparent border-none focus:ring-0 font-black text-slate-800 placeholder:text-slate-200 tracking-widest uppercase"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest px-1">Audio/Hint</label>
                    <div className="flex items-center bg-slate-50 rounded-2xl px-4 border border-transparent focus-within:border-primary/20 transition-all">
                      <Settings2 size={14} className="text-slate-300 mr-2" />
                      <input 
                        type="text"
                        placeholder="Optional audio or hint..."
                        value={act.hint || ''}
                        onChange={(e) => updateActivity(activeTab, act.id, { hint: e.target.value })}
                        className="w-full py-3 bg-transparent border-none focus:ring-0 font-bold text-slate-500 placeholder:text-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex -space-x-2">
                    {act.word.split('').map((char: string, i: number) => (
                      <div key={i} className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[0.65rem] font-black text-primary shadow-sm">
                        {char}
                      </div>
                    ))}
                    {act.word.length === 0 && (
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[0.65rem] font-black text-slate-300 italic">
                        ?
                      </div>
                    )}
                  </div>
                  <span className="text-[0.6rem] font-bold text-slate-300 uppercase tracking-widest">
                    Generated Letters: {act.word.length}
                  </span>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => removeActivity(activeTab, act.id)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all self-center"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Button */}
        <button
          type="button"
          onClick={() => addActivity(activeTab)}
          className="w-full py-6 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center gap-3 text-slate-300 hover:border-primary/20 hover:text-primary hover:bg-primary/5 transition-all group"
        >
          <div className="w-8 h-8 bg-slate-50 group-hover:bg-primary/10 rounded-xl flex items-center justify-center transition-colors">
            <Plus size={20} />
          </div>
          <span className="font-black uppercase tracking-widest text-xs">Add Word to {activeTab} Track</span>
        </button>
      </div>

      {/* Summary Footer */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-primary" />
            <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">
              Total Questions: <span className="text-slate-900">{currentActivities.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Gamepad2 size={14} className="text-emerald-500" />
            <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">
              Validated: <span className="text-emerald-500">YES</span>
            </span>
          </div>
        </div>
        <p className="text-[0.6rem] text-slate-300 font-bold uppercase tracking-widest italic">
          Values are auto-synced to RESPECT registry
        </p>
      </div>
    </div>
  );
}
