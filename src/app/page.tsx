"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { SolutionCard } from "@/components/SolutionCard";

export default function HomePage() {
  const [isSolving, setIsSolving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDoubt, setActiveDoubt] = useState<any>(null);
  const [recentDoubts, setRecentDoubts] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentDoubts();
  }, []);

  const fetchRecentDoubts = async () => {
    try {
      const res = await fetch("/api/doubts?sortBy=createdAt&sortOrder=desc");
      const data = await res.json();
      if (data.success) {
        setRecentDoubts(data.doubts.slice(0, 4));
      }
    } catch (e) {
      console.error("Failed to load recent doubts:", e);
    }
  };

  const handleSolve = async (payload: {
    imageBase64?: string;
    imageMimeType?: string;
    textPrompt?: string;
  }) => {
    setIsSolving(true);
    setErrorMessage(null);
    setActiveDoubt(null);
    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to solve doubt. Please check your image or paste question text directly.");
        return;
      }

      if (data.success && data.doubt) {
        const doubtObj = {
          ...data.doubt,
          options: typeof data.doubt.options === "string" ? JSON.parse(data.doubt.options || "[]") : data.doubt.options,
          shortcuts: typeof data.doubt.shortcuts === "string" ? JSON.parse(data.doubt.shortcuts || "[]") : data.doubt.shortcuts,
          jugaadHack: typeof data.doubt.jugaadHack === "string" ? JSON.parse(data.doubt.jugaadHack) : data.doubt.jugaadHack,
          similarQuestions: data.doubt.similarQuestions
            ? typeof data.doubt.similarQuestions === "string"
              ? JSON.parse(data.doubt.similarQuestions)
              : data.doubt.similarQuestions
            : [],
        };
        setActiveDoubt(doubtObj);
        fetchRecentDoubts();
      } else if (data.result) {
        setActiveDoubt({
          ...data.result,
          questionText: data.result.question_text,
          coreIntuition: data.result.core_intuition,
          jugaadHack: data.result.jugaad_hack,
          patternTrigger: data.result.pattern_trigger,
          generalizableFramework: data.result.generalizable_framework,
          optionTraps: data.result.option_traps,
          calcVerdict: data.result.calc_verdict,
          traditionalSolution: data.result.traditional_solution,
          difficultyEstimate: data.result.difficulty_estimate,
        });
      } else {
        setErrorMessage("No solution returned. Please try re-entering the question or verifying API keys in Settings.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to connect to solving server. Please check your connection.");
    } finally {
      setIsSolving(false);
    }
  };

  const loadSampleQuestion = (sampleText: string) => {
    handleSolve({ textPrompt: sampleText });
  };

  return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {/* Hero Header */}
      <section className="text-center space-y-2.5 pt-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#10121a] border border-[#1c202d] text-[10px] font-mono text-[#94a3b8]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>99+ Percentile CAT Quant Mentorship</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#f1f5f9] tracking-tight">
          Solve CAT Quant with <span className="italic text-amber-300 font-normal">~25-Second</span> Shortcuts
        </h1>

        <p className="font-sans text-xs sm:text-sm text-[#94a3b8] font-light max-w-lg mx-auto leading-relaxed">
          Paste a screenshot or PDF of any doubt. Get the standard formula solution plus the cleverest exam shortcuts to crack it in seconds.
        </p>

        {/* Feature comparison pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
          <div className="px-2.5 py-1 rounded bg-[#0b0d13] border border-[#1c202e] flex items-center gap-1.5 text-[#cbd5e1] font-mono text-[10px]">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>~25s Option Hacks</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#0b0d13] border border-[#1c202e] flex items-center gap-1.5 text-[#cbd5e1] font-mono text-[10px]">
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span>Methodical Formula</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#0b0d13] border border-[#1c202e] flex items-center gap-1.5 text-[#cbd5e1] font-mono text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Personal Vault</span>
          </div>
        </div>
      </section>

      {/* Main Upload Zone */}
      <section>
        <UploadZone onSolve={handleSolve} isLoading={isSolving} />

        {/* Actionable Error Alert Banner */}
        {errorMessage && (
          <div className="mt-3 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs font-mono flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <span className="text-red-400 font-bold text-sm leading-none mt-0.5">⚠</span>
              <div className="space-y-0.5">
                <p className="font-semibold text-red-100 font-mono">Solving Interrupted</p>
                <p className="text-red-300 font-sans text-xs">{errorMessage}</p>
                <p className="text-slate-400 font-sans text-[11px] pt-1">
                  Tip: If using an image, ensure text is legible or paste the question text directly into the box.
                </p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-[#161824] border border-[#202434] transition-colors shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Sample Clickers */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-slate-500 font-mono text-[10px] flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" /> Try example:
          </span>
          <button
            onClick={() =>
              loadSampleQuestion(
                "A can complete a work in 12 days and B in 18 days. They work together for 4 days, then A leaves. How many more days will B take? (A) 6 days (B) 8 days (C) 10 days (D) 12 days"
              )
            }
            className="px-2 py-0.5 bg-[#0b0d13] hover:bg-[#131622] text-[#94a3b8] hover:text-[#cbd5e1] rounded text-[10px] font-mono border border-[#181b26] transition-colors"
          >
            Time & Work
          </button>
          <button
            onClick={() =>
              loadSampleQuestion(
                "Find the value of x if (2^x) + (2^(x-1)) + (2^(x-2)) = 112. (A) 5 (B) 6 (C) 7 (D) 8"
              )
            }
            className="px-2 py-0.5 bg-[#0b0d13] hover:bg-[#131622] text-[#94a3b8] hover:text-[#cbd5e1] rounded text-[10px] font-mono border border-[#181b26] transition-colors"
          >
            Indices
          </button>
          <button
            onClick={() =>
              loadSampleQuestion(
                "A shopkeeper marks goods 40% above CP and gives 20% discount. What is profit %? (A) 12% (B) 15% (C) 18% (D) 20%"
              )
            }
            className="px-2 py-0.5 bg-[#0b0d13] hover:bg-[#131622] text-[#94a3b8] hover:text-[#cbd5e1] rounded text-[10px] font-mono border border-[#181b26] transition-colors"
          >
            Profit & Loss
          </button>
        </div>
      </section>

      {/* Active Solved Solution Result */}
      {activeDoubt && (
        <section className="space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-sm font-normal text-[#f1f5f9] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Solved Solution
            </h2>
            <Link
              href="/repository"
              className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Vault</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <SolutionCard
            doubt={activeDoubt}
            onDoubtUpdated={(updated) => setActiveDoubt(updated)}
          />
        </section>
      )}

      {/* Recent Doubts Grid */}
      {recentDoubts.length > 0 && (
        <section className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                Recently Solved
              </h2>
            </div>
            <Link
              href="/repository"
              className="text-xs font-mono text-[#94a3b8] hover:text-white flex items-center gap-1"
            >
              <span>View All ({recentDoubts.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recentDoubts.map((doubt) => {
              const fastestShortcut = doubt.shortcuts?.[0];
              return (
                <Link
                  key={doubt.id}
                  href={`/repository/${doubt.id}`}
                  className="group p-3.5 rounded-lg bg-[#0b0d13] border border-[#1c202e] hover:border-[#282d40] shadow-xs transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.2 bg-[#12141e] text-[#cbd5e1] font-mono text-[9px] rounded border border-[#202535]">
                        {doubt.topic}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {doubt.subtopic}
                      </span>
                    </div>

                    <p className="font-serif text-xs text-[#cbd5e1] line-clamp-2 leading-relaxed font-normal">
                      {doubt.questionText}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-[#181b26] flex items-center justify-between text-xs">
                    {fastestShortcut ? (
                      <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" />
                        {fastestShortcut.technique} (~{fastestShortcut.est_seconds}s)
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-mono">Formula Solution</span>
                    )}

                    <span className="text-slate-500 group-hover:text-[#cbd5e1] text-[10px] font-mono flex items-center gap-0.5 transition-colors">
                      Revisit <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
