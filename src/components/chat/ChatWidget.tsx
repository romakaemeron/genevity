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

      const chatBtn = document.querySelector<HTMLElement>('button[aria-label="Chat button"]');
      const isActive = chatBtn && !chatBtn.classList.contains("bwc-chat-inactive");
      console.log("[binotel] Chat button:", chatBtn, "active:", isActive);

      // GTM wraps history.pushState and crashes when Binotel passes a string as state.
      // Patch pushState to coerce string states to objects before clicking.
      const _origPushState = history.pushState;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (history as any).pushState = function(state: unknown, title: string, url?: string | URL | null) {
        const safeState = typeof state === "string" ? { binotel: state } : state;
        console.log("[binotel] pushState patched, state was:", typeof state);
        return _origPushState.call(history, safeState, title, url);
      };
      setTimeout(() => {
        (history as any).pushState = _origPushState;
        console.log("[binotel] pushState restored");
      }, 2000);

      if (chatBtn && launcher) {
        showEl(launcher);
        console.log("[binotel] clicking Chat button");
        chatBtn.click();
        console.log("[binotel] clicked Chat button");
      } else if (launcher) {
        console.log("[binotel] no chat btn — clicking launcher");
        showEl(launcher);
        launcher.click();
      } else if (typeof window.binotelChatWidget?.open === "function") {
        console.log("[binotel] using window.binotelChatWidget.open()");
        window.binotelChatWidget.open();
      } else {
        console.warn("[binotel] NO BINOTEL ELEMENT OR API FOUND");
      }

      if (prefill) {
        const findChatInput = () =>
          document.querySelector<HTMLTextAreaElement | HTMLInputElement>(
            "textarea[placeholder*='повідомлення'], input[placeholder*='повідомлення']"
          ) ||
          Array.from(document.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(
            "[id*='bwc'] textarea, [class*='bwc'] textarea, [id*='bwc'] input[type='text'], [class*='bwc'] input[type='text']"
          )).find(el => el.id !== "estimate-form-input") ||
          null;

        const injectText = (text: string, attempt = 0) => {
          const input = findChatInput();
          console.log(`[binotel] injectText attempt ${attempt}`, input ? `found: ${input.tagName}#${input.id}.${input.className}` : "NOT FOUND");

          if (!input) {
            if (attempt < 25) setTimeout(() => injectText(text, attempt + 1), 300);
            else console.warn("[binotel] prefill FAILED — input not found after 25 attempts");
            return;
          }

          input.focus();

          // Native value setter + input event — works for React/Vue/plain JS controlled inputs
          const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
          if (nativeSetter) { nativeSetter.call(input, text); } else { input.value = text; }
          input.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          console.log(`[binotel] after native setter: "${input.value}"`);

          // Fallback: execCommand (works on non-framework plain textareas)
          if (!input.value) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            document.execCommand("insertText", false, text);
            console.log(`[binotel] after execCommand: "${input.value}"`);
          }

          if (!input.value) {
            console.warn("[binotel] value still empty after injection attempts");
            if (attempt < 5) setTimeout(() => injectText(text, attempt + 1), 400);
            return;
          }

          // Send: first try Enter key (most reliable for chat UIs), then send button click
          setTimeout(() => {
            console.log(`[binotel] pre-send value: "${input.value}"`);
            if (!input.value) return;

            // Enter keydown — many chat widgets send on Enter
            const enterEvt = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true });
            const prevented = !input.dispatchEvent(enterEvt);
            console.log("[binotel] Enter keydown dispatched, prevented:", prevented);
            input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));

            // Also click send button 300ms later as backup
            setTimeout(() => {
              const sendBtn = document.querySelector<HTMLElement>(
                "button.bwc-btn-send, [class*='bwc-send'], form[class*='bwc'] button[type='submit'], [id*='bwc'] button[type='submit'], [class*='bwc'] button[type='submit']"
              );
              console.log("[binotel] send button:", sendBtn ? `found: ${sendBtn.className}` : "NOT FOUND", "input value:", input.value);
              if (sendBtn) { sendBtn.click(); console.log("[binotel] clicked send button"); }
            }, 300);
          }, 200);
        };

        setTimeout(() => injectText(prefill), 1500);
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
