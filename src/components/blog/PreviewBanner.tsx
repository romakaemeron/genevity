import { Eye } from "lucide-react";

const L: Record<string, { label: string; exit: string }> = {
  ua: { label: "Режим передперегляду — цю сторінку не опубліковано", exit: "Вийти" },
  ru: { label: "Режим предпросмотра — страница не опубликована", exit: "Выйти" },
  en: { label: "Preview mode — this page is not published", exit: "Exit" },
};

export default function PreviewBanner({ locale, postId }: { locale: string; postId: string }) {
  const t = L[locale] ?? L.ua;
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-main px-4 py-2 text-white text-sm">
      <Eye size={14} />
      <span>{t.label}</span>
      <a href={`/api/admin/preview/exit?id=${postId}`} className="underline underline-offset-2">
        {t.exit}
      </a>
    </div>
  );
}
