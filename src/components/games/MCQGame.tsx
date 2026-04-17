'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

interface MCQGameProps {
  data: {
    question: string;
    options: string[];
    answer: any;
    picture?: string;
  };
  onSuccess: () => void;
}

const MCQGame = forwardRef(({ data, onSuccess }: MCQGameProps, ref) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useImperativeHandle(ref, () => ({
    handleHint: () => {
      // For MCQ, a hint could highlight the correct answer or eliminate one wrong answer
      // For now, let's just show a subtle pulse on the correct option
    },
    handleRetry: () => {
      setSelectedOption(null);
      setIsCorrect(null);
    }
  }));

  const handleSelect = (index: number) => {
    if (isCorrect !== null) return;
    
    setSelectedOption(index);
    const correct = index === data.answer;
    setIsCorrect(correct);

    if (correct) {
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-6">
        {data.picture && (
          <div className="w-full h-48 md:h-64 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-xl mb-6">
            <img src={data.picture} alt="Question" className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-900 shadow-sm">
            <HelpCircle size={32} />
          </div>
          <h3 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight uppercase">
            {data.question}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.options.length > 0 ? (
          data.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const showSuccess = isSelected && isCorrect === true;
            const showError = isSelected && isCorrect === false;

            return (
              <button
                key={index}
                disabled={isCorrect !== null}
                onClick={() => handleSelect(index)}
                className={`w-full py-6 px-10 text-left rounded-3xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ${
                  showSuccess 
                    ? 'bg-emerald-50 border-emerald-500 shadow-emerald-100' 
                    : showError 
                    ? 'bg-rose-50 border-rose-500 shadow-rose-100' 
                    : 'bg-white hover:shadow-xl border-slate-100 hover:border-primary/20'
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
                    showSuccess ? 'bg-emerald-500 text-white' : 
                    showError ? 'bg-rose-500 text-white' : 
                    'bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className={`text-lg font-bold ${
                    showSuccess ? 'text-emerald-700' : 
                    showError ? 'text-rose-700' : 
                    'text-slate-700'
                  }`}>
                    {option}
                  </span>
                </div>

                <div className="relative z-10">
                  {showSuccess ? (
                    <CheckCircle size={24} className="text-emerald-500 animate-in zoom-in" />
                  ) : showError ? (
                    <XCircle size={24} className="text-rose-500 animate-in zoom-in" />
                  ) : (
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                  )}
                </div>

                {/* Success/Error Splash Effect */}
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 4, opacity: 0.1 }}
                    className={`absolute inset-0 rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  />
                )}
              </button>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold italic">No options provided for this question.</p>
          </div>
        )}
      </div>
    </div>
  );
});

MCQGame.displayName = 'MCQGame';

export default MCQGame;
