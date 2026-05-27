"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      parts.push(<strong key={key++} className="font-semibold">{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      parts.push(<em key={key++}>{m[3]}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderMarkdown(content: string): ReactNode {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = /^[-•]\s+/.test(line);
    const h3 = /^###\s+(.*)/.exec(line);
    const h2 = /^##\s+(.*)/.exec(line);
    const h1 = /^#\s+(.*)/.exec(line);

    if (h3) {
      if (nodes.length > 0) nodes.push(<div key={key++} className="h-1" />);
      nodes.push(<div key={key++} className="font-semibold text-sm">{parseInline(h3[1])}</div>);
    } else if (h2) {
      if (nodes.length > 0) nodes.push(<div key={key++} className="h-1" />);
      nodes.push(<div key={key++} className="font-semibold text-[0.9rem]">{parseInline(h2[1])}</div>);
    } else if (h1) {
      if (nodes.length > 0) nodes.push(<div key={key++} className="h-1" />);
      nodes.push(<div key={key++} className="font-bold text-base">{parseInline(h1[1])}</div>);
    } else if (isBullet) {
      const text = line.replace(/^[-•]\s+/, "");
      nodes.push(
        <div key={key++} className="flex gap-1.5 mt-0.5">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0 opacity-60" />
          <span>{parseInline(text)}</span>
        </div>
      );
    } else if (line.trim() === "") {
      if (i > 0 && i < lines.length - 1) nodes.push(<div key={key++} className="h-1.5" />);
    } else {
      if (nodes.length > 0) nodes.push(<br key={key++} />);
      nodes.push(<span key={key++}>{parseInline(line)}</span>);
    }
  }
  return <>{nodes}</>;
}

export default function ChatMessage({ role, content, isStreaming }: Props) {
  const isBot = role === "assistant";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isBot ? "justify-start" : "justify-end")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isBot
            ? "bg-[var(--color-champagne-dark)] text-[var(--color-black)] rounded-tl-sm"
            : "bg-[var(--color-main)] text-white rounded-tr-sm"
        )}
      >
        {isBot ? renderMarkdown(content) : content}
        {isStreaming && (
          <span className="inline-block w-1 h-3.5 ml-0.5 bg-current opacity-70 animate-pulse rounded-full align-middle" />
        )}
      </div>
    </motion.div>
  );
}
