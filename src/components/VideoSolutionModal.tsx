"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  GraduationCap,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MathRenderer } from "./MathRenderer";

export interface Shortcut {
  technique: string;
  worked_solution: string;
  est_seconds: number;
  why_fast?: string;
}

export interface JugaadHack {
  name: string;
  trick_type: string;
  worked_steps: string;
  est_seconds: number;
  why_it_works: string;
}

export interface VideoDoubtData {
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
  shortcuts?: Shortcut[];
  optionTraps?: string;
  calcVerdict?: string;
  selfCheckNote?: string;
}

interface TeacherVideoScript {
  problem_logic: string;
  intuition_logic: string;
  shortcut_logic: string;
  traditional_logic: string;
  traps_logic: string;
}

interface VideoScene {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  spokenText: string;
  renderContent: () => React.ReactNode;
}

interface VideoSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  doubt: VideoDoubtData;
}

// Helper to convert math/markdown text into natural spoken narration
function cleanTextForSpeech(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italics
    .replace(/`([^`]+)`/g, "$1") // code
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 over $2") // fraction
    .replace(/\\sqrt\{([^}]+)\}/g, "square root of $1") // sqrt
    .replace(/\^2\b/g, " squared")
    .replace(/\^3\b/g, " cubed")
    .replace(/\^(\d+)/g, " to the power of $1")
    .replace(/\\times|\\cdot/g, " times ")
    .replace(/\\div/g, " divided by ")
    .replace(/\\pm/g, " plus or minus ")
    .replace(/\\approx/g, " approximately ")
    .replace(/\\leq/g, " less than or equal to ")
    .replace(/\\geq/g, " greater than or equal to ")
    .replace(/\\neq/g, " not equal to ")
    .replace(/\\implies/g, " which implies that ")
    .replace(/\\pi\b/g, " pi ")
    .replace(/\\theta\b/g, " theta ")
    .replace(/\\sum/g, " sum ")
    .replace(/\\infty/g, " infinity ")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\mathit\{([^}]+)\}/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/\\/g, "")
    .replace(/\$/g, "")
    .replace(/#/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function VideoSolutionModal({
  isOpen,
  onClose,
  doubt,
}: VideoSolutionModalProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [narrationMode, setNarrationMode] = useState<"mentor" | "summary">("mentor");
  const [teacherScript, setTeacherScript] = useState<TeacherVideoScript | null>(null);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch deep teacher pedagogical script explaining the underlying logic
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingScript(true);

    fetch("/api/video-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doubtId: doubt.id,
        questionText: doubt.questionText,
        topic: doubt.topic,
        subtopic: doubt.subtopic,
        coreIntuition: doubt.coreIntuition,
        jugaadHack: doubt.jugaadHack,
        traditionalSolution: doubt.traditionalSolution,
        shortcuts: doubt.shortcuts,
        optionTraps: doubt.optionTraps,
        calcVerdict: doubt.calcVerdict,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.script) {
          setTeacherScript(data.script);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch teacher script, using local fallback:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingScript(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, doubt]);

  // Build dynamic scenes based on available solution fields and mentor commentary
  const scenes: VideoScene[] = useMemo(() => {
    const list: VideoScene[] = [];

    // Scene 1: Problem Breakdown & Setup
    const problemNarration =
      narrationMode === "mentor" && teacherScript?.problem_logic
        ? teacherScript.problem_logic
        : `Let's examine this problem in ${doubt.topic}, ${doubt.subtopic}. Notice the key quantities given. Rather than rushing into tedious algebra, let's understand what the question is really testing.`;

    list.push({
      id: "problem",
      badge: "Step 1: Tactical Setup",
      badgeColor: "bg-blue-900/60 text-blue-300 border-blue-700/50",
      title: "Problem Framing & What's Given",
      subtitle: `${doubt.topic} • ${doubt.subtopic}`,
      icon: BookOpen,
      spokenText: cleanTextForSpeech(problemNarration),
      renderContent: () => (
        <div className="space-y-3.5 max-w-2xl mx-auto">
          {/* Mentor Logic Callout */}
          <div className="p-3.5 rounded-xl bg-[#0b1424] border border-blue-800/60 shadow-md">
            <div className="flex items-center gap-2 text-blue-300 font-mono text-xs mb-1.5">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span className="font-semibold uppercase tracking-wider">
                Mentor's Tactical Angle (What to spot first)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100/90 font-sans leading-relaxed">
              {teacherScript?.problem_logic ||
                `Notice what this problem is really asking. Before writing variables, observe the relationship between the numbers to prevent unnecessary algebraic expansion.`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e121d] border border-blue-900/40 shadow-inner">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              Problem Statement
            </h4>
            <div className="text-sm sm:text-base text-slate-100 font-serif leading-relaxed">
              <MathRenderer content={doubt.questionText} />
            </div>
          </div>

          {doubt.options && doubt.options.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {doubt.options.map((opt, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-[#0b0e17] border border-[#1e2638] text-xs text-slate-300 flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded bg-blue-950/80 border border-blue-800/40 text-blue-300 font-mono text-[10px] flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <div className="truncate">
                    <MathRenderer content={opt} inline />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    });

    // Scene 2: Mental Model & Core Intuition
    if (doubt.coreIntuition || doubt.patternTrigger || teacherScript?.intuition_logic) {
      const intuitionNarration =
        narrationMode === "mentor" && teacherScript?.intuition_logic
          ? teacherScript.intuition_logic
          : doubt.coreIntuition
          ? `Here is the fundamental intuition. ${doubt.coreIntuition}. When you visualize the problem this way, the equations become intuitive rather than something to memorize.`
          : `Recognize the underlying pattern trigger before calculating.`;

      list.push({
        id: "intuition",
        badge: "Step 2: Mental Model",
        badgeColor: "bg-amber-900/60 text-amber-300 border-amber-700/50",
        title: "The Core Intuition & 'Aha!' Moment",
        subtitle: "How high scorers visualize the solution without panic",
        icon: Lightbulb,
        spokenText: cleanTextForSpeech(intuitionNarration),
        renderContent: () => (
          <div className="space-y-3.5 max-w-2xl mx-auto">
            {/* Mentor Intuition Explanation */}
            <div className="p-4 rounded-xl bg-[#17140c] border border-amber-700/60 shadow-md">
              <div className="flex items-center gap-2 text-amber-300 font-mono text-xs mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-semibold uppercase tracking-wider">
                  Mentor's Explanation of the Logic
                </span>
              </div>
              <p className="text-sm sm:text-base text-amber-100/95 font-sans leading-relaxed">
                {teacherScript?.intuition_logic ||
                  doubt.coreIntuition ||
                  "Think of the quantities conceptually. When two constraints act together, their net impact is governed by the structural ratio rather than independent calculations."}
              </p>
            </div>

            {doubt.coreIntuition && (
              <div className="p-3.5 rounded-xl bg-[#10121a] border border-[#202738] text-xs">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Formulaic Core Concept:
                </span>
                <div className="text-slate-200 font-light leading-relaxed">
                  <MathRenderer content={doubt.coreIntuition} />
                </div>
              </div>
            )}

            {doubt.patternTrigger && (
              <div className="p-3 rounded-xl bg-[#0d101a] border border-indigo-900/50 flex items-start gap-2.5 text-xs">
                <Target className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-mono text-[10px] text-indigo-300 uppercase tracking-wider block mb-0.5">
                    5-Second Exam Pattern Trigger
                  </span>
                  <div className="text-slate-300 font-light leading-relaxed">
                    <MathRenderer content={doubt.patternTrigger} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ),
      });
    }

    // Scene 3: Speed Shortcut & Zero-Formula Jugaad
    if (doubt.jugaadHack || (doubt.shortcuts && doubt.shortcuts.length > 0) || teacherScript?.shortcut_logic) {
      const hack = doubt.jugaadHack;
      const primaryShortcut = doubt.shortcuts?.[0];
      const title = hack?.name || primaryShortcut?.technique || "25-Second Speed Technique";
      const steps = hack?.worked_steps || primaryShortcut?.worked_solution || "";
      const seconds = hack?.est_seconds || primaryShortcut?.est_seconds || 20;

      const shortcutNarration =
        narrationMode === "mentor" && teacherScript?.shortcut_logic
          ? teacherScript.shortcut_logic
          : `Watch the speed shortcut. Instead of tedious calculations, notice what happens when we substitute or eliminate options. The complicated terms cancel out, giving you the answer in seconds.`;

      list.push({
        id: "shortcut",
        badge: `Step 3: ≈${seconds}s Speed Hack`,
        badgeColor: "bg-emerald-900/60 text-emerald-300 border-emerald-700/50",
        title: title,
        subtitle: "Zero-formula shortcut & option elimination",
        icon: Zap,
        spokenText: cleanTextForSpeech(shortcutNarration),
        renderContent: () => (
          <div className="space-y-3.5 max-w-2xl mx-auto">
            {/* Why the shortcut works conceptually */}
            <div className="p-3.5 rounded-xl bg-[#0a1811] border border-emerald-700/60 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs">
                  <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="font-bold text-sm sm:text-base text-emerald-200">
                    Why This Shortcut Bypasses the Algebra
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#10291f] text-emerald-300 border border-emerald-700/50 font-mono text-[10px]">
                  ⏱️ ≈{seconds}s
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-sans leading-relaxed">
                {teacherScript?.shortcut_logic ||
                  hack?.why_it_works ||
                  primaryShortcut?.why_fast ||
                  "By recognizing symmetry or substituting simple integer values, the algebraic expressions cancel out without needing formal expansion."}
              </p>
            </div>

            {/* Rough sheet worked steps */}
            {steps && (
              <div className="p-4 rounded-xl bg-[#070e17] border border-emerald-900/40 text-xs sm:text-sm text-slate-100 font-sans">
                <span className="font-mono text-[10px] text-emerald-400/90 uppercase tracking-wider block mb-2">
                  Minimal Rough Sheet Calculation:
                </span>
                <div className="pl-3 border-l-2 border-emerald-500/50 leading-relaxed">
                  <MathRenderer content={steps} />
                </div>
              </div>
            )}
          </div>
        ),
      });
    }

    // Scene 4: Traditional Algebraic Derivation
    const traditionalNarration =
      narrationMode === "mentor" && teacherScript?.traditional_logic
        ? teacherScript.traditional_logic
        : `Here is what is happening under the hood in the formal derivation. Notice why we eliminate denominators first, rearrange terms into standard form, and discard extraneous negative roots.`;

    list.push({
      id: "traditional",
      badge: "Step 4: Formal Derivation",
      badgeColor: "bg-cyan-900/60 text-cyan-300 border-cyan-700/50",
      title: "Step-by-Step Formal Proof",
      subtitle: "Why each algebraic move is chosen",
      icon: CheckCircle,
      spokenText: cleanTextForSpeech(traditionalNarration),
      renderContent: () => (
        <div className="space-y-3 max-w-2xl mx-auto">
          {/* Mentor Logic behind algebraic steps */}
          <div className="p-3.5 rounded-xl bg-[#09151e] border border-cyan-700/60 shadow-md">
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs mb-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold uppercase tracking-wider">
                Mentor's Commentary on the Math
              </span>
            </div>
            <p className="text-xs sm:text-sm text-cyan-100/90 font-sans leading-relaxed">
              {teacherScript?.traditional_logic ||
                "In formal textbook algebra, our first goal is always to clear fractions. Next, we group like terms to form a solvable polynomial. Finally, reject non-physical roots."}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090d14] border border-cyan-900/40 shadow-inner">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Mathematical Derivation
            </h4>
            <div className="text-sm sm:text-base text-slate-100 font-serif leading-relaxed max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
              <MathRenderer content={doubt.traditionalSolution} />
            </div>
          </div>
        </div>
      ),
    });

    // Scene 5: Option Traps & Examiner Psychology
    const trapsNarration =
      narrationMode === "mentor" && teacherScript?.traps_logic
        ? teacherScript.traps_logic
        : doubt.optionTraps
        ? `Here is the psychological trap in the options. ${doubt.optionTraps}. The examiner calculates common student oversights and includes them in the choices.`
        : `Always re-verify what the question specifically asked for before submitting your answer.`;

    list.push({
      id: "takeaway",
      badge: "Final Step: Exam Traps",
      badgeColor: "bg-purple-900/60 text-purple-300 border-purple-700/50",
      title: "Examiner's Mindset & Traps",
      subtitle: "How question setters trick students into losing marks",
      icon: AlertTriangle,
      spokenText: cleanTextForSpeech(trapsNarration),
      renderContent: () => (
        <div className="space-y-3 max-w-2xl mx-auto">
          {/* Examiner's Trap Psychology */}
          <div className="p-4 rounded-xl bg-[#190f1d] border border-purple-700/60 shadow-md">
            <div className="flex items-center gap-2 text-purple-300 font-mono font-semibold mb-2">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span>Examiner's Psychology & Trap Options</span>
            </div>
            <p className="text-xs sm:text-sm text-purple-100/95 font-sans leading-relaxed">
              {teacherScript?.traps_logic ||
                doubt.optionTraps ||
                "Question setters purposely include partial answers—like solving for x when the question asks for 2x + 1. Double check the final target before marking."}
            </p>
          </div>

          {doubt.optionTraps && (
            <div className="p-3 rounded-xl bg-[#110b14] border border-purple-900/40 text-xs text-purple-200">
              <span className="font-mono text-[10px] text-purple-400 uppercase tracking-wider block mb-1">
                Specific Trap Alert:
              </span>
              <div className="text-slate-300 leading-relaxed font-sans">
                <MathRenderer content={doubt.optionTraps} />
              </div>
            </div>
          )}

          {doubt.calcVerdict && (
            <div className="px-3 py-2 rounded-lg bg-[#0d161a] border border-cyan-800/40 font-mono text-xs text-cyan-300 flex items-center justify-between">
              <span>⚖️ <strong>Calculator Verdict:</strong> {doubt.calcVerdict}</span>
              <span className="text-[10px] text-slate-400">Time-saving metric</span>
            </div>
          )}
        </div>
      ),
    });

    return list;
  }, [doubt, teacherScript, narrationMode]);

  // Load available neural voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        const preferred =
          voices.find(
            (v) =>
              (v.name.includes("Natural") ||
                v.name.includes("Online") ||
                v.name.includes("Google US") ||
                v.name.includes("Samantha") ||
                v.name.includes("Daniel")) &&
              v.lang.startsWith("en")
          ) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
        setSelectedVoice(preferred);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Stop speech when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setCurrentSceneIndex(0);
    }
  }, [isOpen]);

  // Handle scene speech playback
  const speakCurrentScene = (index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    if (isMuted || index >= scenes.length) return;

    const scene = scenes[index];
    if (!scene || !scene.spokenText) return;

    const utterance = new SpeechSynthesisUtterance(scene.spokenText);
    utterance.rate = speechRate;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      if (index + 1 < scenes.length) {
        setCurrentSceneIndex(index + 1);
      } else {
        setIsPlaying(false);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error or cancelled:", e);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Trigger speech whenever scene, playback state, or teacher script changes
  useEffect(() => {
    if (isOpen && isPlaying) {
      speakCurrentScene(currentSceneIndex);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [currentSceneIndex, isPlaying, isMuted, speechRate, isOpen, teacherScript, narrationMode]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextScene();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevScene();
      } else if (e.key.toLowerCase() === "m") {
        setIsMuted((prev) => !prev);
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentSceneIndex, isPlaying, scenes.length]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNextScene = () => {
    if (currentSceneIndex + 1 < scenes.length) {
      setCurrentSceneIndex((prev) => prev + 1);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentSceneIndex(0);
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  const currentScene = scenes[currentSceneIndex] || scenes[0];
  const Icon = currentScene.icon;
  const progressPercent = ((currentSceneIndex + 1) / scenes.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className={`relative w-full max-w-5xl bg-[#080a10] border border-[#1d2436] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isFullscreen ? "h-screen max-w-none rounded-none border-none" : "max-h-[94vh]"
        }`}
      >
        {/* Top Video Header Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0c101a] border-b border-[#182033] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 truncate">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/50 text-purple-300 font-mono text-xs">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold tracking-wide">AI Math Mentor</span>
            </div>

            {/* Mentor Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-lg bg-[#121826] border border-[#20293d] p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setNarrationMode("mentor")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  narrationMode === "mentor"
                    ? "bg-purple-600 text-white font-bold shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Explains the deep logic, reasoning, and why steps work"
              >
                👨‍🏫 Mentor Logic
              </button>
              <button
                onClick={() => setNarrationMode("summary")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  narrationMode === "summary"
                    ? "bg-slate-700 text-white font-bold shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Concise direct step summary"
              >
                ⚡ Quick Steps
              </button>
            </div>

            {isLoadingScript && (
              <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Crafting logic explanation...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Speed Picker */}
            <div className="flex items-center rounded-lg bg-[#121826] border border-[#20293d] p-0.5 text-[11px] font-mono">
              {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSpeechRate(rate)}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    speechRate === rate
                      ? "bg-purple-600 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title={`Voice speed ${rate}x`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-[#121826] hover:bg-[#1b2338] border border-[#20293d] text-slate-300 transition-colors cursor-pointer"
              title={isMuted ? "Unmute Voice (Hotkey: M)" : "Mute Voice (Hotkey: M)"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-[#121826] hover:bg-[#1b2338] border border-[#20293d] text-slate-300 transition-colors hidden sm:inline-flex cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen (Hotkey: F)" : "Fullscreen (Hotkey: F)"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#121826] hover:bg-red-950/60 border border-[#20293d] text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
              title="Close Player (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chalkboard Video Stage (16:9 Aspect Ratio / Flex Fill) */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[480px] p-4 sm:p-7 flex flex-col justify-between overflow-y-auto bg-[radial-gradient(#141d2e_1px,transparent_1px)] [background-size:24px_24px] bg-[#07090f]">
          {/* Scene Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#141a29]">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${currentScene.badgeColor} border`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${currentScene.badgeColor}`}>
                    {currentScene.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Scene {currentSceneIndex + 1} of {scenes.length}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                  {currentScene.title}
                </h3>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-[11px] font-mono text-slate-400">
                {currentScene.subtitle}
              </span>
            </div>
          </div>

          {/* Animated Center Canvas Content */}
          <div className="flex-1 flex items-center justify-center my-auto py-2">
            <div className="w-full transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
              {currentScene.renderContent()}
            </div>
          </div>

          {/* Real-Time Live Mentor Narration Subtitle Box */}
          <div className="mt-3.5 p-3 rounded-xl bg-[#090d16]/95 border border-[#1a2338] shadow-lg backdrop-blur-xs flex items-start gap-3">
            <div className="relative flex items-center justify-center w-6 h-6 shrink-0 mt-0.5">
              <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-purple-400 animate-ping" : "bg-slate-500"}`} />
              <div className={`absolute w-2 h-2 rounded-full ${isPlaying ? "bg-purple-400" : "bg-slate-400"}`} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 block mb-0.5">
                👨‍🏫 Mentor Voiceover (Explaining Logic):
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed italic">
                &ldquo;{currentScene.spokenText}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Video Player Timeline & Controls Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#0a0d16] border-t border-[#161c2c] space-y-2.5">
          {/* Progress Bar & Scene Markers */}
          <div className="relative w-full h-1.5 bg-[#141b2b] rounded-full overflow-hidden cursor-pointer group">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Interactive Scene Jump Pills */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-0.5">
            {scenes.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  setCurrentSceneIndex(idx);
                  setIsPlaying(true);
                }}
                className={`px-2 py-1 rounded text-[10px] font-mono truncate text-left transition-all cursor-pointer ${
                  currentSceneIndex === idx
                    ? "bg-purple-950/80 border border-purple-600 text-purple-200 font-semibold"
                    : "bg-[#0e1320] border border-[#182133] text-slate-400 hover:text-slate-200"
                }`}
                title={scene.title}
              >
                {idx + 1}. {scene.title.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRestart}
                className="p-2 rounded-lg bg-[#111724] hover:bg-[#1a2336] text-slate-300 transition-colors cursor-pointer"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrevScene}
                disabled={currentSceneIndex === 0}
                className="p-2 rounded-lg bg-[#111724] hover:bg-[#1a2336] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous Scene (Left Arrow)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Main Play / Pause Button */}
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold shadow-md transition-all cursor-pointer"
                title="Play/Pause (Spacebar)"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Explain Logic</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextScene}
                disabled={currentSceneIndex + 1 >= scenes.length}
                className="p-2 rounded-lg bg-[#111724] hover:bg-[#1a2336] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next Scene (Right Arrow)"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Hotkey hint */}
            <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-500">
              <span>Space: Play/Pause</span>
              <span>•</span>
              <span>← / → : Scenes</span>
              <span>•</span>
              <span>M : Mute</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
