"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Award,
  Loader2,
  FileQuestion,
  Tag,
  Save,
  Lightbulb,
  AlertTriangle,
  Calculator,
  Target,
  Layers,
  Flame,
  RotateCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MathRenderer } from "./MathRenderer";
import { SimilarQuestionsModal } from "./SimilarQuestionsModal";
import { VideoSolutionModal } from "./VideoSolutionModal";

interface Shortcut {
  technique: string;
  worked_solution: string;
  est_seconds: number;
  why_fast?: string;
}

interface JugaadHack {
  name: string;
  trick_type: string;
  worked_steps: string;
  est_seconds: number;
  why_it_works: string;
}

interface DoubtData {
  id?: string;
  topic: string;
  subtopic: string;
  difficultyEstimate?: string;
  questionText: string;
  options: string[];
  coreIntuition?: string;
  jugaadHack?: JugaadHack;
  patternTrigger?: string;
  generalizableFramework?: string;
  traditionalSolution: string;
  shortcuts: Shortcut[];
  optionTraps?: string;
  calcVerdict?: string;
  selfCheckNote?: string;
  deepRethinkSolution?: any;
  userStatus?: string;
  mistakeTag?: string | null;
  userNotes?: string;
  revisitCount?: number;
  sourceImage?: string | null;
  similarQuestions?: any[];
}

interface SolutionCardProps {
  doubt: DoubtData;
  onUpdateStatus?: (status: string, mistakeTag?: string) => void;
  onUpdateNotes?: (notes: string) => void;
  onDoubtUpdated?: (updated: DoubtData) => void;
}

