"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  // Store ref so we can disconnect when deliberately opening Binotel.
  const binotelObserverRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const HIDE_IDS = ["bwc-widget-action", "bwc-chat-cloud-message"];

    const hideKnown = () => {
      HIDE_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const vis = el.style.visibility;
          const disp = el.style.display;
          if (disp !== "none" || vis !== "hidden") {
            console.log("[binotel] observer hiding:", id, "display:", disp, "visibility:", vis);
          }
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
        }
      });
    };

    hideKnown();

    const observer = new MutationObserver(hideKnown);
    binotelObserverRef.current = observer;
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); binotelObserverRef.current = null; };
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
    console.log("[binotel] handleOpenBinotel called");
    setView("closed");

    const prefill = escalationSummary
      ? (escalationTarget === "helyos" ? "Пацієнт з сайту GENEVITY. " : "") + escalationSummary
      : "";
    console.log("[binotel] prefill:", prefill || "(none)");

    const openChat = () => {
      console.log("[binotel] openChat() called");
      console.log("[binotel] observer active:", !!binotelObserverRef.current);

      binotelObserverRef.current?.disconnect();
      binotelObserverRef.current = null;
      console.log("[binotel] observer disconnected");

      const chatMsg = document.getElementById("bwc-chat-cloud-message");
      const launcher = document.getElementById("bwc-widget-action");
      console.log("[binotel] bwc-chat-cloud-message:", chatMsg);
      console.log("[binotel] bwc-widget-action:", launcher);
      console.log("[binotel] window.binotelChatWidget:", window.binotelChatWidget);

      const showEl = (el: HTMLElement) => {
        el.style.removeProperty("display");
        el.style.removeProperty("visibility");
        el.style.setProperty("display", "flex", "important");
        el.style.setProperty("visibility", "visible", "important");
      };

      if (launcher) {
        // Step 1: show and click the main launcher button
        console.log("[binotel] step1: clicking bwc-widget-action");
        showEl(launcher);
        launcher.click();

        // Step 2: after panel expands, find and click the chat option inside it
        setTimeout(() => {
          // Log all buttons inside the Binotel panel to find the chat one
          const allBtns = document.querySelectorAll("[id^='bwc'] button, [class^='bwc'] button, [class*=' bwc'] button");
          console.log("[binotel] step2: all bwc buttons:", Array.from(allBtns).map(b => `${(b as HTMLElement).className} | ${b.textContent?.trim().slice(0,40)}`));

          // Try to find the chat/message button (not the call button)
          const chatOpener =
            document.querySelector<HTMLElement>("[id='bwc-chat-button'], [class*='bwc-chat-button']") ||
            Array.from(document.querySelectorAll<HTMLElement>("[id^='bwc'] button, [class*='bwc'] button"))
              .find(b => {
                const txt = b.textContent?.toLowerCase() ?? "";
                const cls = b.className?.toLowerCase() ?? "";
                return txt.includes("чат") || txt.includes("зв'язку") || txt.includes("допоможу") ||
                       cls.includes("chat") || cls.includes("message") || cls.includes("online");
              }) || null;

          console.log("[binotel] step2: chatOpener found:", chatOpener);
          if (chatOpener) {
            chatOpener.click();
            console.log("[binotel] step2: clicked chatOpener");
          } else {
            // Last resort: click cloud message if it now has content
            const cm = document.getElementById("bwc-chat-cloud-message");
            console.log("[binotel] step2: bwc-chat-cloud-message container children:", cm?.querySelector(".bwc-container")?.children.length);
            if (cm) { showEl(cm); cm.click(); }
          }
        }, 400);
      } else if (chatMsg) {
        console.log("[binotel] clicking bwc-chat-cloud-message directly (no launcher)");
        showEl(chatMsg);
        chatMsg.click();
        console.log("[binotel] clicked bwc-chat-cloud-message");
      } else if (typeof window.binotelChatWidget?.open === "function") {
        console.log("[binotel] using window.binotelChatWidget.open()");
        window.binotelChatWidget.open();
      } else {
        console.warn("[binotel] NO BINOTEL ELEMENT OR API FOUND — widget may not be loaded");
      }

      if (prefill) {
        const injectText = (text: string, attempt = 0) => {
          const input = document.querySelector<HTMLTextAreaElement | HTMLInputElement>(
            "#bwc-chat-input, " +
            "textarea[placeholder*='повідомлення'], " +
            "input[placeholder*='повідомлення'], " +
            "[id*='bwc'] textarea, " +
            "[class*='bwc'] textarea, " +
            "[id*='bwc'] input[type='text']"
          );
          console.log(`[binotel] injectText attempt ${attempt}, input:`, input);
          if (input) {
            const proto = input instanceof HTMLTextAreaElement
              ? HTMLTextAreaElement.prototype
              : HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
            if (setter) setter.call(input, text); else input.value = text;
            input.focus();
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("[binotel] prefill injected:", text);
          } else if (attempt < 15) {
            setTimeout(() => injectText(text, attempt + 1), 300);
          } else {
            console.warn("[binotel] prefill FAILED — input not found after 15 attempts");
          }
        };
        setTimeout(() => injectText(prefill), 600);
      }
    };

    // Binotel loads lazily on first user interaction — wait if not ready yet
    const ready = document.getElementById("bwc-chat-cloud-message") ||
                  document.getElementById("bwc-widget-action") ||
                  typeof window.binotelChatWidget?.open === "function";
    console.log("[binotel] ready check:", !!ready, "— calling openChat", ready ? "now" : "after 800ms");
    if (ready) {
      openChat();
    } else {
      setTimeout(openChat, 800);
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

      <div className="fixed bottom-6 right-6 z-50" style={{ pointerEvents: "none" }}>
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
