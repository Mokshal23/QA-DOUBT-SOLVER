"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  BarChart3,
  Timer,
  FileText,
  Settings,
  Download,
} from "lucide-react";
import { SettingsModal } from "./SettingsModal";

export function Navbar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Solver", icon: Sparkles },
    { href: "/repository", label: "Vault", icon: BookOpen },
    { href: "/practice", label: "Timed Drill", icon: Timer },
    { href: "/dashboard", label: "Weak Areas", icon: BarChart3 },
    { href: "/cheatsheet", label: "Formulae", icon: FileText },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#090a0f]/95 backdrop-blur-md border-b border-[#181b26]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-[#12141c] border border-[#202535] flex items-center justify-center text-slate-300 group-hover:border-[#2e354e] transition-colors">
                <span className="font-serif font-bold text-xs text-amber-400">Q</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-medium text-sm text-[#f1f5f9] tracking-tight">
                  QuantSolver
                </span>
                <span className="font-mono text-[9px] text-[#94a3b8] px-1.5 py-0.5 rounded bg-[#10121a] border border-[#1c202d]">
                  99+
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-[#0b0d13] p-1 rounded-lg border border-[#161822]">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-normal transition-all ${
                      isActive
                        ? "bg-[#161924] text-[#f1f5f9] border border-[#222738] shadow-xs"
                        : "text-[#94a3b8] hover:text-[#cbd5e1] hover:bg-[#11131c]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <a
                href="/api/export"
                download="CAT_Quant_Revision_Pack.md"
                title="Download Revision Pack"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#94a3b8] hover:text-[#f1f5f9] bg-[#10121a] hover:bg-[#161924] rounded-md transition-colors border border-[#1a1d27]"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </a>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#cbd5e1] hover:text-white bg-[#121520] hover:bg-[#181d2b] rounded-md transition-colors border border-[#202535]"
                title="Settings & API Keys"
              >
                <Settings className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-[#181b26] px-2 py-1.5 bg-[#090a0f] overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded text-[10px] ${
                  isActive
                    ? "text-[#f1f5f9] font-medium"
                    : "text-[#64748b] hover:text-[#94a3b8]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
