"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { SearchResult } from "@/app/api/search/route";

const POPULAR_TAGS = [
  "Ботулінотерапія", "EMFACE", "Лазерна епіляція",
  "Check-Up 40+", "IV-терапія", "Hydrafacial",
];

const CATEGORY_SHORTCUTS = [
  { label: "Ін'єкції",  path: "/services/injectable-cosmetology" },
  { label: "Апаратна",  path: "/services/apparatus-cosmetology" },
  { label: "Longevity", path: "/services/longevity/check-up-40" },
  { label: "Лікарі",    path: "/doctors" },
];

const GROUP_LABELS: Record<SearchResult["type"], string> = {
  service:  "Процедури",
  category: "Розділи",
  doctor:   "Лікарі",
  page:     "Сторінки",
};

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ backgroundColor: "#fde68a", borderRadius: 2, padding: "0 1px" }} className="not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;
    type W = typeof window & { __modalLock?: { count: number; scrollY: number } };
    const w = window as W;
    if (!w.__modalLock) {
      const scrollY = window.scrollY;
      w.__modalLock = { count: 0, scrollY };
      document.body.style.cssText += ";position:fixed;top:-" + scrollY + "px;left:0;right:0;overflow:hidden";
    }
    w.__modalLock.count++;
    return () => {
      if (!w.__modalLock) return;
      w.__modalLock.count--;
      if (w.__modalLock.count <= 0) {
        const y = w.__modalLock.scrollY;
        delete w.__modalLock;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, y);
      }
    };
  }, [isOpen]);

  // Debounced fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
      setActiveIndex(-1);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, locale]);

  const navigate = useCallback((path: string) => {
    const prefix = locale === "ua" ? "" : `/${locale}`;
    router.push(`${prefix}${path}`);
    onClose();
  }, [router, locale, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (!results.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        navigate(results[activeIndex].path);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, results, activeIndex, navigate, onClose]);

  const order: SearchResult["type"][] = ["service", "category", "doctor", "page"];
  const grouped = order
    .map(type => ({ type, items: results.filter(r => r.type === type) }))
    .filter(g => g.items.length > 0);

  let flatIdx = 0;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center px-4"
          style={{ paddingTop: "12vh" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-xl rounded-2xl flex flex-col overflow-hidden"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
              maxHeight: "75vh",
            }}
            initial={{ scale: 0.96, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Input row */}
            <div
              className="flex items-center gap-3 px-4"
              style={{ paddingTop: 14, paddingBottom: 14, borderBottom: "1px solid #f0ede8" }}
            >
              <svg className="shrink-0" style={{ color: "#8B7B6B" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Пошук послуг, лікарів..."
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 14, color: "#2a2520" }}
                autoComplete="off"
                spellCheck={false}
              />
              {loading && (
                <svg className="animate-spin shrink-0" style={{ color: "rgba(0,0,0,0.2)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              )}
              <kbd
                className="shrink-0"
                style={{ fontSize: 10, color: "rgba(0,0,0,0.3)", backgroundColor: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4, padding: "2px 6px" }}
              >
                ESC
              </kbd>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-2 py-2">

              {/* Empty state */}
              {query.length < 2 && (
                <div className="px-2 py-2">
                  <p
                    className="px-2 mb-2"
                    style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(0,0,0,0.35)", paddingTop: 4, paddingBottom: 4 }}
                  >
                    Популярні запити
                  </p>
                  <div className="flex flex-wrap gap-2 px-1 mb-5">
                    {POPULAR_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setQuery(tag)}
                        style={{
                          fontSize: 11,
                          backgroundColor: "#f5f0eb",
                          color: "#8B7B6B",
                          borderRadius: 999,
                          padding: "6px 12px",
                          border: "none",
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#ece5dd")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#f5f0eb")}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <p
                    className="px-2 mb-2"
                    style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(0,0,0,0.35)", paddingTop: 4, paddingBottom: 4 }}
                  >
                    Розділи
                  </p>
                  <div className="grid grid-cols-4 gap-2 px-1">
                    {CATEGORY_SHORTCUTS.map(c => (
                      <button
                        key={c.path}
                        type="button"
                        onClick={() => navigate(c.path)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                          padding: "10px 8px",
                          borderRadius: 12,
                          backgroundColor: "#faf9f6",
                          border: "1px solid #f0ede8",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f0eb")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#faf9f6")}
                      >
                        <span style={{ fontSize: 11, color: "rgba(0,0,0,0.6)", lineHeight: 1.3 }}>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="flex flex-col items-center py-10 gap-3 text-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "rgba(0,0,0,0.2)" }}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <p style={{ fontSize: 14, color: "rgba(0,0,0,0.4)" }}>
                    Нічого не знайдено за запитом{" "}
                    <span style={{ color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>«{query}»</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/services")}
                    style={{ fontSize: 12, color: "#8B7B6B", textDecoration: "underline", textUnderlineOffset: 3, background: "none", border: "none", cursor: "pointer" }}
                  >
                    Переглянути всі послуги →
                  </button>
                </div>
              )}

              {/* Grouped results */}
              {grouped.map(group => (
                <div key={group.type} className="mb-1">
                  <p
                    className="px-3 py-1"
                    style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(0,0,0,0.3)" }}
                  >
                    {GROUP_LABELS[group.type]}
                  </p>
                  {group.items.map(result => {
                    const idx = flatIdx++;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={`${result.type}-${result.path}`}
                        type="button"
                        onClick={() => navigate(result.path)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 10,
                          backgroundColor: isActive ? "#f5f0eb" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background-color 0.1s",
                        }}
                        onMouseLeave={e => {
                          if (idx !== activeIndex) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div
                          className="shrink-0 flex items-center justify-center"
                          style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#f0ede8" }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B7B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {result.type === "service"  && <><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></>}
                            {result.type === "category" && <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>}
                            {result.type === "doctor"   && <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>}
                            {result.type === "page"     && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate" style={{ fontSize: 13, fontWeight: 500, color: "#2a2520" }}>
                            <Highlight text={result.title} query={query} />
                          </p>
                          {result.subtitle && (
                            <p className="truncate" style={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>{result.subtitle}</p>
                          )}
                        </div>
                        {isActive && (
                          <svg className="shrink-0" style={{ color: "rgba(0,0,0,0.2)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer hints */}
            {results.length > 0 && (
              <div
                className="flex items-center gap-4 px-4"
                style={{ borderTop: "1px solid #f0ede8", paddingTop: 8, paddingBottom: 8 }}
              >
                <span style={{ fontSize: 10, color: "rgba(0,0,0,0.25)" }}>↑↓ навігація</span>
                <span style={{ fontSize: 10, color: "rgba(0,0,0,0.25)" }}>↵ перейти</span>
                <span style={{ fontSize: 10, color: "rgba(0,0,0,0.25)" }}>ESC закрити</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
