"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Clipboard,
  FileText,
  Image as ImageIcon,
  X,
  Sparkles,
  Loader2,
  FileCode,
  CornerDownLeft,
} from "lucide-react";

interface UploadZoneProps {
  onSolve: (data: { imageBase64?: string; imageMimeType?: string; textPrompt?: string }) => void;
  isLoading: boolean;
}

export function UploadZone({ onSolve, isLoading }: UploadZoneProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/png");
  const [textPrompt, setTextPrompt] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [pasteNotification, setPasteNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerSolve = useCallback(() => {
    if (isLoading) return;
    if (!imagePreview && !textPrompt.trim()) return;

    onSolve({
      imageBase64: imagePreview || undefined,
      imageMimeType: imagePreview ? imageMimeType : undefined,
      textPrompt: textPrompt.trim() || undefined,
    });
  }, [imagePreview, imageMimeType, textPrompt, isLoading, onSolve]);

  // Global Ctrl+V clipboard paste listener
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        // If pasting an image into the input/textarea, still intercept and process image
        if (e.clipboardData && e.clipboardData.files.length > 0) {
          const file = e.clipboardData.files[0];
          if (file.type.startsWith("image/") || file.type === "application/pdf") {
            e.preventDefault();
            processFile(file);
            setPasteNotification("Screenshot captured! Press Enter ↵ to solve immediately");
            setTimeout(() => setPasteNotification(null), 4000);
            return;
          }
        }
        return;
      }

      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              processFile(file);
              setPasteNotification("Screenshot captured! Press Enter ↵ to solve immediately");
              setTimeout(() => setPasteNotification(null), 4000);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  // Global Enter key listener to submit when image is present or Ctrl+Enter on textarea
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (e.key === "Enter") {
        const target = e.target as HTMLElement;
        const isTextarea = target && target.tagName === "TEXTAREA";

        // In a textarea: only submit on Ctrl+Enter or Cmd+Enter
        if (isTextarea) {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            triggerSolve();
          }
          return;
        }

        // Everywhere else: if image or text exists, Enter key triggers solve!
        if (imagePreview || textPrompt.trim()) {
          e.preventDefault();
          triggerSolve();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imagePreview, textPrompt, isLoading, triggerSolve]);

  const processFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setImageMimeType("application/pdf");
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a PNG, JPG, WebP image or PDF.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setTextPrompt("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSolve();
  };

  return (
    <div className="w-full">
      {/* Toast notice for clipboard paste */}
      {pasteNotification && (
        <div className="mb-3 flex items-center justify-between gap-2 p-2.5 bg-[#121520] text-[#cbd5e1] text-xs font-mono rounded-lg border border-emerald-900/50 shadow-lg animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>{pasteNotification}</span>
          </div>
          <span className="px-1.5 py-0.5 bg-[#090a0f] border border-[#202535] rounded text-[10px] text-amber-300 flex items-center gap-1">
            <CornerDownLeft className="w-2.5 h-2.5" /> Enter
          </span>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border border-dashed rounded-xl p-6 sm:p-7 transition-all bg-[#0b0d13] ${
          isDragging
            ? "border-indigo-500/60 bg-[#121520] scale-[1.005]"
            : imagePreview
            ? "border-emerald-900/60 bg-[#0c0e14]"
            : "border-[#1c202e] hover:border-[#282d40] shadow-xs"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />

        {imagePreview ? (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Screenshot Loaded
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-mono text-red-300 hover:text-red-200 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-red-950/40 transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>

            <div className="relative max-h-64 overflow-hidden rounded-lg border border-[#181b26] bg-[#090a0f] flex items-center justify-center p-2">
              {imageMimeType === "application/pdf" ? (
                <div className="flex flex-col items-center justify-center p-6 text-slate-400">
                  <FileText className="w-10 h-10 text-indigo-400 mb-2" />
                  <span className="font-sans text-xs text-slate-200">PDF Document Loaded</span>
                  <span className="font-mono text-[10px] text-slate-500 mt-0.5">Ready for Vision LLM solver</span>
                </div>
              ) : (
                <img
                  src={imagePreview}
                  alt="Doubt Preview"
                  className="max-h-56 object-contain rounded"
                />
              )}
            </div>

            {/* Additional context input */}
            <div>
              <input
                type="text"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    triggerSolve();
                  }
                }}
                placeholder="Options or question context (optional)... Press Enter ↵ to solve"
                className="w-full px-3 py-2 text-xs bg-[#090a0f] border border-[#1c202e] rounded-lg focus:outline-none focus:border-[#2e354e] text-[#cbd5e1] placeholder-slate-600 font-sans"
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full py-2.5 bg-[#181c2b] hover:bg-[#202638] text-white font-medium text-xs rounded-lg border border-[#2e354e] shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span className="font-mono text-xs text-slate-200">Analyzing like a 99+ Topper...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Solve Question</span>
                  <kbd className="ml-1 px-1.5 py-0.5 bg-[#090a0f] text-amber-300 font-mono text-[10px] rounded border border-[#2e354e] flex items-center gap-0.5 group-hover:border-amber-500/50 transition-colors">
                    <CornerDownLeft className="w-2.5 h-2.5" /> Enter
                  </kbd>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-lg bg-[#12141c] border border-[#1e2230] text-slate-400 flex items-center justify-center mb-2">
                <Clipboard className="w-4 h-4 text-slate-300" />
              </div>
              <h2 className="font-serif text-sm sm:text-base font-normal text-[#f1f5f9]">
                Paste Screenshot (<kbd className="px-1 py-0.2 bg-[#12141c] border border-[#202535] rounded text-[10px] font-mono text-slate-300">Ctrl+V</kbd>) or Drop File
              </h2>
              <p className="font-sans text-xs text-slate-500 mt-0.5 max-w-sm">
                Paste question screenshots from mocks or drag & drop PNG/JPG/PDF. Then press <kbd className="px-1 py-0.2 bg-[#12141c] border border-[#202535] rounded text-[10px] font-mono text-amber-300">Enter</kbd> to solve.
              </p>
            </div>

            <div className="flex items-center justify-center">
              <label
                htmlFor="file-upload"
                className="cursor-pointer px-3 py-1.5 bg-[#121520] hover:bg-[#181d2b] text-[#cbd5e1] hover:text-white rounded-lg text-xs font-normal flex items-center gap-1.5 transition-colors border border-[#202535]"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Browse File</span>
              </label>
            </div>

            {/* Direct text input */}
            <div className="pt-3 border-t border-[#181b26] text-left">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileCode className="w-3 h-3 text-slate-500" />
                <span className="font-mono text-[11px] text-slate-500">
                  Or paste question text directly:
                </span>
              </div>
              <textarea
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder="Paste question text and options here (Press Ctrl+Enter to solve)..."
                rows={2}
                className="w-full px-3 py-1.5 text-xs bg-[#090a0f] border border-[#1c202e] rounded-lg focus:outline-none focus:border-[#2e354e] text-[#cbd5e1] placeholder-slate-600 font-sans leading-relaxed"
              />
              {textPrompt.trim() && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="mt-2 w-full py-2 bg-[#181c2b] hover:bg-[#202638] text-white font-medium text-xs rounded-lg border border-[#2e354e] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Solving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Solve Text Question</span>
                      <kbd className="ml-1 px-1.5 py-0.5 bg-[#090a0f] text-amber-300 font-mono text-[10px] rounded border border-[#2e354e] flex items-center gap-0.5">
                        <CornerDownLeft className="w-2.5 h-2.5" /> Enter
                      </kbd>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
