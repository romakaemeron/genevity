"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import SiriOrb from "./SiriOrb";
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
  const [isOrbLabelCollapsed, setIsOrbLabelCollapsed] = useState(false);
  const [isOrbHovered, setIsOrbHovered] = useState(false);
  const [chatEverOpened, setChatEverOpened] = useState(false);
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  const locale = seg === "ru" ? "ru" : seg === "en" ? "en" : "uk";
  const [escalationTarget, setEscalationTarget] = useState<"genevity" | "helyos">("genevity");
  const [escalationSummary, setEscalationSummary] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [escalationResetKey, setEscalationResetKey] = useState(0);
  const [binotelLoaded, setBinotelLoaded] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      setIsAdmin(true);
      return;
    }
    setPageUrl(window.location.href);
    setPageTitle(document.title);
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
          setBinotelLoaded(true);
        }
      });
    };

    hideKnown();

    const observer = new MutationObserver(hideKnown);
    binotelObserverRef.current = observer;
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); binotelObserverRef.current = null; };
  }, []);

  useEffect(() => {
    if (view !== "closed") return;
    setIsOrbLabelCollapsed(false);
    const t = setTimeout(() => setIsOrbLabelCollapsed(true), 4400);
    return () => clearTimeout(t);
  }, [view]);

  const showOrbLabel = !isOrbLabelCollapsed || isOrbHovered;

  const orbLabels = {
    uk: { title: "AI Асистент", sub: "Запитати про послуги" },
    ru: { title: "AI Ассистент", sub: "Задать вопрос" },
    en: { title: "AI Assistant", sub: "Ask about services" },
  };
  const orbLabel = orbLabels[locale as keyof typeof orbLabels] ?? orbLabels.uk;

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

    if (sessionToken) {
      fetch("/api/chat/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      }).catch(() => {});
    }

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
        const injectPrefill = (text: string, attempt = 0) => {
          // Check Binotel mode: offline form vs online chat
          const bwcChat = document.getElementById("bwc-chat");
          const isOffline = !bwcChat || bwcChat.classList.contains("bwc-chat-hide") || bwcChat.classList.contains("bwc-form-offline");

          if (isOffline) {
            // Offline mode: target the textarea in the contact form
            const textarea = document.querySelector<HTMLTextAreaElement>("textarea#bnt-of-message, textarea[name='message']");
            if (!textarea) {
              if (attempt < 20) setTimeout(() => injectPrefill(text, attempt + 1), 300);
              else console.warn("[binotel] offline textarea not found after 20 attempts");
              return;
            }
            textarea.focus();
            textarea.value = text;
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
            textarea.dispatchEvent(new Event("change", { bubbles: true }));
            console.log(`[binotel] offline textarea prefilled: "${text}"`);
            return;
          }

          // Online mode: contenteditable chat input
          const chatInput = document.querySelector<HTMLElement>("div.bwc-message[contenteditable]");
          if (!chatInput) {
            if (attempt < 20) setTimeout(() => injectPrefill(text, attempt + 1), 300);
            else console.warn("[binotel] online contenteditable not found after 20 attempts");
            return;
          }

          // Use Selection API — safe, doesn't affect other focused elements
          chatInput.focus();
          const range = document.createRange();
          range.selectNodeContents(chatInput);
          range.collapse(false);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          const textNode = document.createTextNode(text);
          range.insertNode(textNode);
          chatInput.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
          console.log(`[binotel] online contenteditable prefilled: "${chatInput.textContent}"`);

          if (!chatInput.textContent?.trim()) {
            if (attempt < 5) setTimeout(() => injectPrefill(text, attempt + 1), 400);
            return;
          }

          // Auto-send
          setTimeout(() => {
            const sendBtn = document.querySelector<HTMLElement>("div.bwc-send, [class*='bwc-send']");
            if (sendBtn) { sendBtn.click(); return; }
            chatInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true }));
            chatInput.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
          }, 200);
        };

        setTimeout(() => injectPrefill(prefill), 1500);
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
            onMouseEnter={() => setIsOrbHovered(true)}
            onMouseLeave={() => setIsOrbHovered(false)}
            className="fixed z-[2147483647]"
            style={{
              right: 24,
              bottom: 96,
              transition: "bottom 300ms ease",
              display: "flex",
              alignItems: "center",
              border: 0,
              padding: 0,
              background: "transparent",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
            aria-label="Відкрити AI асистента"
          >
            {/* Slide-out label pill */}
            <span style={{
              background: "var(--color-champagne)",
              color: "#2A2520",
              border: "1px solid #E6E0D6",
              borderRight: "none",
              borderRadius: "999px 0 0 999px",
              boxShadow: "0 8px 24px -10px rgba(42,37,32,0.18)",
              height: 60,
              display: "flex",
              alignItems: "center",
              gap: 12,
              maxWidth: showOrbLabel ? 320 : 0,
              opacity: showOrbLabel ? 1 : 0,
              paddingLeft: showOrbLabel ? 22 : 0,
              paddingRight: showOrbLabel ? 52 : 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              pointerEvents: showOrbLabel ? "auto" : "none",
              transition: "max-width 420ms cubic-bezier(.6,0,.2,1), opacity 240ms ease, padding 420ms cubic-bezier(.6,0,.2,1)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5A8A6A", boxShadow: "0 0 0 4px rgba(90,138,106,0.18)", flexShrink: 0 }} />
              <span>
                <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.005em", display: "block" }}>{orbLabel.title}</span>
                <span style={{ color: "#6B6359", fontSize: 12.5 }}>{orbLabel.sub}</span>
              </span>
            </span>
            {/* Orb */}
            <span style={{
              position: "relative",
              width: 84,
              height: 84,
              borderRadius: "50%",
              boxShadow: "0 18px 40px -14px rgba(42,37,32,0.26)",
              isolation: "isolate",
              flexShrink: 0,
              marginLeft: -42,
              zIndex: 1,
            }}>
              <SiriOrb />
              {/* Glass disc + logo */}
              <span style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "65%",
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                zIndex: 1,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(2px) saturate(100%)",
                WebkitBackdropFilter: "blur(2px) saturate(100%)",
                border: "1px solid rgba(245,240,232,0.60)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 18px -6px rgba(42,37,32,0.22)",
                color: "var(--color-black)",
              }}>
                <svg viewBox="0 0 510 1231" fill="currentColor" style={{ width: "75%", height: "75%" }} aria-hidden="true">
                  <path d="M478.616 773.3C443.806 698.75 379.676 648.63 311.556 602.52L286.626 618.68L286.656 618.71C355.146 662.91 419.856 710.32 457.276 783.62C490.786 853.97 500.326 940.87 468.886 1013.51C429.956 1094.97 366.916 1163.85 294.706 1217.78L303.586 1230.11C375.156 1178.9 437.316 1112.8 480.136 1035.22C522.976 955.25 515.806 854.1 478.616 773.31V773.3Z" />
                  <path d="M316.446 567.41C329.576 558.37 342.436 549.15 354.846 539.56C415.656 494.33 471.096 431.87 492.616 358.02C499.976 332.69 501.576 310.24 501.096 302.66C500.436 292.69 493.066 283.9 484.006 280.92C478.056 278.63 469.976 279.75 463.996 279.48H236.766L241.926 295.75H463.996C466.996 295.91 476.726 295.3 478.716 296.25C482.726 297.58 484.966 301.33 484.486 305.21C483.766 328.12 480.656 333.51 473.406 355.01C465.036 379.94 452.626 403.51 436.996 424.85C391.786 486.53 325.296 527.12 257.866 566.85H257.836C185.206 518.67 108.956 465.04 73.7356 382.01C36.3956 294.07 53.3556 198.98 113.656 125.68C140.016 93.63 171.756 66.95 205.716 42.92L175.076 0C132.366 31.01 93.3256 65.59 64.8656 113.53C22.6056 184.78 5.89561 271.71 28.0856 352.4C59.1556 465.48 142.766 526.66 230.516 582.92C181.876 611.73 134.206 641.49 95.2156 679.87C23.8556 747.29 -11.4044 839.97 3.28562 936.78H56.7856C43.6056 876.08 54.0256 809.88 87.6156 757.15C118.656 708.25 162.796 671.33 210.456 637.98C227.466 626.05 244.926 614.59 262.386 603.19H262.416C270.896 597.66 279.376 592.14 287.796 586.61C297.416 580.26 307.006 573.88 316.446 567.4V567.41Z" />
                </svg>
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-7 z-[2147483647]" style={{ pointerEvents: "none" }}>
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
            escalationResetKey={escalationResetKey}
          />
        )}
        <AnimatePresence mode="wait">
          {view === "escalation" && (
            <ChatEscalation
              key="escalation"
              target={escalationTarget}
              summary={escalationSummary}
              onClose={() => setView("closed")}
              onBack={() => { setView("chat"); setEscalationResetKey(k => k + 1); }}
              onOpenBinotel={handleOpenBinotel}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