export function SolutionCard({
  doubt,
  onUpdateStatus,
  onUpdateNotes,
  onDoubtUpdated,
}: SolutionCardProps) {
  const [activeTab, setActiveTab] = useState<"shortcuts" | "traditional" | "deep">("shortcuts");
  const [currentStatus, setCurrentStatus] = useState<string>(doubt.userStatus || "still_confused");
  const [currentMistakeTag, setCurrentMistakeTag] = useState<string>(doubt.mistakeTag || "none");
  const [userNotes, setUserNotes] = useState<string>(doubt.userNotes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [showHintBox, setShowHintBox] = useState(false);
  const [hintText, setHintText] = useState("");
  const [isGeneratingSimilar, setIsGeneratingSimilar] = useState(false);
  const [isSimilarModalOpen, setIsSimilarModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [similarQuestionsList, setSimilarQuestionsList] = useState<any[]>(doubt.similarQuestions || []);
  const [deepSolution, setDeepSolution] = useState<any>(doubt.deepRethinkSolution || null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (e.key === "1") handleStatusChange("still_confused");
      if (e.key === "2") handleStatusChange("understood");
      if (e.key === "3") handleStatusChange("mastered");
      if (e.key === "r" || e.key === "R") handleReprocess();
      if (e.key === "s" || e.key === "S") handleGenerateSimilar();
      if (e.key === "v" || e.key === "V") setIsVideoModalOpen(true);
      if (e.key === "Tab") {
        e.preventDefault();
        setActiveTab((prev) => (prev === "shortcuts" ? "traditional" : "shortcuts"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [doubt, currentMistakeTag]);

  const handleStatusChange = async (newStatus: string) => {
    setCurrentStatus(newStatus);
    if (newStatus === "mastered") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    if (doubt.id) {
      try {
        const res = await fetch(`/api/doubts/${doubt.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userStatus: newStatus,
            mistakeTag: newStatus === "still_confused" ? currentMistakeTag : null,
          }),
        });
        const data = await res.json();
        if (data.success && onDoubtUpdated) {
          onDoubtUpdated(data.doubt);
        }
      } catch (e) {
        console.error("Error updating status:", e);
      }
    }

    if (onUpdateStatus) {
      onUpdateStatus(newStatus, currentMistakeTag);
    }
  };

  const handleMistakeTagChange = async (tag: string) => {
    setCurrentMistakeTag(tag);
    if (doubt.id) {
      try {
        await fetch(`/api/doubts/${doubt.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mistakeTag: tag === "none" ? null : tag,
          }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!doubt.id) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/doubts/${doubt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userNotes }),
      });
      const data = await res.json();
      if (data.success && onDoubtUpdated) {
        onDoubtUpdated(data.doubt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleReprocess = async (customHint?: string) => {
    setIsReprocessing(true);
    try {
      const res = await fetch("/api/reprocess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doubtId: doubt.id,
          questionText: doubt.questionText,
          sourceImage: doubt.sourceImage,
          userCorrectionHint: customHint || hintText || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setActiveTab("shortcuts");
        setShowHintBox(false);
        setHintText("");

        const updatedDoubt: DoubtData = {
          ...doubt,
          questionText: data.result.question_text || doubt.questionText,
          options: Array.isArray(data.result.options) ? data.result.options : doubt.options,
          topic: data.result.topic || doubt.topic,
          subtopic: data.result.subtopic || doubt.subtopic,
          difficultyEstimate: data.result.difficulty_estimate || doubt.difficultyEstimate,
          coreIntuition: data.result.core_intuition || doubt.coreIntuition,
          jugaadHack: data.result.jugaad_hack || doubt.jugaadHack,
          patternTrigger: data.result.pattern_trigger || doubt.patternTrigger,
          generalizableFramework: data.result.generalizable_framework || doubt.generalizableFramework,
          traditionalSolution: data.result.traditional_solution || doubt.traditionalSolution,
          shortcuts: data.result.shortcuts || doubt.shortcuts,
          optionTraps: data.result.option_traps || doubt.optionTraps,
          calcVerdict: data.result.calc_verdict || doubt.calcVerdict,
          selfCheckNote: data.result.self_check_note || doubt.selfCheckNote,
          similarQuestions: data.result.similar_questions || doubt.similarQuestions,
        };

        if (data.result.similar_questions) {
          setSimilarQuestionsList(data.result.similar_questions);
        }

        if (onDoubtUpdated) {
          onDoubtUpdated(updatedDoubt);
        }
      }
    } catch (e) {
      console.error("Reprocess error:", e);
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleGenerateSimilar = async () => {
    if (similarQuestionsList.length > 0) {
      setIsSimilarModalOpen(true);
      return;
    }

    setIsGeneratingSimilar(true);
    try {
      const res = await fetch("/api/similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doubtId: doubt.id,
          questionText: doubt.questionText,
          topic: doubt.topic,
          subtopic: doubt.subtopic,
          technique: doubt.shortcuts?.[0]?.technique || "Topper Shortcut",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimilarQuestionsList(data.similarQuestions);
        setIsSimilarModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSimilar(false);
    }
  };

  return (
    <div className="bg-[#0b0d13] border border-[#1c202e] rounded-xl shadow-md overflow-hidden space-y-0">
      {/* Top Header Bar */}
      <div className="px-4 py-2.5 bg-[#0e1017] border-b border-[#181b26] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 bg-[#12141e] text-[#cbd5e1] font-mono text-[10px] rounded border border-[#202535]">
            {doubt.topic}
          </span>
          <span className="text-xs font-mono text-slate-400">
            {doubt.subtopic}
          </span>
          {doubt.difficultyEstimate && (
            <span className="px-1.5 py-0.5 bg-[#1a1710] text-amber-400/90 text-[9px] rounded border border-amber-900/40 font-mono">
              {doubt.difficultyEstimate}
            </span>
          )}
        </div>

        {/* Quick Action Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleReprocess()}
            disabled={isReprocessing}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-cyan-300 bg-[#0e1622] hover:bg-[#152336] rounded border border-cyan-800/60 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
            title="Completely re-solve and verify the question from scratch (Hotkey: R)"
          >
            {isReprocessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Re-Solving...</span>
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium">Re-Solve & Verify</span>
                <kbd className="hidden sm:inline text-[9px] bg-[#121c2c] px-1 py-0.2 rounded text-cyan-400/80 border border-cyan-800/40 font-mono">R</kbd>
              </>
            )}
          </button>

          <button
            onClick={() => setShowHintBox(!showHintBox)}
            className={`px-2 py-1 text-xs font-mono rounded border transition-all cursor-pointer ${
              showHintBox
                ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                : "bg-[#10131d] text-slate-400 hover:text-slate-200 border-[#202535]"
            }`}
            title="Add a custom correction or target hint before re-solving"
          >
            {showHintBox ? "Close Hint" : "+ Hint"}
          </button>

          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-purple-300 bg-[#160e24] hover:bg-[#221438] rounded border border-purple-800/60 transition-all shadow-sm cursor-pointer"
            title="Watch automated interactive blackboard video explanation (Hotkey: V)"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-medium">Video Explainer</span>
            <kbd className="hidden sm:inline text-[9px] bg-[#221338] px-1 py-0.2 rounded text-purple-400/90 border border-purple-800/40 font-mono">V</kbd>
          </button>

          <button
            onClick={handleGenerateSimilar}
            disabled={isGeneratingSimilar}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-emerald-300 bg-[#101b17] hover:bg-[#18211f] rounded border border-emerald-900/50 transition-all disabled:opacity-50"
            title="Generate practice questions (Hotkey: S)"
          >
            {isGeneratingSimilar ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileQuestion className="w-3 h-3 text-emerald-400" />
                <span>Similar</span>
                <kbd className="hidden sm:inline text-[9px] text-slate-500">S</kbd>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Hint / Correction Input Box */}
      {showHintBox && (
        <div className="p-3 bg-[#0d121c] border-b border-cyan-900/40 flex flex-wrap items-center gap-2 text-xs animate-in fade-in duration-150">
          <input
            type="text"
            value={hintText}
            onChange={(e) => setHintText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleReprocess(hintText);
            }}
            placeholder="Optional correction hint (e.g. 'Target answer is Option C' or 'Check coprime formula')..."
            className="flex-1 min-w-[200px] bg-[#080b12] border border-cyan-800/50 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            onClick={() => handleReprocess(hintText)}
            disabled={isReprocessing}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isReprocessing ? "Re-Solving..." : "Re-Solve with Hint ↵"}
          </button>
        </div>
      )}

      {/* Question Content Box */}
      <div className="p-4 sm:p-5 border-b border-[#181b26] bg-[#090a0f]/60 space-y-3">
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#64748b] mb-1">
            Problem Statement
          </h3>
          <div className="font-serif text-sm sm:text-base font-normal text-[#f1f5f9] leading-relaxed">
            <MathRenderer content={doubt.questionText} />
          </div>
        </div>

        {doubt.options && doubt.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#181b26]">
            {doubt.options.map((opt, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-[#0b0d13] border border-[#1c202e] text-xs text-[#cbd5e1] font-sans"
              >
                <MathRenderer content={opt} />
              </div>
            ))}
          </div>
        )}

        {/* Core Intuition Callout */}
        {doubt.coreIntuition && (
          <div className="p-3 rounded-lg bg-[#121520] border border-[#202535] flex items-start gap-2.5 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="w-full">
              <span className="font-medium text-amber-300 font-mono text-[10px] uppercase tracking-wider block mb-1">
                Core Intuition & Mental Model
              </span>
              <div className="text-[#cbd5e1] font-sans font-light leading-relaxed">
                <MathRenderer content={doubt.coreIntuition} />
              </div>
            </div>
          </div>
        )}

        {/* Street-Smart Jugaad Hack */}
        {doubt.jugaadHack && (
          <div className="p-3.5 rounded-lg bg-[#1a1710]/95 border border-amber-900/60 shadow-xs space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-amber-900/40">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-serif text-xs sm:text-sm font-medium text-amber-200">
                  {doubt.jugaadHack.name || "Street-Smart Jugaad (Random Value / Option Hack)"}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-[#261d0f] text-amber-300 font-mono text-[10px] rounded border border-amber-800/50">
                ≈{doubt.jugaadHack.est_seconds || 10}s Zero-Formula Hack
              </span>
            </div>

            <div className="text-amber-100/90 font-sans leading-relaxed pl-3 border-l-2 border-amber-500/50">
              <MathRenderer content={doubt.jugaadHack.worked_steps} />
            </div>

            {doubt.jugaadHack.why_it_works && (
              <div className="text-[11px] text-amber-300/80 font-mono pl-3 pt-0.5 italic">
                💡 <strong>Why you don't need complex theory:</strong>{" "}
                <MathRenderer content={doubt.jugaadHack.why_it_works} inline />
              </div>
            )}
          </div>
        )}

        {/* Pattern Recognition Trigger (5-Second Exam Spotter) */}
        {doubt.patternTrigger && (
          <div className="p-2.5 rounded-lg bg-[#0e1017] border border-[#1c202e] flex items-start gap-2.5 text-xs">
            <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="w-full">
              <span className="font-medium text-indigo-300 font-mono text-[10px] uppercase tracking-wider block mb-1">
                5-Second Exam Pattern Trigger
              </span>
              <div className="text-[#94a3b8] font-sans font-light leading-relaxed">
                <MathRenderer content={doubt.patternTrigger} />
              </div>
            </div>
          </div>
        )}

        {/* Generalizable Framework / Reusable Rule */}
        {doubt.generalizableFramework && (
          <div className="p-2.5 rounded-lg bg-[#101b17] border border-emerald-900/40 flex items-start gap-2.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="w-full">
              <span className="font-medium text-emerald-300 font-mono text-[10px] uppercase tracking-wider block mb-1">
                Reusable Exam Framework (Apply to similar questions)
              </span>
              <div className="text-[#cbd5e1] font-light leading-relaxed">
                <MathRenderer content={doubt.generalizableFramework} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Minimal Tabs Navigation: Fastest Attack vs Backup Method vs Deep Hack */}
      <div className="flex border-b border-[#181b26] bg-[#090a0f] p-1 gap-1">
        <button
          onClick={() => setActiveTab("shortcuts")}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-normal flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "shortcuts"
              ? "bg-[#141722] text-[#f1f5f9] border border-[#202535] shadow-xs"
              : "text-[#94a3b8] hover:text-[#cbd5e1]"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Fastest Attack Vector</span>
          <span className="px-1 py-0.2 rounded text-[10px] bg-[#1a1710] text-amber-400 font-mono border border-amber-900/40">
            {doubt.shortcuts?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("traditional")}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-normal flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "traditional"
              ? "bg-[#141722] text-[#f1f5f9] border border-[#202535] shadow-xs"
              : "text-[#94a3b8] hover:text-[#cbd5e1]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Backup Sanity Check</span>
        </button>

        {deepSolution && (
          <button
            onClick={() => setActiveTab("deep")}
            className={`py-1.5 px-3 rounded text-xs font-normal flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "deep"
                ? "bg-[#181c2b] text-indigo-200 border border-[#2e354e]"
                : "text-[#94a3b8] hover:bg-[#121520]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Deep 10s Hack</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {activeTab === "shortcuts" && (
          <div className="space-y-3.5">
            {doubt.shortcuts && doubt.shortcuts.length > 0 ? (
              doubt.shortcuts.map((sc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-lg bg-[#0d0f16] border border-[#181b26] space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-[#181b26]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-[#161924] border border-[#222738] text-slate-400 text-[9px] font-mono flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-medium text-xs sm:text-sm text-[#f1f5f9]">
                        <MathRenderer content={sc.technique} inline />
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {sc.why_fast && (
                        <span className="px-1.5 py-0.5 bg-[#1a1710] text-amber-300 text-[10px] rounded border border-amber-900/40 font-mono">
                          <MathRenderer content={sc.why_fast} inline />
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#94a3b8] bg-[#090a0f] px-1.5 py-0.5 rounded border border-[#181b26]">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {sc.est_seconds}s
                      </span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-[#cbd5e1] font-light leading-relaxed">
                    <MathRenderer content={sc.worked_solution} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono">No attack vector generated.</p>
            )}

            {/* Negative-Marking Guardrail / Trap Detector */}
            {doubt.optionTraps && (
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 flex items-start gap-2.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <div className="w-full">
                  <span className="font-medium text-red-300 font-mono text-[10px] uppercase tracking-wider block mb-1">
                    ⚠️ Negative-Marking Guardrail (-1 Trap Avoidance)
                  </span>
                  <div className="text-red-200/90 font-sans font-light leading-relaxed">
                    <MathRenderer content={doubt.optionTraps} />
                  </div>
                </div>
              </div>
            )}

            {/* On-Screen Calculator Verdict */}
            {doubt.calcVerdict && (
              <div className="p-2.5 rounded-lg bg-[#0e1017] border border-[#181b26] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-400" /> On-Screen Calculator Speed Verdict:
                </span>
                <div className="text-[#cbd5e1] text-[11px]">
                  <MathRenderer content={doubt.calcVerdict} inline />
                </div>
              </div>
            )}

            {doubt.selfCheckNote && (
              <div className="p-2.5 rounded-lg bg-[#121520] border border-[#202535] text-xs text-[#cbd5e1] flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#f1f5f9]">Self-Critique Note: </span>
                  <MathRenderer content={doubt.selfCheckNote} inline />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "traditional" && (
          <div className="space-y-3">
            <div className="p-3.5 sm:p-4 rounded-lg bg-[#0d0f16] border border-[#181b26] text-xs sm:text-sm leading-relaxed">
              <MathRenderer content={doubt.traditionalSolution} />
            </div>

            {doubt.calcVerdict && (
              <div className="p-2.5 rounded-lg bg-[#0e1017] border border-[#181b26] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-400" /> On-Screen Calculator Verdict:
                </span>
                <span className="text-[#cbd5e1] text-[11px]">
                  {doubt.calcVerdict}
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === "deep" && deepSolution && (
          <div className="p-4 rounded-lg bg-[#131622] border border-[#252a3d] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-[#202538]">
              <span className="font-medium text-xs sm:text-sm text-[#f1f5f9] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <MathRenderer content={deepSolution.technique} inline />
              </span>
              <span className="px-1.5 py-0.5 bg-[#181c2b] text-indigo-300 text-[10px] rounded border border-[#2e354e] font-mono">
                <MathRenderer content={deepSolution.why_fast || `≈${deepSolution.est_seconds || 10}s topper trick`} inline />
              </span>
            </div>

            <div className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
              <MathRenderer content={deepSolution.worked_solution} />
            </div>

            {deepSolution.critique_insight && (
              <div className="p-2.5 bg-[#0d0f16] rounded-lg border border-[#1c202e] text-xs text-[#94a3b8] italic space-y-0.5">
                <strong className="text-indigo-300 not-italic block font-mono text-[10px] uppercase tracking-wider mb-0.5">
                  💡 Why toppers bypass standard formulas:
                </strong>
                <MathRenderer content={deepSolution.critique_insight} inline />
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Status, Mistake Tagging & Personal Notes Footer */}
      <div className="p-4 bg-[#090a0f] border-t border-[#181b26] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Status Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-slate-500">Status:</span>

            <button
              type="button"
              onClick={() => handleStatusChange("still_confused")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all font-mono ${
                currentStatus === "still_confused"
                  ? "bg-red-950/40 text-red-300 border border-red-900/50"
                  : "bg-[#0d0f16] text-[#94a3b8] border border-[#181b26] hover:text-[#cbd5e1]"
              }`}
              title="Press 1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Still Confused</span>
              <kbd className="hidden sm:inline text-[9px] text-slate-500">1</kbd>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange("understood")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all font-mono ${
                currentStatus === "understood"
                  ? "bg-amber-950/30 text-amber-300 border border-amber-900/50"
                  : "bg-[#0d0f16] text-[#94a3b8] border border-[#181b26] hover:text-[#cbd5e1]"
              }`}
              title="Press 2"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Understood</span>
              <kbd className="hidden sm:inline text-[9px] text-slate-500">2</kbd>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange("mastered")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all font-mono ${
                currentStatus === "mastered"
                  ? "bg-emerald-950/40 text-emerald-300 border border-emerald-900/50"
                  : "bg-[#0d0f16] text-[#94a3b8] border border-[#181b26] hover:text-[#cbd5e1]"
              }`}
              title="Press 3"
            >
              <Award className="w-3 h-3" />
              <span>Mastered!</span>
              <kbd className="hidden sm:inline text-[9px] text-slate-500">3</kbd>
            </button>
          </div>

          {/* Mistake Tagging */}
          {currentStatus === "still_confused" && (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-500" />
              <select
                value={currentMistakeTag}
                onChange={(e) => handleMistakeTagChange(e.target.value)}
                className="text-xs font-mono px-2 py-0.5 rounded bg-[#0d0f16] border border-[#181b26] text-[#cbd5e1] focus:outline-none"
              >
                <option value="none">Reason (optional)</option>
                <option value="concept_gap">Concept Gap</option>
                <option value="calculation_slip">Calculation Slip</option>
                <option value="ran_out_of_time">Ran Out of Time</option>
                <option value="option_misread">Option Misread</option>
              </select>
            </div>
          )}
        </div>

        {/* Personal Study Notes */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-mono text-slate-500">
              Personal Takeaways & Notes:
            </label>
            {doubt.id && (
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                {isSavingNotes ? "Saving..." : "Save Notes"}
              </button>
            )}
          </div>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Key exam takeaways or formulas to remember..."
            rows={2}
            className="w-full px-2.5 py-1.5 text-xs bg-[#0b0d13] border border-[#181b26] rounded-lg focus:outline-none focus:border-[#2e354e] text-[#cbd5e1] placeholder-slate-600 font-sans"
          />
        </div>
      </div>

      {/* Similar Questions Modal */}
      <SimilarQuestionsModal
        isOpen={isSimilarModalOpen}
        onClose={() => setIsSimilarModalOpen(false)}
        questions={similarQuestionsList}
        technique={doubt.shortcuts?.[0]?.technique || "Topper Shortcut"}
      />

      {/* Zero-Cost Interactive Video Explainer Modal */}
      <VideoSolutionModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        doubt={doubt}
      />
    </div>
  );
}
