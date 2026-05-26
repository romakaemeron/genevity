"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
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
        {content}
        {isStreaming && (
          <span className="inline-block w-1 h-3.5 ml-0.5 bg-current opacity-70 animate-pulse rounded-full align-middle" />
        )}
      </div>
    </motion.div>
  );
}
