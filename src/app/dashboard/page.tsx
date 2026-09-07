"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Award,
  BookOpen,
  ArrowRight,
  Flame,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <div className="inline-block animate-spin w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full mb-2"></div>
        <p className="text-xs font-mono text-slate-500">Loading diagnostic analytics...</p>
      </div>
    );
  }

  const { totalDoubts, statusCounts, topicCounts, mistakeCounts, weakTopics } = stats || {
    totalDoubts: 0,
    statusCounts: {},
    topicCounts: {},
    mistakeCounts: {},
    weakTopics: [],
  };

  const highestPriorityTopic = weakTopics?.[0];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#10121a] text-[#94a3b8] font-mono text-[10px] border border-[#1c202d] mb-1.5">
          <BarChart3 className="w-3 h-3" />
          <span>Diagnostic Prep Engine</span>
        </div>
        <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#f1f5f9]">
          Weak-Area Diagnostic Dashboard
        </h1>
        <p className="font-sans text-xs text-[#94a3b8] font-light mt-0.5">
          Real-time analysis of your doubt patterns, mistake causes, and prep priorities.
        </p>
      </div>

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-lg bg-[#0b0d13] border border-[#1c202e] space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500">Total Doubts</span>
          <div className="text-xl sm:text-2xl font-bold text-[#f1f5f9] font-mono">
            {totalDoubts}
          </div>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-indigo-400" /> 5 QA Modules
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0b0d13] border border-[#1c202e] space-y-1">
          <span className="text-[10px] font-mono uppercase text-red-400">Still Confused</span>
          <div className="text-xl sm:text-2xl font-bold text-red-300 font-mono">
            {statusCounts.still_confused || 0}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Needs revision</span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0b0d13] border border-[#1c202e] space-y-1">
          <span className="text-[10px] font-mono uppercase text-amber-400">Understood</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">
            {statusCounts.understood || 0}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Ready for recall</span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0b0d13] border border-[#1c202e] space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-400">Mastered (~30s)</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-300 font-mono">
            {statusCounts.mastered || 0}
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
            <Award className="w-3 h-3" /> Exam ready
          </span>
        </div>
      </div>

      {totalDoubts === 0 ? (
        <div className="p-10 text-center rounded-xl bg-[#0b0d13] border border-[#1c202e] space-y-2.5">
          <BarChart3 className="w-7 h-7 text-slate-600 mx-auto" />
          <h3 className="font-serif text-sm text-[#f1f5f9]">No Diagnostic Data Yet</h3>
          <p className="font-sans text-xs text-slate-500 max-w-sm mx-auto font-light">
            Once you start solving and tagging doubts, this dashboard will automatically generate weak-area charts and study priorities.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#181c2b] text-white font-mono text-xs rounded border border-[#2e354e]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Solve Your First Doubt</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Actionable Topper Priority Insight Alert */}
          {highestPriorityTopic && highestPriorityTopic.weaknessScore > 0 && (
            <div className="p-4 rounded-xl bg-[#0e1017] border border-[#202535] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[9px] uppercase tracking-wider">
                  <Flame className="w-3 h-3" />
                  <span>Recommended Focus</span>
                </div>
                <h3 className="font-serif text-sm font-normal text-[#f1f5f9]">
                  Deep-Dive into {highestPriorityTopic.topic}
                </h3>
                <p className="font-sans text-xs text-[#94a3b8] font-light max-w-xl">
                  You have {highestPriorityTopic.still_confused} unresolved and {highestPriorityTopic.understood} in-progress doubts in this area.
                </p>
              </div>

              <Link
                href={`/repository?topic=${encodeURIComponent(highestPriorityTopic.topic)}`}
                className="px-3 py-1.5 bg-[#181c2b] hover:bg-[#202638] text-white font-mono text-xs rounded border border-[#2e354e] flex items-center gap-1 shrink-0 self-start sm:self-center"
              >
                <span>Practice Topic</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Charts & Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Topic Breakdown */}
            <div className="lg:col-span-2 p-4 rounded-xl bg-[#0b0d13] border border-[#1c202e] space-y-3.5">
              <div>
                <h3 className="font-serif text-sm font-normal text-[#f1f5f9]">
                  Doubts Logged Per Topic
                </h3>
                <p className="font-sans text-[11px] text-slate-500 font-light">Distribution across CAT Quant areas</p>
              </div>

              <div className="space-y-3">
                {Object.entries(topicCounts).map(([topicName, data]: any) => {
                  const total = data.total || 0;
                  const masteredPct = total > 0 ? Math.round((data.mastered / total) * 100) : 0;
                  const understoodPct = total > 0 ? Math.round((data.understood / total) * 100) : 0;
                  const confusedPct = total > 0 ? Math.round((data.still_confused / total) * 100) : 0;

                  return (
                    <div key={topicName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-sans text-xs text-[#cbd5e1]">
                          {topicName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {total} ({masteredPct}% mastered)
                        </span>
                      </div>

                      <div className="h-2 w-full bg-[#090a0f] rounded-full overflow-hidden flex border border-[#181b26]">
                        <div
                          style={{ width: `${masteredPct}%` }}
                          className="bg-emerald-400 h-full transition-all"
                        />
                        <div
                          style={{ width: `${understoodPct}%` }}
                          className="bg-amber-400 h-full transition-all"
                        />
                        <div
                          style={{ width: `${confusedPct}%` }}
                          className="bg-red-400 h-full transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Minimal Legend */}
              <div className="flex items-center justify-center gap-4 pt-2 border-t border-[#181b26] text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-400">Mastered</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="text-slate-400">Understood</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  <span className="text-slate-400">Still Confused</span>
                </div>
              </div>
            </div>

            {/* Mistake Root Causes */}
            <div className="p-4 rounded-xl bg-[#0b0d13] border border-[#1c202e] space-y-3">
              <div>
                <h3 className="font-serif text-sm font-normal text-[#f1f5f9]">
                  Mistake Causes
                </h3>
                <p className="font-sans text-[11px] text-slate-500 font-light">Root causes of logged doubts</p>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded bg-[#090a0f] border border-[#181b26] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-red-300 font-sans">Concept Gap</div>
                    <div className="text-[9px] text-slate-500 font-mono">Review fundamentals</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-300">
                    {mistakeCounts.concept_gap || 0}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#090a0f] border border-[#181b26] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-amber-300 font-sans">Calculation Slip</div>
                    <div className="text-[9px] text-slate-500 font-mono">Rough sheet discipline</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {mistakeCounts.calculation_slip || 0}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#090a0f] border border-[#181b26] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-indigo-300 font-sans">Ran Out of Time</div>
                    <div className="text-[9px] text-slate-500 font-mono">Backsolve first</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {mistakeCounts.ran_out_of_time || 0}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#090a0f] border border-[#181b26] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#cbd5e1] font-sans">Option Misread</div>
                    <div className="text-[9px] text-slate-500 font-mono">Target confirmation</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#cbd5e1]">
                    {mistakeCounts.option_misread || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
