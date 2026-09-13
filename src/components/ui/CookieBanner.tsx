"use client";

import { useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";

/**
 * Cookie notice. Acknowledgement only — it informs and dismisses, it does not
 * gate the tag manager or the Binotel widgets, which keep loading as before.
 *
 * Copy is hardcoded rather than CMS-managed: it is legal boilerplate that
 * changes about as often as the nav, and keeping it here avoids a round trip
 * through ui_strings on every page.
 */
const COPY = {
  uk: {
    text: "Ми використовуємо файли cookie, щоб сайт працював коректно та щоб розуміти, як ним користуються.",
    link: "Політика конфіденційності",
    button: "Зрозуміло",
    label: "Повідомлення про файли cookie",
  },
  ru: {
    text: "Мы используем файлы cookie, чтобы сайт работал корректно и чтобы понимать, как им пользуются.",
    link: "Политика конфиденциальности",
    button: "Понятно",
    label: "Уведомление о файлах cookie",
  },
  en: {
    text: "We use cookies so the site works properly and so we can understand how it is used.",
    link: "Privacy policy",
    button: "Got it",
    label: "Cookie notice",
  },
} as const;

/** Bump the suffix to show the notice again after a material copy change. */
const STORAGE_KEY = "genevity:cookie-notice:v1";
const CHANGE_EVENT = "genevity:cookie-notice";

/**
 * localStorage as an external store. `useSyncExternalStore` rather than
 * useEffect+setState: the acknowledgement lives outside React, and this keeps
 * the server render and the first client render agreeing that it is hidden.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "0";
  } catch {
    // Private mode or blocked storage: show the notice, and accept that it
    // returns next visit rather than breaking the page.
    return "0";
  }
}

/** Hidden on the server, so it can never flash for someone who dismissed it. */
function getServerSnapshot(): string {
  return "1";
}

export default function CookieBanner({ lang }: { lang: string }) {
  const acknowledged = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (acknowledged === "1") return null;

  const t = COPY[lang as keyof typeof COPY] ?? COPY.uk;

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Nothing to persist to — hide it for this page view at least.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <div
      role="region"
      aria-label={t.label}
      /* bottom-40 on small screens sits the card above the floating call
         button; on desktop the centred max-width keeps both corners free. */
      className="grid-enter motion-reduce:animate-none fixed inset-x-4 bottom-40 sm:inset-x-0 sm:bottom-6 z-[9999] sm:mx-auto sm:w-full sm:max-w-[720px] sm:px-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-[var(--radius-card)] bg-champagne border border-black-10 shadow-[0_12px_36px_-16px_rgba(42,37,32,0.28)] px-5 py-4 sm:px-6 sm:py-5">
        <p className="body-s text-black-60 flex-1">
          {t.text}{" "}
          <Link
            href="/legal/privacy-policy"
            className="text-main underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {t.link}
          </Link>
        </p>
        <Button variant="primary" size="md" onClick={dismiss} className="shrink-0">
          {t.button}
        </Button>
      </div>
    </div>
  );
}
