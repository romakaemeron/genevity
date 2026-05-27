"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, RotateCcw } from "lucide-react";
import ChatMessage from "./ChatMessage";

interface ChatState {
  suggestions: string[];
  urgency: "browsing" | "interested" | "ready_to_book";
  shouldEscalate: boolean;
  escalationTarget: "genevity" | "helyos";
  escalationHint: string | null;
  collectedName: string | null;
  collectedPhone: string | null;
}

interface Props {
  isOpen: boolean;
  sessionToken: string;
  onClose: () => void;
  onEscalate: (target: "genevity" | "helyos", summary: string) => void;
  onNewChat: () => void;
  pageUrl: string;
  pageTitle: string;
  locale: string;
}

function detectLocale(text: string): string {
  if (/[a-zA-Z]{3,}/.test(text) && !/[а-яёА-ЯЁіїєґІЇЄҐ]/.test(text)) return "en";
  if (/[іїєґІЇЄҐ]/.test(text)) return "uk";
  if (/[ёэъыЁЭЪЫ]/.test(text)) return "ru";
  return "";
}

export default function ChatPanel({
  isOpen,
  sessionToken,
  onClose,
  onEscalate,
  onNewChat,
  pageUrl,
  pageTitle,
  locale: initialLocale,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [locale, setLocale] = useState(initialLocale);
  const localeRef = useRef(locale);
  const [chatState, setChatState] = useState<ChatState>({
    suggestions: ["Наші послуги", "Наші лікарі", "Ціни"],
    urgency: "browsing",
    shouldEscalate: false,
    escalationTarget: "genevity",
    escalationHint: null,
    collectedName: null,
    collectedPhone: null,
  });
  const [escalationOffered, setEscalationOffered] = useState(false);
  const [showEscalatePrompt, setShowEscalatePrompt] = useState(false);

  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ sessionToken, locale: localeRef.current, pageUrl, pageTitle }),
    }),
    onToolCall: ({ toolCall }) => {
      if (toolCall.dynamic) return;
      if (toolCall.toolName === "updateChatState") {
        const args = toolCall.input as ChatState;
        setChatState(args);
        if (args.shouldEscalate && !escalationOffered) {
          setEscalationOffered(true);
          if (args.urgency === "ready_to_book") {
            // Skip confirmation banner — go straight to operator screen
            onEscalate(args.escalationTarget, args.escalationHint ?? "");
          } else {
            setShowEscalatePrompt(true);
          }
        }
        addToolOutput({
          tool: "updateChatState",
          toolCallId: toolCall.toolCallId,
          output: "ok",
        });
      }
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send welcome once per session token
  useEffect(() => {
    if (messages.length > 0 || !sessionToken) return;
    const flag = `genevity_welcomed_${sessionToken}`;
    if (sessionStorage.getItem(flag)) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(flag, "1");
      sendMessage({ text: "__welcome__" });
    }, 400);
    return () => clearTimeout(timer);
  }, [messages.length, sessionToken, sendMessage]);

  const isStreaming = status === "streaming" || status === "submitted";
  const lastBotMsg = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={isOpen
        ? { opacity: 1, y: 0, scale: 1 }
        : { opacity: 0, y: 16, scale: 0.97 }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col w-[360px] h-[520px] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-champagne-darker)]"
      style={{ background: "var(--color-champagne)", pointerEvents: isOpen ? "auto" : "none" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-main)] text-white shrink-0">
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          GENEVITY Асистент
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="text-white/70 hover:text-white transition-colors"
            title="Новий чат"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => {
          // Extract text from parts (v6 API)
          const text = m.parts
            .filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("");
          if (!text || text.startsWith("__")) return null;
          return (
            <ChatMessage
              key={m.id}
              role={m.role as "user" | "assistant"}
              content={text}
              isStreaming={isStreaming && i === messages.length - 1 && m.role === "assistant"}
            />
          );
        })}

        {/* Quick-reply chips */}
        {!isStreaming && chatState.suggestions.length > 0 && lastBotMsg && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-1.5 pt-1"
          >
            {chatState.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage({ text: s })}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-main)] text-[var(--color-main)] hover:bg-[var(--color-main)] hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}

        {/* Bot-initiated escalation prompt */}
        <AnimatePresence>
          {showEscalatePrompt && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--color-champagne-dark)] border border-[var(--color-champagne-darker)] rounded-xl p-3 text-sm"
            >
              <p className="text-[var(--color-black)] mb-2">
                {chatState.escalationTarget === "helyos"
                  ? "Хочете, щоб я з'єднав вас з оператором Helyos?"
                  : "Хочете, щоб наш адміністратор зв'язався з вами?"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowEscalatePrompt(false);
                    onEscalate(
                      chatState.escalationTarget,
                      chatState.escalationHint ?? ""
                    );
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-[var(--color-main)] text-white text-xs font-medium"
                >
                  Так, з'єднайте
                </button>
                <button
                  onClick={() => setShowEscalatePrompt(false)}
                  className="flex-1 py-1.5 rounded-lg border border-[var(--color-main)] text-[var(--color-main)] text-xs"
                >
                  Ні, ще питання
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Connect to operator */}
      <div className="px-4 pb-1 shrink-0">
        <button
          onClick={() =>
            onEscalate(chatState.escalationTarget, chatState.escalationHint ?? "")
          }
          className="w-full py-2 text-xs text-[var(--color-main)] border border-[var(--color-main)] rounded-xl hover:bg-[var(--color-main)]/5 transition-colors flex items-center justify-center gap-1.5"
        >
          📞 Зв'язатись з оператором
        </button>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || isStreaming || !sessionToken) return;
          const detected = detectLocale(input.trim());
          if (detected) {
            localeRef.current = detected;
            setLocale(detected);
          }
          sendMessage({ text: input });
          setInput("");
        }}
        className="flex gap-2 px-4 pb-4 pt-2 shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            locale === "ru"
              ? "Напишите вопрос..."
              : locale === "en"
              ? "Ask a question..."
              : "Напишіть питання..."
          }
          disabled={isStreaming || !sessionToken}
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-[var(--color-champagne-darker,#e8e3db)] bg-white focus:outline-none focus:border-[var(--color-main)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim() || !sessionToken}
          className="w-9 h-9 rounded-xl bg-[var(--color-main)] text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
        >
          <Send size={14} />
        </button>
      </form>
    </motion.div>
  );
}
