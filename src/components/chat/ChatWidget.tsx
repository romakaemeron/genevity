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
  const { token: sessionToken, reset: resetSession } = useChatSession();
  const [view, setView] = useState<View>("closed");
  const [chatEverOpened, setChatEverOpened] = useState(false);
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
    // Detect locale from URL path prefix (next-intl: /ru/... or /en/... or no prefix = uk)
    const seg = window.location.pathname.split("/")[1];
    if (seg === "ru") setLocale("ru");
    else if (seg === "en") setLocale("en");
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
    setView("closed");

    const prefill = escalationSummary
      ? (escalationTarget === "helyos"
          ? "Пацієнт з сайту GENEVITY. "
          : "") + escalationSummary
      : "";

    const openChat = () => {
      // Try Binotel programmatic API first
      if (typeof window.binotelChatWidget?.open === "function") {
        window.binotelChatWidget.open();
      } else {
        // Fall back: click the native Binotel button (hidden via CSS but still clickable)
        const btn = document.getElementById("bwc-widget-action");
        if (btn) btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }

      if (prefill) {
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>(
            "input[class*='bwc'], textarea[class*='bwc'], [id*='bwc'] input, [id*='bwc'] textarea"
          );
          if (input) {
            input.value = prefill;
            input.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }, 800);
      }
    };

    // Binotel loads lazily — give it a tick to finish if still initializing
    if (document.getElementById("bwc-widget-action") || typeof window.binotelChatWidget?.open === "function") {
      openChat();
    } else {
      setTimeout(openChat, 600);
    }
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
            onClick={() => { setView("chat"); setChatEverOpened(true); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            style={{ background: "var(--color-main)" }}
            aria-label="Відкрити чат"
          >
            <MessageCircle size={24} color="white" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50">
        {/* ChatPanel stays mounted after first open to preserve message history */}
        {sessionToken && chatEverOpened && (
          <ChatPanel
            key={sessionToken}
            isOpen={view === "chat"}
            sessionToken={sessionToken}
            onClose={() => setView("closed")}
            onEscalate={handleEscalate}
            onNewChat={resetSession}
            pageUrl={pageUrl}
            pageTitle={pageTitle}
            locale={locale}
          />
        )}
        <AnimatePresence mode="wait">
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
