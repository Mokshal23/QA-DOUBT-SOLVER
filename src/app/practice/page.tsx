"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Award,
  ArrowRight,
  Check,
  X,
  RotateCcw,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Filter,
  Shuffle,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MathRenderer } from "@/components/MathRenderer";
import { SolutionCard } from "@/components/SolutionCard";

interface AttemptRecord {
  doubtId: string;
  topic: string;
  subtopic: string;
  questionText: string;
  options: string[];
  selectedOption: string | null;
  correctOption: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export function detectCorrectOption(doubt: any): string {
  let opts: string[] = [];
  try {
    opts = Array.isArray(doubt.options) ? doubt.options : JSON.parse(doubt.options || "[]");
  } catch (e) {
    opts = [];
  }

  const fullText = [
    doubt.traditionalSolution,
    doubt.shortcuts,
    doubt.jugaadHack,
    doubt.deepRethinkSolution,
  ]
    .filter(Boolean)
    .join(" ");

  // 1. Check for explicit Option (X) or \mathbf{Option (X)} or \mathbf{(X)}
  const explicitMatches = [
    ...fullText.matchAll(
      /(?:correct option|answer is|matches option|option)\s*:?\s*\\?(?:textbf|mathbf)?\{?\\?(?:text)?\{?\(?([A-D])\)?/gi
    ),
    ...fullText.matchAll(/\\mathbf\{(?:\(?([A-D])\)?)\}/g),
  ];
  if (explicitMatches.length > 0) {
    return explicitMatches[explicitMatches.length - 1][1].toUpperCase();
  }

  // 2. Check for \boxed{...} or \mathbf{...} matching option text
  const boxedMatch = fullText.match(/\\boxed\{([^}]+)\}/);
  if (boxedMatch) {
    const val = boxedMatch[1].trim();
    for (let i = 0; i < opts.length; i++) {
      const optStr = opts[i];
      const optLetter = String.fromCharCode(65 + i);
      const optVal = optStr.replace(/^\([A-D]\)\s*/, "").trim();
      if (optVal.includes(val) || val.includes(optVal)) {
        return optLetter;
      }
    }
  }

  // 3. Fallback: match numeric values in bold
  for (let i = 0; i < opts.length; i++) {
    const optLetter = String.fromCharCode(65 + i);
    const optVal = opts[i].replace(/^\([A-D]\)\s*/, "").replace(/[^0-9a-zA-Z]/g, "").trim();
    if (optVal && fullText.includes(optVal)) {
      if (fullText.includes("\\mathbf{" + optVal + "}")) {
        return optLetter;
      }
    }
  }

  return "A";
}

export default function TimedPracticePage() {
  const [allDoubts, setAllDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill setup state
  const [isDrillActive, setIsDrillActive] = useState(false);
  const [isDrillComplete, setIsDrillComplete] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shouldShuffle, setShouldShuffle] = useState<boolean>(true);

  // Active drill state
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Attempts tracking
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  // Detailed solution review modal
  const [reviewDoubt, setReviewDoubt] = useState<any | null>(null);

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doubts?sortBy=createdAt&sortOrder=desc");
      const data = await res.json();
      if (data.success) {
        setAllDoubts(data.doubts);
      }
    } catch (e) {
      console.error("Failed to load doubts:", e);
    } finally {
      setLoading(false);
    }
  };

