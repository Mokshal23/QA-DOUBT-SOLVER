"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Printer,
  Sparkles,
  Download,
  Clock,
  Plus,
} from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";

export default function CheatSheetPage() {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("all");

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
  }, []);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doubts");
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

  const handlePrint = () => {
    window.print();
  };

  const groupedByTopic: Record<string, any[]> = {};
  doubts.forEach((d) => {
    const t = d.topic || "General Quant";
    if (!groupedByTopic[t]) groupedByTopic[t] = [];
    groupedByTopic[t].push(d);
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto print:p-0 print:space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#10121a] text-amber-300 font-mono text-[9px] border border-[#1c202d] mb-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Auto-Compiled Quant Revision Sheet</span>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#f1f5f9]">
            CAT Formula & Shortcut Sheet
          </h1>
          <p className="font-sans text-xs text-[#94a3b8] font-light mt-0.5">
            Revision rules and shortcuts aggregated from all logged doubts.
          </p>
        </div>

        {doubts.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#181c2b] hover:bg-[#202638] text-white rounded text-xs font-mono border border-[#2e354e] shadow-xs"
            >
              <Printer className="w-3 h-3" />
              <span>Print</span>
            </button>
            <a
              href="/api/export"
              download="CAT_Quant_Cheat_Sheet.md"
              className="flex items-center gap-1 px-2.5 py-1 bg-[#0b0d13] border border-[#1c202e] text-[#cbd5e1] rounded text-xs font-mono hover:bg-[#12141c]"
            >
              <Download className="w-3 h-3 text-indigo-400" />
              <span>Download MD</span>
            </a>
          </div>
        )}
      </div>

      {doubts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-xs print:hidden">
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
      )}

      {/* Content */}
      {loading ? (
        <div className="p-16 text-center text-slate-500">
          <div className="inline-block animate-spin w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full mb-2"></div>
          <p className="text-xs font-mono text-slate-500">Compiling formula sheet...</p>
        </div>
      ) : doubts.length === 0 ? (
        <div className="p-10 text-center rounded-xl bg-[#0b0d13] border border-[#1c202e] space-y-2.5">
          <Sparkles className="w-7 h-7 text-slate-600 mx-auto" />
          <h3 className="font-serif text-sm text-[#f1f5f9]">No Formulas Logged Yet</h3>
          <p className="font-sans text-xs text-slate-500 max-w-sm mx-auto font-light">
            As you solve doubts, shortcuts and mathematical theorems will automatically populate this revision sheet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#181c2b] text-white font-mono text-xs rounded border border-[#2e354e]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Solve a Doubt</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByTopic)
            .filter(([topic]) => selectedTopic === "all" || selectedTopic === topic)
            .map(([topic, topicDoubts]) => (
              <section
                key={topic}
                className="p-4 rounded-xl bg-[#0b0d13] border border-[#1c202e] space-y-3 break-inside-avoid"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#181b26]">
                  <h2 className="font-serif text-sm font-normal text-[#f1f5f9] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>{topic}</span>
                  </h2>
                  <span className="text-[10px] font-mono text-slate-500">
                    {topicDoubts.length} rules
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {topicDoubts.map((doubt, dIdx) => (
                    <div
                      key={doubt.id || dIdx}
                      className="p-3 rounded bg-[#090a0f] border border-[#181b26] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] text-[#cbd5e1] uppercase">
                          {doubt.subtopic}
                        </span>
                        {doubt.shortcuts?.[0]?.est_seconds && (
                          <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> ~{doubt.shortcuts[0].est_seconds}s
                          </span>
                        )}
                      </div>

                      <p className="font-serif text-xs text-[#cbd5e1] line-clamp-2 font-normal">
                        {doubt.questionText}
                      </p>

                      {doubt.shortcuts && doubt.shortcuts.length > 0 && (
                        <div className="p-2 bg-[#0b0d13] rounded border border-[#1c202e] space-y-0.5">
                          <div className="text-xs font-mono text-amber-300 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            <span>{doubt.shortcuts[0].technique}</span>
                          </div>
                          {doubt.shortcuts[0].why_fast && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              {doubt.shortcuts[0].why_fast}
                            </p>
                          )}
                        </div>
                      )}

                      {doubt.userNotes && (
                        <p className="text-[10px] text-slate-500 font-sans italic">
                          💡 <strong>Note:</strong> {doubt.userNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
