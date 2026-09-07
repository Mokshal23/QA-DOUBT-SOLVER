"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Timer,
  Trash2,
  Eye,
} from "lucide-react";
import { SolutionCard } from "@/components/SolutionCard";
import { RecallTimer } from "@/components/RecallTimer";

export default function DoubtDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [doubt, setDoubt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRecallMode, setIsRecallMode] = useState(false);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDoubt();
    }
  }, [id]);

  const fetchDoubt = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doubts/${id}`);
      const data = await res.json();
      if (data.success) {
        setDoubt(data.doubt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this doubt from your vault?")) return;
    try {
      const res = await fetch(`/api/doubts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/repository");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRecallMode = () => {
    setIsRecallMode(!isRecallMode);
    setIsSolutionRevealed(false);
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <div className="inline-block animate-spin w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full mb-2"></div>
        <p className="text-xs font-mono text-slate-500">Opening doubt...</p>
      </div>
    );
  }

  if (!doubt) {
    return (
      <div className="p-10 text-center space-y-3">
        <h2 className="font-serif text-sm text-[#f1f5f9]">Doubt not found</h2>
        <Link
          href="/repository"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#181c2b] text-white rounded text-xs font-mono border border-[#2e354e]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Vault
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top action navigation */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/repository"
          className="flex items-center gap-1 text-xs font-mono text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Vault</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Recall Mode Toggle */}
          <button
            onClick={toggleRecallMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              isRecallMode
                ? "bg-[#1a1710] text-amber-300 border border-amber-900/50"
                : "bg-[#0b0d13] border border-[#1c202e] text-[#94a3b8] hover:text-[#cbd5e1]"
            }`}
          >
            <Timer className="w-3 h-3 text-amber-400" />
            <span>{isRecallMode ? "Exit Recall" : "Timed Recall Mode"}</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
            title="Delete Doubt"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recall Mode Banner & Timer */}
      {isRecallMode && (
        <div className="space-y-3">
          <RecallTimer
            initialSeconds={45}
            onReveal={() => setIsSolutionRevealed(true)}
            isRevealed={isSolutionRevealed}
          />
        </div>
      )}

      {/* Main Solution Card */}
      {isRecallMode && !isSolutionRevealed ? (
        <div className="p-8 rounded-xl bg-[#0b0d13] border border-[#1c202e] text-center space-y-3 shadow-sm">
          <h2 className="font-serif text-sm font-normal text-[#f1f5f9]">Timed Recall in Progress</h2>
          <p className="font-sans text-xs text-slate-500 max-w-md mx-auto font-light">
            Solve this question mentally. Spot the shortcut before the timer expires.
          </p>
          <div className="pt-1.5">
            <button
              onClick={() => setIsSolutionRevealed(true)}
              className="px-3.5 py-1.5 bg-[#181c2b] hover:bg-[#202638] text-white font-mono text-xs rounded border border-[#2e354e] shadow-sm flex items-center gap-1.5 mx-auto"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal Solutions</span>
            </button>
          </div>
        </div>
      ) : (
        <SolutionCard
          doubt={doubt}
          onDoubtUpdated={(updated) => setDoubt(updated)}
        />
      )}
    </div>
  );
}