  // Timer management
  useEffect(() => {
    if (isDrillActive && !isSubmitted && !isDrillComplete) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDrillActive, isSubmitted, isDrillComplete, currentIndex]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isDrillActive || isDrillComplete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const key = e.key.toUpperCase();
      if (!isSubmitted) {
        if (key === "A" || key === "1") setSelectedOption("A");
        if (key === "B" || key === "2") setSelectedOption("B");
        if (key === "C" || key === "3") setSelectedOption("C");
        if (key === "D" || key === "4") setSelectedOption("D");
        if (e.key === "Enter" && selectedOption) {
          handleSubmitAnswer();
        }
        if (e.key === " " && !selectedOption) {
          e.preventDefault();
          handleRevealWithoutAnswer();
        }
      } else {
        if (e.key === "Enter" || key === "N" || e.key === "ArrowRight") {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrillActive, isSubmitted, isDrillComplete, selectedOption, currentIndex]);

  const startDrill = (customQueue?: any[]) => {
    let filtered = customQueue ? [...customQueue] : [...allDoubts];

    if (!customQueue) {
      if (selectedTopic !== "all") {
        filtered = filtered.filter((d) => d.topic === selectedTopic);
      }
      if (statusFilter === "confused") {
        filtered = filtered.filter((d) => d.userStatus === "still_confused");
      } else if (statusFilter === "mastered") {
        filtered = filtered.filter((d) => d.userStatus === "mastered");
      }
    }

    if (filtered.length === 0) {
      alert("No questions matched your filter. Try selecting 'All Topics' or 'All Questions'.");
      return;
    }

    if (shouldShuffle && !customQueue) {
      filtered.sort(() => Math.random() - 0.5);
    }

    setQueue(filtered);
    setCurrentIndex(0);
    setAttempts([]);
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsRevealed(false);
    setElapsedSeconds(0);
    setIsDrillActive(true);
    setIsDrillComplete(false);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;

    const currentDoubt = queue[currentIndex];
    const correctLetter = detectCorrectOption(currentDoubt);
    const isCorrect = selectedOption.toUpperCase() === correctLetter.toUpperCase();

    if (isCorrect) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    const newAttempt: AttemptRecord = {
      doubtId: currentDoubt.id,
      topic: currentDoubt.topic,
      subtopic: currentDoubt.subtopic,
      questionText: currentDoubt.questionText,
      options: currentDoubt.options,
      selectedOption,
      correctOption: correctLetter,
      isCorrect,
      timeSpentSeconds: elapsedSeconds,
    };

    setAttempts((prev) => [...prev, newAttempt]);
    setIsSubmitted(true);
    setIsRevealed(true);
  };

  const handleRevealWithoutAnswer = () => {
    const currentDoubt = queue[currentIndex];
    const correctLetter = detectCorrectOption(currentDoubt);

    const newAttempt: AttemptRecord = {
      doubtId: currentDoubt.id,
      topic: currentDoubt.topic,
      subtopic: currentDoubt.subtopic,
      questionText: currentDoubt.questionText,
      options: currentDoubt.options,
      selectedOption: null,
      correctOption: correctLetter,
      isCorrect: false,
      timeSpentSeconds: elapsedSeconds,
    };

    setAttempts((prev) => [...prev, newAttempt]);
    setIsSubmitted(true);
    setIsRevealed(true);
  };

  const handleOverrideAccuracy = (markAsCorrect: boolean) => {
    setAttempts((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          isCorrect: markAsCorrect,
        };
      }
      return updated;
    });
  };

  const handleNextQuestion = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setIsRevealed(false);
      setElapsedSeconds(0);
    } else {
      finishDrill();
    }
  };

  const finishDrill = async () => {
    setIsDrillActive(false);
    setIsDrillComplete(true);

    // Persist attempts stats back to database
    if (attempts.length > 0) {
      try {
        await fetch("/api/practice/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attempts }),
        });
      } catch (e) {
        console.error("Error saving practice attempts:", e);
      }
    }
  };

  // Available topics for filtering
  const availableTopics = Array.from(new Set(allDoubts.map((d) => d.topic))).filter(Boolean);

  // Analytics calculations
  const totalAttempted = attempts.length;
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const accuracyPercent = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
  const catScore = correctCount * 3 - (totalAttempted - correctCount) * 1;
  const totalTimeSeconds = attempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0);
  const avgSeconds = totalAttempted > 0 ? Math.round(totalTimeSeconds / totalAttempted) : 0;
  const topperCount = attempts.filter((a) => a.timeSpentSeconds <= 30).length;
  const overtimeCount = attempts.filter((a) => a.timeSpentSeconds > 60).length;

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <div className="inline-block animate-spin w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full mb-2"></div>
        <p className="text-xs font-mono text-slate-500">Loading vault questions...</p>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: DRILL SETUP & LAUNCHPAD
  // ==========================================
  if (!isDrillActive && !isDrillComplete) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121520] border border-[#202535] text-amber-400 font-mono text-xs mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>CAT Quant Timed Drill Simulator</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#f1f5f9] tracking-tight">
            Timed Vault Practice
          </h1>
          <p className="font-sans text-xs sm:text-sm text-slate-400 font-light max-w-lg mx-auto leading-relaxed">
            Practice all questions in your vault under strict CAT exam time pressure (+3 / -1 marking).
            Spot the 10-second topper shortcut before the clock ticks.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#0b0d13] border border-[#1c202e] text-center font-mono">
          <div className="p-2 bg-[#090a0f] rounded-lg border border-[#161822]">
            <span className="text-[10px] text-slate-500 uppercase block">Total in Vault</span>
            <span className="text-lg font-medium text-[#f1f5f9]">{allDoubts.length}</span>
          </div>
          <div className="p-2 bg-[#090a0f] rounded-lg border border-[#161822]">
            <span className="text-[10px] text-amber-400 uppercase block">Still Confused</span>
            <span className="text-lg font-medium text-amber-300">
              {allDoubts.filter((d) => d.userStatus === "still_confused").length}
            </span>
          </div>
          <div className="p-2 bg-[#090a0f] rounded-lg border border-[#161822]">
            <span className="text-[10px] text-emerald-400 uppercase block">Mastered</span>
            <span className="text-lg font-medium text-emerald-300">
              {allDoubts.filter((d) => d.userStatus === "mastered").length}
            </span>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="p-5 rounded-xl bg-[#0b0d13] border border-[#1c202e] space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Configure Practice Session</span>
          </h3>

          <div className="space-y-3">
            {/* Topic Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 block">Filter by Topic:</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedTopic("all")}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    selectedTopic === "all"
                      ? "bg-indigo-900/60 text-indigo-200 border border-indigo-700"
                      : "bg-[#090a0f] text-slate-400 border border-[#1c202e] hover:border-slate-700"
                  }`}
                >
                  All Topics ({allDoubts.length})
                </button>
                {availableTopics.map((topic) => {
                  const count = allDoubts.filter((d) => d.topic === topic).length;
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                        selectedTopic === topic
                          ? "bg-indigo-900/60 text-indigo-200 border border-indigo-700"
                          : "bg-[#090a0f] text-slate-400 border border-[#1c202e] hover:border-slate-700"
                      }`}
                    >
                      {topic} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5 pt-2 border-t border-[#181b26]">
              <label className="text-xs font-mono text-slate-400 block">Question Pool:</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    statusFilter === "all"
                      ? "bg-indigo-900/60 text-indigo-200 border border-indigo-700"
                      : "bg-[#090a0f] text-slate-400 border border-[#1c202e] hover:border-slate-700"
                  }`}
                >
                  All Questions
                </button>
                <button
                  onClick={() => setStatusFilter("confused")}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    statusFilter === "confused"
                      ? "bg-amber-900/60 text-amber-200 border border-amber-700"
                      : "bg-[#090a0f] text-slate-400 border border-[#1c202e] hover:border-slate-700"
                  }`}
                >
                  Still Confused Only ({allDoubts.filter((d) => d.userStatus === "still_confused").length})
                </button>
              </div>
            </div>

            {/* Shuffle Options */}
            <div className="flex items-center justify-between pt-2 border-t border-[#181b26]">
              <div className="flex items-center gap-2">
                <Shuffle className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-mono text-slate-300">Shuffle Question Order</span>
              </div>
              <button
                onClick={() => setShouldShuffle(!shouldShuffle)}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  shouldShuffle ? "bg-indigo-600" : "bg-[#181b26]"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    shouldShuffle ? "left-4.5" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Start CTA */}
          <div className="pt-2">
            <button
              onClick={() => startDrill()}
              className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Timed Drill</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE QUESTION SOLVING
  // ==========================================
  if (isDrillActive && queue.length > 0) {
    const currentDoubt = queue[currentIndex];
    const correctLetter = detectCorrectOption(currentDoubt);

    // Format timer MM:SS
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    // Speed tier coloring
    const isTopperPace = elapsedSeconds <= 30;
    const isTargetPace = elapsedSeconds > 30 && elapsedSeconds <= 60;
    const isOvertime = elapsedSeconds > 60;

    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Active Header & Live Stopwatch */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0b0d13] border border-[#1c202e]">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-[#161924] border border-[#222738] text-[#cbd5e1] font-mono text-xs font-medium">
              Q {currentIndex + 1} of {queue.length}
            </span>
            <span className="text-xs font-mono text-slate-500">
              Score: <strong className={catScore >= 0 ? "text-emerald-400" : "text-red-400"}>{catScore > 0 ? `+${catScore}` : catScore}</strong>
            </span>
            <span className="text-xs font-mono text-slate-500">
              ({correctCount} Correct)
            </span>
          </div>

          {/* Live Stopwatch Clock */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs font-medium transition-all ${
                isTopperPace
                  ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                  : isTargetPace
                  ? "bg-amber-950/40 border-amber-800/60 text-amber-300"
                  : "bg-red-950/40 border-red-800/60 text-red-300 animate-pulse"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="text-sm tracking-wider">{timeFormatted}</span>
              <span className="text-[10px] opacity-80">
                {isTopperPace ? "⚡ Topper Pace" : isTargetPace ? "🎯 Target Pace" : "⏳ Overtime"}
              </span>
            </div>

            <button
              onClick={finishDrill}
              className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-[#10121a] border border-[#1c202d] transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Question Statement Card */}
        <div className="p-5 rounded-xl bg-[#0b0d13] border border-[#1c202e] space-y-4">
          <div className="flex items-center justify-between border-b border-[#181b26] pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#12141e] text-[#cbd5e1] font-mono text-[10px] rounded border border-[#202535]">
                {currentDoubt.topic}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentDoubt.subtopic}
              </span>
            </div>
            {currentDoubt.difficultyEstimate && (
              <span className="px-1.5 py-0.5 bg-[#1a1710] text-amber-400/90 text-[10px] rounded border border-amber-900/40 font-mono">
                {currentDoubt.difficultyEstimate}
              </span>
            )}
          </div>

          <div className="font-serif text-base sm:text-lg text-[#f1f5f9] leading-relaxed">
            <MathRenderer content={currentDoubt.questionText} />
          </div>

          {/* Interactive Options Grid */}
          {currentDoubt.options && currentDoubt.options.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#181b26]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">
                Select Your Option (Press A, B, C, D or 1, 2, 3, 4):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentDoubt.options.map((opt: string, idx: number) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isChosen = selectedOption === letter;
                  const isCorrectAnswer = correctLetter === letter;

                  let cardStyle = "bg-[#090a0f] border-[#181b26] text-[#cbd5e1] hover:border-slate-600 cursor-pointer";

                  if (isSubmitted) {
                    if (isCorrectAnswer) {
                      cardStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium shadow-sm";
                    } else if (isChosen && !isCorrectAnswer) {
                      cardStyle = "bg-red-950/60 border-red-500 text-red-200 line-through opacity-80";
                    } else {
                      cardStyle = "bg-[#090a0f] border-[#181b26] text-slate-500 opacity-50";
                    }
                  } else if (isChosen) {
                    cardStyle = "bg-indigo-950/60 border-indigo-400 text-white font-medium shadow-sm";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => setSelectedOption(letter)}
                      className={`p-3 rounded-lg border text-left text-xs sm:text-sm flex items-start gap-2.5 transition-all ${cardStyle}`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 ${
                          isSubmitted && isCorrectAnswer
                            ? "bg-emerald-600 text-white"
                            : isSubmitted && isChosen && !isCorrectAnswer
                            ? "bg-red-600 text-white"
                            : isChosen
                            ? "bg-indigo-600 text-white"
                            : "bg-[#141724] text-slate-400 border border-[#222738]"
                        }`}
                      >
                        {letter}
                      </span>
                      <div className="flex-1">
                        <MathRenderer content={opt} inline />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Bar (Before Submission) */}
          {!isSubmitted && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#181b26]">
              <button
                onClick={handleRevealWithoutAnswer}
                className="px-3 py-1.5 rounded-lg bg-[#12141e] hover:bg-[#181c2b] text-slate-400 hover:text-white font-mono text-xs border border-[#202535] transition-colors"
                title="Skip and view solution (Hotkey: Space)"
              >
                Skip / Reveal Solution
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-medium transition-all shadow-md disabled:opacity-40 disabled:hover:bg-emerald-600 cursor-pointer flex items-center gap-1.5"
                title="Confirm and check answer (Hotkey: Enter)"
              >
                <span>Submit Answer</span>
                <kbd className="hidden sm:inline text-[9px] bg-emerald-800/60 px-1 py-0.2 rounded text-emerald-200">
                  ↵
                </kbd>
              </button>
            </div>
          )}
        </div>

        {/* Immediate Result Banner & Solution Reveal */}
        {isSubmitted && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Accuracy & Score Callout */}
            {selectedOption === correctLetter ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-mono text-emerald-300 font-medium text-sm block">
                      CORRECT! (+3 Marks)
                    </span>
                    <span className="text-slate-400 text-xs">
                      Option ({correctLetter}) is correct. Time taken:{" "}
                      <strong className="text-emerald-400 font-mono">{elapsedSeconds}s</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOverrideAccuracy(false)}
                    className="text-[11px] font-mono text-slate-400 hover:text-red-300 underline"
                  >
                    Mark as Wrong
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-medium flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                    ✗
                  </div>
                  <div>
                    <span className="font-mono text-red-300 font-medium text-sm block">
                      INCORRECT (-1 Mark)
                    </span>
                    <span className="text-slate-400 text-xs">
                      {selectedOption ? `You chose (${selectedOption}).` : "Skipped."} Correct answer is{" "}
                      <strong className="text-emerald-400 font-mono">Option ({correctLetter})</strong>. Time:{" "}
                      <strong className="text-slate-300 font-mono">{elapsedSeconds}s</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOverrideAccuracy(true)}
                    className="text-[11px] font-mono text-slate-400 hover:text-emerald-300 underline"
                  >
                    Mark as Correct
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-medium flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Complete Solution Card Display */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Topper Shortcuts & Full Mathematical Solution</span>
              </span>
              <SolutionCard doubt={currentDoubt} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 3: SESSION RESULTS & ACCURACY REPORT
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Celebration & Result Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0b0d13] border border-[#1c202e] text-center space-y-3 relative overflow-hidden shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Award className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#f1f5f9] tracking-tight">
          Session Complete!
        </h1>
        <p className="font-sans text-xs sm:text-sm text-slate-400 font-light max-w-md mx-auto">
          Here is your comprehensive CAT Quant speed and accuracy breakdown.
        </p>

        {/* 4 Primary Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <div className="p-3.5 rounded-xl bg-[#080a0f] border border-[#181b26]">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Accuracy</span>
            <span
              className={`text-2xl font-mono font-semibold ${
                accuracyPercent >= 80
                  ? "text-emerald-400"
                  : accuracyPercent >= 60
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {accuracyPercent}%
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">
              {correctCount} / {totalAttempted}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080a0f] border border-[#181b26]">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">CAT Score</span>
            <span
              className={`text-2xl font-mono font-semibold ${
                catScore >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {catScore > 0 ? `+${catScore}` : catScore}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">+3 / -1 Rule</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080a0f] border border-[#181b26]">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Avg Speed</span>
            <span className="text-2xl font-mono font-semibold text-cyan-300">
              {avgSeconds}s
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">Per Question</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080a0f] border border-[#181b26]">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Topper Pace</span>
            <span className="text-2xl font-mono font-semibold text-emerald-300">
              {topperCount}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">Solved in &le;30s</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {attempts.filter((a) => !a.isCorrect).length > 0 && (
            <button
              onClick={() => {
                const incorrectIds = attempts.filter((a) => !a.isCorrect).map((a) => a.doubtId);
                const retryQueue = allDoubts.filter((d) => incorrectIds.includes(d.id));
                startDrill(retryQueue);
              }}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Missed Questions ({attempts.filter((a) => !a.isCorrect).length})</span>
            </button>
          )}

          <button
            onClick={() => startDrill()}
            className="px-4 py-2 rounded-lg bg-[#161924] hover:bg-[#1e2336] text-[#cbd5e1] font-mono text-xs border border-[#222738] transition-colors cursor-pointer"
          >
            Restart Full Drill
          </button>

          <Link
            href="/repository"
            className="px-4 py-2 rounded-lg bg-[#10121a] hover:bg-[#161824] text-slate-400 hover:text-white font-mono text-xs border border-[#1c202d] transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Vault</span>
          </Link>
        </div>
      </div>

      {/* Question-by-Question Attempt Review Table */}
      <div className="p-5 rounded-xl bg-[#0b0d13] border border-[#1c202e] space-y-3">
        <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400">
          Question Review & Solution Breakdown
        </h3>

        <div className="divide-y divide-[#181b26] overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Topic</th>
                <th className="py-2 px-2">Your Ans</th>
                <th className="py-2 px-2">Correct</th>
                <th className="py-2 px-2">Time</th>
                <th className="py-2 px-2">Result</th>
                <th className="py-2 px-2 text-right">Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141620]">
              {attempts.map((attempt, idx) => {
                const doubt = allDoubts.find((d) => d.id === attempt.doubtId);
                return (
                  <tr key={idx} className="hover:bg-[#0e1017] transition-colors">
                    <td className="py-2.5 px-2 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-2">
                      <span className="text-[#cbd5e1] block">{attempt.topic}</span>
                      <span className="text-[10px] text-slate-500">{attempt.subtopic}</span>
                    </td>
                    <td className="py-2.5 px-2">
                      {attempt.selectedOption ? (
                        <span
                          className={`font-semibold ${
                            attempt.isCorrect ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          ({attempt.selectedOption})
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Skipped</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-emerald-400 font-semibold">
                      ({attempt.correctOption})
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className={
                          attempt.timeSpentSeconds <= 30
                            ? "text-emerald-400"
                            : attempt.timeSpentSeconds <= 60
                            ? "text-amber-400"
                            : "text-red-400"
                        }
                      >
                        {attempt.timeSpentSeconds}s
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      {attempt.isCorrect ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 text-[10px]">
                          +3 Correct
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40 text-[10px]">
                          -1 Wrong
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      {doubt && (
                        <button
                          onClick={() => setReviewDoubt(doubt)}
                          className="px-2 py-1 rounded bg-[#12141e] hover:bg-[#181d2b] text-indigo-300 text-[10px] border border-[#202535] transition-colors cursor-pointer"
                        >
                          View Solution
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal for Individual Solution */}
      {reviewDoubt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0d13] border border-[#1c202e] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-2 border-b border-[#181b26]">
              <span className="font-mono text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Solution Review</span>
              </span>
              <button
                onClick={() => setReviewDoubt(null)}
                className="w-7 h-7 rounded-lg bg-[#12141e] hover:bg-[#181c2b] text-slate-400 hover:text-white flex items-center justify-center text-sm font-mono border border-[#202535] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <SolutionCard doubt={reviewDoubt} />
          </div>
        </div>
      )}
    </div>
  );
}
