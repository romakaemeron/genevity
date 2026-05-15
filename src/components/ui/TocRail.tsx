"use client";

import { useState, useEffect } from "react";

interface TocItem {
  key: string;
  label: string;
}

interface Props {
  items: TocItem[];
}

export default function TocRail({ items }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const elements = items
      .map((item) => ({
        key: item.key,
        el: document.getElementById(`section-${item.key}`),
      }))
      .filter((e) => e.el);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const match = elements.find((e) => e.el === entry.target);
            if (match) setActiveKey(match.key);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    for (const { el } of elements) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="hidden lg:block sticky top-28 self-start w-48 shrink-0">
      <ul className="flex flex-col gap-0.5 border-l border-line pl-3">
        {items.map((item) => (
          <li key={item.key}>
            <a
              href={`#section-${item.key}`}
              className={`block body-s py-1 transition-colors duration-200 ${
                activeKey === item.key
                  ? "text-main font-semibold"
                  : "text-muted hover:text-black"
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`section-${item.key}`)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
