"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Zap, Check, ShieldCheck, Sparkles, Clock, ExternalLink, Cpu } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [preferredProvider, setPreferredProvider] = useState("auto");
  const [timerDuration, setTimerDuration] = useState("45");
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [currentConfig, setCurrentConfig] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setCurrentConfig(data.settings);
        setPreferredProvider(data.settings.preferredProvider || "auto");
        setTimerDuration(data.settings.timerDuration || "45");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedMessage("");
    try {
      const payload: any = {
        preferredProvider,
        timerDuration: parseInt(timerDuration, 10),
      };
      if (geminiKey.trim()) payload.geminiApiKey = geminiKey.trim();
      if (groqKey.trim()) payload.groqApiKey = groqKey.trim();
      if (openrouterKey.trim()) payload.openrouterApiKey = openrouterKey.trim();
      if (openaiKey.trim()) payload.openaiApiKey = openaiKey.trim();

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSavedMessage("Settings saved successfully");
        setGeminiKey("");
        setGroqKey("");
        setOpenrouterKey("");
        setOpenaiKey("");
        fetchSettings();
        setTimeout(() => setSavedMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b0d13] border border-[#1c202e] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#181b26] bg-[#0e1017]">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-[#12141c] text-indigo-400 rounded border border-[#202535]">
              <Key className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-serif text-sm text-[#f1f5f9] font-normal">AI Engine Settings</h3>
              <p className="text-[10px] font-mono text-slate-500">Free AI providers & model configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded hover:bg-[#161824]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {savedMessage && (
            <div className="flex items-center gap-1.5 p-2 bg-[#101b17] border border-emerald-900/50 text-emerald-300 rounded text-xs font-mono">
              <Check className="w-3 h-3 text-emerald-400" />
              {savedMessage}
            </div>
          )}

          {/* 1. Google Gemini (100% Free Tier) */}
          <div className="p-2.5 rounded-lg bg-[#0e1017] border border-[#181b26] space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-medium text-[#f1f5f9]">Google Gemini 2.5 Flash</span>
                <span className="px-1.5 py-0.2 bg-[#101b17] text-emerald-400 border border-emerald-900/40 text-[9px] font-mono rounded">
                  100% FREE
                </span>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
              >
                Get Free Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              placeholder={currentConfig?.hasGeminiKey ? `Configured (${currentConfig.maskedGeminiKey}) - enter to overwrite` : "Paste AIzaSy... key from Google AI Studio"}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#090a0f] border border-[#181b26] rounded focus:outline-none focus:border-[#2e354e] font-mono text-[#cbd5e1]"
            />
            <p className="text-[10px] text-slate-500 font-mono">
              1,500 free requests/day with high-res vision math OCR.
            </p>
          </div>

          {/* 2. Groq Cloud (100% Free Tier) */}
          <div className="p-2.5 rounded-lg bg-[#0e1017] border border-[#181b26] space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-medium text-[#f1f5f9]">Groq Cloud (Llama 3.2 Vision / 3.3)</span>
                <span className="px-1.5 py-0.2 bg-[#101b17] text-emerald-400 border border-emerald-900/40 text-[9px] font-mono rounded">
                  100% FREE
                </span>
              </div>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
              >
                Get Free Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              placeholder={currentConfig?.hasGroqKey ? `Configured (${currentConfig.maskedGroqKey}) - enter to overwrite` : "Paste gsk_... key from Groq Console"}
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#090a0f] border border-[#181b26] rounded focus:outline-none focus:border-[#2e354e] font-mono text-[#cbd5e1]"
            />
            <p className="text-[10px] text-slate-500 font-mono">
              Ultra-fast vision & reasoning models with zero costs.
            </p>
          </div>

          {/* 3. OpenRouter (Free Tier Models) */}
          <div className="p-2.5 rounded-lg bg-[#0e1017] border border-[#181b26] space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-violet-400" />
                <span className="text-xs font-medium text-[#f1f5f9]">OpenRouter (Free Models)</span>
                <span className="px-1.5 py-0.2 bg-[#101b17] text-emerald-400 border border-emerald-900/40 text-[9px] font-mono rounded">
                  FREE MODELS
                </span>
              </div>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
              >
                Get Free Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              placeholder={currentConfig?.hasOpenRouterKey ? `Configured (${currentConfig.maskedOpenRouterKey}) - enter to overwrite` : "Paste sk-or-... key from OpenRouter"}
              value={openrouterKey}
              onChange={(e) => setOpenrouterKey(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#090a0f] border border-[#181b26] rounded focus:outline-none focus:border-[#2e354e] font-mono text-[#cbd5e1]"
            />
          </div>

          {/* 4. OpenAI (Optional Paid) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-sans text-[#cbd5e1] flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-blue-400" /> OpenAI API Key (GPT-4o)
              </label>
              {currentConfig?.hasOpenAIKey && (
                <span className="text-[9px] font-mono text-slate-400 bg-[#12141c] px-1 py-0.2 rounded border border-[#202535]">
                  Configured ({currentConfig.maskedOpenAIKey})
                </span>
              )}
            </div>
            <input
              type="password"
              placeholder={currentConfig?.hasOpenAIKey ? "Enter new key to overwrite..." : "sk-..."}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#090a0f] border border-[#181b26] rounded focus:outline-none focus:border-[#2e354e] font-mono text-[#cbd5e1]"
            />
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-sans text-[#cbd5e1] mb-1">
              Preferred Solving Provider
            </label>
            <select
              value={preferredProvider}
              onChange={(e) => setPreferredProvider(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#090a0f] border border-[#181b26] rounded focus:outline-none focus:border-[#2e354e] text-[#cbd5e1] font-mono"
            >
              <option value="auto">Auto Fallback (Gemini Free $\rightarrow$ Groq Free $\rightarrow$ OpenRouter $\rightarrow$ Mock)</option>
              <option value="gemini">Google Gemini 2.5 Flash (Free)</option>
              <option value="groq">Groq Cloud Llama 3.2 Vision (Free)</option>
              <option value="openrouter">OpenRouter Free Models</option>
              <option value="openai">OpenAI GPT-4o</option>
            </select>
          </div>

          {/* Practice Timer Duration */}
          <div>
            <label className="block text-xs font-sans text-[#cbd5e1] mb-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" /> Default Practice Timer
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {["30", "45", "60", "90"].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTimerDuration(sec)}
                  className={`py-1 text-xs font-mono rounded border transition-all ${
                    timerDuration === sec
                      ? "bg-[#181c2b] text-white border-[#2e354e]"
                      : "bg-[#090a0f] border-[#181b26] text-slate-400 hover:text-white"
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#181b26] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 text-xs font-mono bg-[#181c2b] hover:bg-[#202638] text-white rounded border border-[#2e354e] shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
