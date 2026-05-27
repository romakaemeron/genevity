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
  topics: string[];
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
  escalationResetKey: number;
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
  escalationResetKey,
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
    topics: [],
  });
  const [escalationOffered, setEscalationOffered] = useState(false);
  const [showEscalatePrompt, setShowEscalatePrompt] = useState(false);
  // Track which toolCallId we already escalated for — prevents re-triggering on reset
  const escalatedToolCallIdRef = useRef<string | null>(null);

  // Reset when user comes back from escalation screen
  useEffect(() => {
    setEscalationOffered(false);
    setShowEscalatePrompt(false);
    escalatedToolCallIdRef.current = null;
  }, [escalationResetKey]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendMessageRef = useRef<((msg: any) => void) | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ sessionToken, locale: localeRef.current, pageUrl, pageTitle }),
    }),
  });

  // Read chatState from tool invocation parts streamed by the server
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allParts = messages.flatMap((m) => m.parts) as any[];
    const lastToolPart = [...allParts].reverse().find(
      (p) => p.type === "tool-updateChatState" && p.state === "output-available"
    ) as { toolCallId?: string; input: ChatState } | undefined;
    if (!lastToolPart) return;
    const args = lastToolPart.input;
    const toolCallId = lastToolPart.toolCallId ?? null;
    setChatState(prev => ({
      ...args,
      topics: [...new Set([...prev.topics, ...(args.topics ?? [])])],
    }));
    // Guard: only escalate once per unique toolCallId to prevent infinite loop on reset
    if (args.shouldEscalate && !escalationOffered && toolCallId !== escalatedToolCallIdRef.current) {
      escalatedToolCallIdRef.current = toolCallId;
      setEscalationOffered(true);
      const mergedTopics = [...new Set([...chatState.topics, ...(args.topics ?? [])])];
      const topicsPart = mergedTopics.length ? `Цікавився: ${mergedTopics.join(", ")}` : null;
      const summary = [args.escalationHint, topicsPart].filter(Boolean).join(". ");
      if (args.urgency === "ready_to_book") {
        onEscalate(args.escalationTarget, summary);
      } else {
        setShowEscalatePrompt(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Keep ref current so the welcome timer can call latest sendMessage without being a dep
  useEffect(() => { sendMessageRef.current = sendMessage; });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send welcome once on mount — no deps so cleanup never cancels the timer prematurely
  // ChatPanel is keyed by sessionToken so this runs fresh for each session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = setTimeout(() => {
      sendMessageRef.current?.({ text: "__welcome__" });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

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

        <AnimatePresence>
          {status === "submitted" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="flex justify-start"
            >
              <div className="bg-[var(--color-champagne-dark)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--color-main)] opacity-50 animate-bounce"
                    style={{ animationDelay: `${delay}ms`, animationDuration: "800ms" }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Connect to operator */}
      <div className="px-4 pb-1 shrink-0">
        <button
          onClick={() => {
            const topicsLine = chatState.topics?.length
              ? `Цікавився: ${chatState.topics.join(", ")}`
              : (() => {
                  const lastUserTexts = messages
                    .filter(m => m.role === "user")
                    .map(m => m.parts.filter((p): p is { type: "text"; text: string } => p.type === "text").map(p => p.text).join(""))
                    .filter(t => t && !t.startsWith("__"))
                    .slice(-3)
                    .join(" / ");
                  return lastUserTexts ? `Запит: ${lastUserTexts}` : null;
                })();
            const parts = [
              chatState.escalationHint,
              topicsLine,
              chatState.collectedName ? `Ім'я: ${chatState.collectedName}` : null,
            ].filter(Boolean);
            onEscalate(chatState.escalationTarget, parts.join(". "));
          }}
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

      <p className="px-4 pb-3 text-[10px] text-[var(--color-stone,#8b7b6b)] leading-tight text-center">
        Натискаючи «Відправити», ви погоджуєтесь з{" "}
        <a href="/polityka-konfidentsiynosti" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity">
          Політикою конфіденційності
        </a>{" "}
        та надаєте згоду на обробку персональних даних.
      </p>
    </motion.div>
  );
}
