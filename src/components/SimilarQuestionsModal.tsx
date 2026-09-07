"use client";

import React, { useState } from "react";
import { X, Sparkles, Check, ArrowRight, Lightbulb } from "lucide-react";
import { MathRenderer } from "./MathRenderer";

interface SimilarQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  shortcut_hint: string;
}

interface SimilarQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: SimilarQuestion[];
  technique: string;
}

export function SimilarQuestionsModal({
  isOpen,
  onClose,
  questions,
  technique,
}: SimilarQuestionsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!isOpen || !questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b0d13] border border-[#1c202e] rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-[#0e1017] border-b border-[#181b26] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-[#101b17] text-emerald-400 rounded border border-emerald-900/50">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-normal text-[#f1f5f9]">
                Similar Practice Question ({currentIndex + 1} of {questions.length})
              </h3>
              <p className="text-[10px] font-mono text-slate-500">
                Shortcut: {technique}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-[#161824]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {/* Question Text */}
          <div className="p-3 rounded bg-[#090a0f] border border-[#181b26] font-serif text-xs sm:text-sm font-normal text-[#f1f5f9] leading-relaxed">
            <MathRenderer content={currentQ.question} />
          </div>

          {/* Options */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Select Answer:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {currentQ.options?.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = currentQ.correct_answer?.includes(opt.slice(0, 3)) || opt === currentQ.correct_answer;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedOption(opt)}
                    className={`p-2 rounded text-xs text-left border transition-all flex items-center justify-between font-sans ${
                      isSelected
                        ? showExplanation
                          ? isCorrect
                            ? "bg-[#101b17] border-emerald-500 text-emerald-300"
                            : "bg-red-950/40 border-red-500 text-red-300"
                          : "bg-[#121520] border-indigo-500/80 text-white shadow-xs"
                        : "bg-[#090a0f] border-[#181b26] hover:bg-[#12141c] text-[#cbd5e1]"
                    }`}
                  >
                    <MathRenderer content={opt} />
                    {showExplanation && isCorrect && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hint / Explanation */}
          {showExplanation ? (
            <div className="p-3 rounded bg-[#1a1710] border border-amber-900/50 space-y-1">
              <div className="flex items-center gap-1 text-xs font-mono text-amber-300">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>Correct Answer & Shortcut:</span>
              </div>
              <p className="text-xs font-mono text-emerald-400">
                Correct: {currentQ.correct_answer}
              </p>
              <div className="text-xs text-[#cbd5e1] font-light leading-relaxed">
                <MathRenderer content={currentQ.shortcut_hint} />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowExplanation(true)}
              className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Reveal Shortcut Hint & Answer</span>
            </button>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-4 py-2.5 border-t border-[#181b26] bg-[#0e1017] flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-white disabled:opacity-30"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "bg-emerald-400 w-3" : "bg-slate-700"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={currentIndex === questions.length - 1}
            onClick={handleNext}
            className="px-2.5 py-1 bg-[#181c2b] hover:bg-[#202638] text-white rounded text-xs font-mono border border-[#2e354e] flex items-center gap-1 shadow-xs disabled:opacity-30"
          >
            <span>Next</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
