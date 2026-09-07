"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

function formatMathForKatex(content: string): string {
  if (!content || typeof content !== "string") return "";

  // 1. Standardize bracket/parenthesis delimiters
  let s = content
    .replace(/\\\\\[/g, "\n$$\n")
    .replace(/\\\\\]/g, "\n$$\n")
    .replace(/\\\[/g, "\n$$\n")
    .replace(/\\\]/g, "\n$$\n")
    .replace(/\\\\\(/g, " $ ")
    .replace(/\\\\\)/g, " $ ")
    .replace(/\\\(/g, " $ ")
    .replace(/\\\)/g, " $ ");

  // 2. Split into lines
  const lines = s.split("\n");

  const processed = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";

    // Markdown headers
    if (/^#{1,6}\s/.test(trimmed)) return line;

    // Check if line contains un-enclosed LaTeX macros (e.g. \text, \mathbf, \implies, \frac, \sqrt, \in, \mathbb)
    const hasMacros = /\\[a-zA-Z]{2,}/.test(trimmed);
    const hasDollar = trimmed.includes("$");

    if (hasMacros && !hasDollar) {
      // Check if it's a numbered list item like '1. ' or '2. '
      const listMatch = trimmed.match(/^(\d+\.\s+|-\s+|\*\s+)/);
      if (listMatch) {
        const prefix = listMatch[0];
        const rest = trimmed.slice(prefix.length).trim();
        return `${prefix}$${rest}$`;
      }

      // Check if it's a sentence with mixed prose and formulas (e.g. Set A and B are defined as...)
      if (/^(?:Set|Let|Given|Where|Find|Which|If|Then)\b/i.test(trimmed)) {
        let text = trimmed;
        // Match full set expressions like A = {x | ...} or B = {y | ...}
        text = text.replace(
          /([A-Za-z0-9_]*\s*=\s*\{[\s\S]*?\})(?=\s+[A-Za-z0-9_]*\s*=\s*\{|\s+(?:Which|Find|What|If|Then|Where|Let|\?|\.|\,|$))/gi,
          (m) => {
            const katexSafe = m.replace(/=\s*\{/, "= \\{").replace(/\}\s*$/, "\\}");
            return ` $${katexSafe.trim()}$ `;
          }
        );
        // Wrap n(A) + n(B)
        text = text.replace(/(n\([A-Z]\)\s*[+\-*\/=]\s*n\([A-Z]\))/g, " $$$1$$ ");
        return text;
      }

      // Entire line is a formula or calculation step!
      return `$$${trimmed}$$`;
    }

    if (hasMacros && hasDollar) {
      // Line has some dollar signs but also some bare LaTeX macros outside dollar blocks
      const parts = line.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g);
      const fixed = parts.map((p) => {
        if (!p || p.startsWith("$")) return p;
        if (/\\[a-zA-Z]{2,}/.test(p)) {
          return ` $${p.trim()}$ `;
        }
        return p;
      });
      return fixed.join("");
    }

    return line;
  });

  return processed.join("\n");
}

export function MathRenderer({ content, className = "", inline = false }: MathRendererProps) {
  if (!content || typeof content !== "string") return null;

  const normalized = formatMathForKatex(content);

  return (
    <div className={`prose prose-invert max-w-none text-[#cbd5e1] font-light leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { output: "htmlAndMathml", throwOnError: false }]]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="font-serif text-base font-normal mt-3 mb-1.5 text-[#f1f5f9]" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="font-serif text-sm font-normal mt-2.5 mb-1 text-[#e2e8f0]" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="font-sans text-xs font-medium mt-2 mb-1 text-[#cbd5e1]" {...props} />
          ),
          p: ({ node, ...props }) =>
            inline ? (
              <span className="text-xs sm:text-sm leading-relaxed" {...props} />
            ) : (
              <p className="mb-1.5 last:mb-0 text-xs sm:text-sm text-[#cbd5e1] leading-relaxed" {...props} />
            ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-4 mb-2 space-y-1 text-xs sm:text-sm text-[#cbd5e1]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-4 mb-2 space-y-1 text-xs sm:text-sm text-[#cbd5e1]" {...props} />
          ),
          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-2 border-[#2d3344] bg-[#0c0e14] px-3 py-1.5 rounded-r my-2 text-[#94a3b8] italic text-xs"
              {...props}
            />
          ),
          code: ({ node, ...props }) => (
            <code
              className="bg-[#0d0f14] border border-[#1c202a] px-1.5 py-0.5 rounded text-[#94a3b8] font-mono text-xs"
              {...props}
            />
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
