import { Eye } from "lucide-react";

const L: Record<string, { label: string; exit: string }> = {
  ua: { label: "Режим передперегляду — цю сторінку не опубліковано", exit: "Вийти" },
  ru: { label: "Режим предпросмотра — страница не опубликована", exit: "Выйти" },
  en: { label: "Preview mode — this page is not published", exit: "Exit" },
};

// Height in px, kept in sync with the top offset MegaMenuHeader (and the
// article page's content padding) apply when this banner is present.
export const PREVIEW_BANNER_HEIGHT = 40;

export default function PreviewBanner({ locale, postId }: { locale: string; postId: string }) {
  const t = L[locale] ?? L.ua;
  return (
    <div
      className="fixed top-0 inset-x-0 z-[1000] flex items-center justify-center gap-2 sm:gap-3 overflow-hidden bg-main px-3 sm:px-4 text-white text-xs sm:text-sm"
      style={{ height: PREVIEW_BANNER_HEIGHT }}
    >
      <Eye size={14} className="shrink-0" />
      <span className="min-w-0 truncate">{t.label}</span>
      <a
        href={`/api/admin/preview/exit?id=${postId}`}
        className="shrink-0 whitespace-nowrap underline underline-offset-2"
      >
        {t.exit}
      </a>
    </div>
  );
}
