"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Eye, Volume2, VolumeX, Flame } from "lucide-react";

interface RecallTimerProps {
  initialSeconds?: number;
  onReveal: () => void;
  isRevealed: boolean;
}

export function RecallTimer({
  initialSeconds = 45,
  onReveal,
  isRevealed,
}: RecallTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play soft synthesized bell chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio chime not supported:", e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!isRevealed) {
          onReveal();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRevealed, onReveal]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0 && !isRevealed) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playChime();
            onReveal();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isRevealed]);

  const handleReset = (sec = initialSeconds) => {
    setTimeLeft(sec);
    setIsRunning(true);
  };

  const progressPct = ((initialSeconds - timeLeft) / initialSeconds) * 100;
  const isUrgent = timeLeft <= 10 && timeLeft > 0;

  return (
    <div className="p-3.5 sm:p-4 bg-[#0b0d13] text-[#cbd5e1] rounded-xl border border-[#1c202e] shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-[#1a1710] text-amber-400 rounded border border-amber-900/40">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-serif text-xs sm:text-sm font-normal text-[#f1f5f9]">Timed Practice / Recall Mode</h3>
            <p className="text-[10px] font-mono text-slate-500">Recall shortcut mentally before solution reveals</p>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1 rounded bg-[#090a0f] text-slate-400 hover:text-white text-xs border border-[#181b26]"
          title={soundEnabled ? "Mute Sound" : "Enable Sound"}
        >
          {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3 text-slate-600" />}
        </button>
      </div>

      {/* Countdown Ring & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-2.5 rounded-lg bg-[#090a0f] border border-[#181b26]">
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-[#181b26]"
                fill="none"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="100.5"
                strokeDashoffset={100.5 - (100.5 * progressPct) / 100}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${
                  isUrgent ? "text-red-400" : "text-amber-400"
                }`}
                fill="none"
              />
            </svg>
            <span
              className={`absolute font-bold text-xs font-mono ${
                isUrgent ? "text-red-400" : "text-[#f1f5f9]"
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          <div>
            <div className="text-[9px] text-slate-500 font-mono">Exam Target:</div>
            <div className="text-xs font-serif text-[#cbd5e1]">
              {timeLeft > 0 ? "Identify shortcut approach..." : "Time's up! Check solution"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {!isRevealed && (
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-1.5 bg-[#12141e] hover:bg-[#181d2b] rounded text-slate-300 transition-colors border border-[#202535]"
              title={isRunning ? "Pause" : "Resume"}
            >
              {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          )}

          <button
            onClick={() => handleReset(initialSeconds)}
            className="p-1.5 bg-[#12141e] hover:bg-[#181d2b] rounded text-slate-300 transition-colors border border-[#202535]"
            title="Reset Timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {!isRevealed && (
            <button
              onClick={onReveal}
              className="px-2.5 py-1 bg-[#181c2b] hover:bg-[#202638] text-white font-mono text-xs rounded border border-[#2e354e] flex items-center gap-1 shadow-xs"
            >
              <Eye className="w-3 h-3" />
              <span>Reveal (Space)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
