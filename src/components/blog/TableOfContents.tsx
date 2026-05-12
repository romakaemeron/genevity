"use client";
import { useEffect, useState } from "react";
import type { TocItem } from "./ArticleBody";

export default function TableOfContents({ items, labels }: { items: TocItem[]; labels: { title: string } }) {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (items.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => { const visible = entries.find((e) => e.isIntersecting); if (visible) setActive(visible.target.id); },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    items.forEach((item) => { const el = document.getElementById(item.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="bg-champagne-dark rounded-[var(--radius-card)] p-6 sticky top-28">
      <p className="body-strong text-black mb-4">{labels.title}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: item.level === 3 ? "1rem" : 0 }}>
            <a
              href={`#${item.id}`}
              className={`body-s leading-relaxed hover:text-main transition-colors duration-200 ${active === item.id ? "text-main font-medium" : "text-black-60"}`}
              onClick={(e) => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
