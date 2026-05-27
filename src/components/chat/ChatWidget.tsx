"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ChatPanel from "./ChatPanel";
import ChatEscalation from "./ChatEscalation";
import { useChatSession } from "./useChatSession";

type View = "closed" | "chat" | "escalation";

declare global {
  interface Window {
    binotelChatWidget?: { open: () => void };
  }
}

export default function ChatWidget() {
  const sessionToken = useChatSession();
  const [view, setView] = useState<View>("closed");
  const [locale, setLocale] = useState("uk");
  const [escalationTarget, setEscalationTarget] = useState<"genevity" | "helyos">("genevity");
  const [escalationSummary, setEscalationSummary] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      setIsAdmin(true);
      return;
    }
    setPageUrl(window.location.href);
    setPageTitle(document.title);
    const lang = navigator.language.slice(0, 2).toLowerCase();
    if (lang === "ru") setLocale("ru");
    else if (lang === "en") setLocale("en");
    else setLocale("uk");
  }, []);

  // Hide Binotel native launcher — our widget replaces it visually.
  // Binotel uses bwc-* IDs (not "binotel"), so we watch for them via MutationObserver.
  useEffect(() => {
    const HIDE_IDS = ["bwc-widget-action", "bwc-chat-cloud-message"];

    const hideKnown = () => {
      HIDE_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.setProperty("display", "none", "important");
      });
    };

    hideKnown();

    const observer = new MutationObserver(hideKnown);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handleEscalate = useCallback(
    (target: "genevity" | "helyos", summary: string) => {
      setEscalationTarget(target);
      setEscalationSummary(summary);
      setView("escalation");
    },
    []
  );

  const handleOpenBinotel = useCallback(() => {
    const prefill = escalationSummary
      ? (escalationTarget === "helyos"
          ? "Пацієнт з сайту GENEVITY. "
          : "") + escalationSummary
      : "";

    if (window.binotelChatWidget?.open) {
      window.binotelChatWidget.open();
    }

    if (prefill) {
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>(
          "[class*='binotel'] input[type='text'], .binotel-chat-input"
        );
        if (input) {
          input.value = prefill;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }, 800);
    }
    setView("closed");
  }, [escalationTarget, escalationSummary]);

  if (isAdmin) return null;

  return (
    <>
      <AnimatePresence>
        {view === "closed" && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setView("chat")}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            style={{ background: "var(--color-main)" }}
            aria-label="Відкрити чат"
          >
            <MessageCircle size={24} color="white" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence mode="wait">
          {view === "chat" && sessionToken && (
            <ChatPanel
              key="chat"
              sessionToken={sessionToken}
              onClose={() => setView("closed")}
              onEscalate={handleEscalate}
              pageUrl={pageUrl}
              pageTitle={pageTitle}
              locale={locale}
              onLocaleChange={setLocale}
            />
          )}
          {view === "escalation" && (
            <ChatEscalation
              key="escalation"
              target={escalationTarget}
              summary={escalationSummary}
              onClose={() => setView("closed")}
              onOpenBinotel={handleOpenBinotel}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
