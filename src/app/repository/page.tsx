"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Filter,
  Zap,
  HelpCircle,
  CheckCircle2,
  Award,
  Download,
  ArrowUpDown,
  Plus,
} from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";

export default function RepositoryPage() {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMistake, setSelectedMistake] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const topics = [
    "All Topics",
    "Arithmetic",
    "Algebra",
    "Geometry & Mensuration",
    "Number Systems",
    "Modern Math",
  ];

  useEffect(() => {
    fetchDoubts();
  }, [selectedTopic, selectedStatus, selectedMistake, selectedDifficulty, sortBy, sortOrder]);

  const fetchDoubts = async (query = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("search", query);
      if (selectedTopic !== "all" && selectedTopic !== "All Topics") params.append("topic", selectedTopic);
      if (selectedStatus !== "all") params.append("userStatus", selectedStatus);
      if (selectedMistake !== "all") params.append("mistakeTag", selectedMistake);
      if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await fetch(`/api/doubts?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDoubts(data.doubts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoubts(search);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#f1f5f9] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Doubt Vault</span>
          </h1>
          <p className="font-sans text-xs text-[#94a3b8] font-light mt-0.5">
            Your personal searchable repository of solved CAT Quant doubts and shortcuts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/practice"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-amber-300 bg-[#16130b] border border-amber-800/60 rounded-md hover:bg-[#221c10] transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Timed Practice</span>
          </Link>
          {doubts.length > 0 && (
            <a
              href={`/api/export?topic=${selectedTopic}&status=${selectedStatus}`}
              download
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#cbd5e1] bg-[#10121a] border border-[#1c202d] rounded-md hover:bg-[#161924] transition-colors"
            >
              <Download className="w-3 h-3 text-indigo-400" />
              <span>Export ({doubts.length})</span>
            </a>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 bg-[#0b0d13] border border-[#1c202e] rounded-xl space-y-3">
        {/* Search Query Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords, formulas, notes, or shortcut techniques..."
            className="w-full pl-8 pr-16 py-1.5 text-xs bg-[#090a0f] border border-[#181b26] rounded-lg focus:outline-none focus:border-[#2e354e] text-[#cbd5e1] placeholder-slate-600 font-sans"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-0.5 bg-[#181c2b] hover:bg-[#202638] text-white font-mono text-[11px] rounded border border-[#2e354e]"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Topic:
          </span>
          {topics.map((t) => {
            const isSelected =
              (t === "All Topics" && selectedTopic === "all") || selectedTopic === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedTopic(t === "All Topics" ? "all" : t)}
                className={`px-2 py-0.5 rounded text-[11px] font-normal transition-all ${
                  isSelected
                    ? "bg-[#161924] text-[#f1f5f9] border border-[#222738]"
                    : "bg-[#090a0f] text-[#94a3b8] hover:text-[#cbd5e1] border border-[#141722]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Sub-Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#181b26] text-xs">
          <div>
            <label className="block text-[9px] font-mono uppercase text-slate-500 mb-0.5">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2 py-1 bg-[#090a0f] border border-[#181b26] rounded text-[#cbd5e1] text-xs font-mono"
            >
              <option value="all">All Statuses</option>
              <option value="still_confused">Still Confused</option>
              <option value="understood">Understood</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-mono uppercase text-slate-500 mb-0.5">Mistake Tag</label>
            <select
              value={selectedMistake}
              onChange={(e) => setSelectedMistake(e.target.value)}
              className="w-full px-2 py-1 bg-[#090a0f] border border-[#181b26] rounded text-[#cbd5e1] text-xs font-mono"
            >
              <option value="all">All Mistake Types</option>
              <option value="concept_gap">Concept Gap</option>
              <option value="calculation_slip">Calculation Slip</option>
              <option value="ran_out_of_time">Ran Out of Time</option>
              <option value="option_misread">Option Misread</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-mono uppercase text-slate-500 mb-0.5">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-2 py-1 bg-[#090a0f] border border-[#181b26] rounded text-[#cbd5e1] text-xs font-mono"
            >
              <option value="all">All Difficulties</option>
              <option value="Moderate">Moderate</option>
              <option value="Hard">Hard</option>
              <option value="CAT 99+">CAT 99+</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-mono uppercase text-slate-500 mb-0.5 flex items-center gap-1">
              <ArrowUpDown className="w-2.5 h-2.5" /> Sort By
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                setSortBy(sb);
                setSortOrder(so as any);
              }}
              className="w-full px-2 py-1 bg-[#090a0f] border border-[#181b26] rounded text-[#cbd5e1] text-xs font-mono"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="revisitCount-desc">Most Revisited</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doubts Grid List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full mb-2"></div>
          <p className="text-xs font-mono text-slate-500">Loading vault...</p>
        </div>
      ) : doubts.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0b0d13] border border-[#1c202e] space-y-3">
          <HelpCircle className="w-7 h-7 text-slate-600 mx-auto" />
          <h3 className="font-serif text-sm text-[#f1f5f9] font-normal">Your Doubt Vault is Empty</h3>
          <p className="font-sans text-xs text-slate-500 max-w-sm mx-auto font-light">
            Paste a screenshot (Ctrl+V) or upload a question on the solver page to start building your personal revision repository.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#181c2b] hover:bg-[#202638] text-white font-mono text-xs rounded border border-[#2e354e] shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Solve a Doubt</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {doubts.map((doubt) => {
            const fastestShortcut = doubt.shortcuts?.[0];
            const isMastered = doubt.userStatus === "mastered";
            const isUnderstood = doubt.userStatus === "understood";

            return (
              <Link
                key={doubt.id}
                href={`/repository/${doubt.id}`}
                className="group p-3.5 rounded-lg bg-[#0b0d13] border border-[#1c202e] hover:border-[#282d40] shadow-xs transition-all flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="px-1.5 py-0.2 bg-[#12141e] text-[#cbd5e1] font-mono text-[9px] rounded border border-[#202535]">
                        {doubt.topic}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {doubt.subtopic}
                      </span>
                    </div>

                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase flex items-center gap-1 ${
                        isMastered
                          ? "bg-[#101b17] text-emerald-400 border border-emerald-900/40"
                          : isUnderstood
                          ? "bg-[#1a1710] text-amber-300 border border-amber-900/40"
                          : "bg-red-950/40 text-red-300 border border-red-900/50"
                      }`}
                    >
                      {isMastered ? (
                        <Award className="w-2.5 h-2.5" />
                      ) : isUnderstood ? (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      ) : (
                        <HelpCircle className="w-2.5 h-2.5" />
                      )}
                      {doubt.userStatus}
                    </span>
                  </div>

                  <div className="font-serif text-xs font-normal text-[#cbd5e1] line-clamp-3 leading-relaxed">
                    <MathRenderer content={doubt.questionText} />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#181b26] flex items-center justify-between text-xs">
                  {fastestShortcut ? (
                    <div className="flex items-center gap-1 font-mono text-amber-400 text-[9px]">
                      <Zap className="w-2.5 h-2.5" />
                      <span>{fastestShortcut.technique}</span>
                      <span className="text-slate-500">({fastestShortcut.est_seconds}s)</span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-mono">Formula Solution</span>
                  )}

                  <span className="text-[9px] text-slate-500 font-mono">
                    {doubt.revisitCount || 0} rev
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
