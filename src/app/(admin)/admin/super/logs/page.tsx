import { getChangeLogs } from "../../_actions/super";
import { AdminPageHeader } from "../../_components/admin-list";
import { Clock, User } from "lucide-react";

// ── Labels ───────────────────────────────────────────────────────────────────
const ACTION_STYLE: Record<string, { badge: string; label: string }> = {
  create: { badge: "bg-emerald-100 text-emerald-700", label: "Створено" },
  update: { badge: "bg-main/12 text-main",            label: "Оновлено" },
  delete: { badge: "bg-red-100 text-red-600",         label: "Видалено" },
};

const ENTITY_LABELS: Record<string, string> = {
  cms_user: "Користувач", service: "Послуга", doctor: "Лікар",
  equipment: "Апарат", static_page: "Сторінка", sections: "Розділи контенту",
  faq: "FAQ", ui_string: "UI-текст", site_settings: "Налаштування",
  hero: "Hero", about: "Про нас", hero_slide: "Слайд", gallery_item: "Галерея",
  legal_doc: "Документ", price_item: "Ціна", form_submission: "Заявка",
};

const FIELD_LABELS: Record<string, string> = {
  name_uk: "Ім'я (UA)", name_ru: "Ім'я (RU)", name_en: "Name (EN)",
  title_uk: "Назва (UA)", title_ru: "Назва (RU)", title_en: "Title (EN)",
  role_uk: "Посада (UA)", role_ru: "Посада (RU)", role_en: "Role (EN)",
  experience_uk: "Досвід (UA)", experience_ru: "Досвід (RU)", experience_en: "Experience (EN)",
  bio_uk: "Біо (UA)", seo_title_uk: "SEO-заголовок",
  h1_uk: "H1 (UA)", h1_ru: "H1 (RU)", h1_en: "H1 (EN)",
  summary_uk: "Анотація (UA)", summary_ru: "Анотація (RU)", summary_en: "Summary (EN)",
  short_description_uk: "Коротко (UA)", short_description_ru: "Коротко (RU)",
  description_uk: "Опис (UA)", description_ru: "Опис (RU)",
  seo_title_ru: "SEO-заголовок (RU)", seo_title_en: "SEO title (EN)",
  seo_desc_uk: "SEO-опис (UA)", seo_desc_ru: "SEO-опис (RU)", seo_desc_en: "SEO desc (EN)",
  price_from_uk: "Ціна від (UA)", price_from_ru: "Ціна від (RU)", price_from_en: "Price from (EN)",
  slug: "Slug", sort_order: "Порядок",
  phone1: "Телефон 1", phone2: "Телефон 2", instagram: "Instagram",
  address_uk: "Адреса (UA)", address_ru: "Адреса (RU)",
  hours_uk: "Години (UA)", hours_ru: "Години (RU)",
  name: "Ім'я", email: "Email", role: "Роль",
};

// Filter tabs definition
const FILTER_TABS: { key: string; label: string }[] = [
  { key: "", label: "Всі" },
  { key: "doctor", label: "Лікарі" },
  { key: "service", label: "Послуги" },
  { key: "equipment", label: "Апарати" },
  { key: "static_page", label: "Сторінки" },
  { key: "sections", label: "Розділи" },
  { key: "site_settings", label: "Налаштування" },
  { key: "ui_string", label: "UI-тексти" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fl(k: string) {
  return FIELD_LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function tv(v: unknown, max = 100): string {
  if (v === null || v === undefined || v === "") return "—";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "щойно";
  if (m < 60) return `${m} хв тому`;
  if (h < 24) return `${h} год тому`;
  if (d < 7) return `${d} д тому`;
  return null;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function computeChangedFields(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): string[] {
  if (!before || !after) return [];
  const norm = (v: unknown) => (v === null || v === undefined || v === "") ? null : v;
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  return keys.filter(k => JSON.stringify(norm(before[k])) !== JSON.stringify(norm(after[k])));
}

function changeSummary(
  action: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): { text: string; hasTrackedChanges: boolean } {
  if (action === "create") return { text: "Новий запис", hasTrackedChanges: true };
  if (action === "delete") return { text: "Запис видалено", hasTrackedChanges: true };

  const changed = computeChangedFields(before, after);
  if (changed.length === 0) {
    return { text: "Збережено — зображення, позиціонування або інші поля", hasTrackedChanges: false };
  }
  const labels = changed.slice(0, 3).map(fl);
  const suffix = changed.length > 3 ? ` + ще ${changed.length - 3}` : "";
  return { text: labels.join(", ") + suffix, hasTrackedChanges: true };
}

// ── Diff views ───────────────────────────────────────────────────────────────
const SECTION_TYPE_LABELS: Record<string, string> = {
  text_block: "Текст", image_text: "Зображення + Текст", gallery: "Галерея",
  steps: "Кроки", benefits: "Переваги", video: "Відео", cta: "CTA",
  faq: "FAQ", rich_text: "Rich text", hero: "Hero",
};

function sectionExcerpt(s: { type: string; data: any }): string {
  const d = s.data ?? {};
  for (const k of ["heading", "title", "text", "subtitle", "label", "question"]) {
    const v = d[k];
    if (typeof v === "string" && v.trim()) return v.trim().slice(0, 60);
    if (typeof v === "object" && v?.uk) return String(v.uk).slice(0, 60);
  }
  return SECTION_TYPE_LABELS[s.type] ?? s.type;
}

function ArrayDiff({ beforeArr, afterArr, label }: { beforeArr: any[]; afterArr: any[]; label: (item: any) => string }) {
  const prevMap = new Map(beforeArr.map(s => [s.id ?? null, s]));
  const nextMap = new Map(afterArr.map(s => [s.id ?? null, s]));

  const rows: { status: "+" | "−" | "~" | "="; text: string }[] = [];
  for (const item of afterArr) {
    const prev = item.id ? prevMap.get(item.id) : null;
    if (!prev) rows.push({ status: "+", text: label(item) });
    else rows.push({ status: JSON.stringify(prev) === JSON.stringify(item) ? "=" : "~", text: label(item) });
  }
  for (const item of beforeArr) {
    if (item.id && !nextMap.has(item.id)) rows.push({ status: "−", text: label(item) });
  }

  const visible = rows.filter(r => r.status !== "=");
  if (!visible.length) {
    return <p className="text-xs text-muted italic">{rows.length} елем. — вміст не змінився</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      {visible.map((r, i) => (
        <div key={i} className={`flex gap-2 text-xs rounded px-2 py-1.5 ${
          r.status === "+" ? "bg-emerald-50 border border-emerald-200" :
          r.status === "−" ? "bg-red-50 border border-red-200" : "bg-main/6 border border-main/20"
        }`}>
          <span className={`font-bold shrink-0 ${r.status === "+" ? "text-emerald-600" : r.status === "−" ? "text-red-500" : "text-main"}`}>{r.status}</span>
          <span className={r.status === "−" ? "line-through text-red-400" : "text-ink/80"}>{r.text}</span>
        </div>
      ))}
      {rows.filter(r => r.status === "=").length > 0 && (
        <p className="text-[10px] text-muted pl-1">+ {rows.filter(r => r.status === "=").length} без змін</p>
      )}
    </div>
  );
}

function DiffView({ before, after }: { before: Record<string, unknown> | null; after: Record<string, unknown> | null }) {
  const bSections = Array.isArray((before as any)?.sections) ? (before as any).sections as any[] : null;
  const aSections = Array.isArray((after as any)?.sections) ? (after as any).sections as any[] : null;
  if (bSections || aSections) {
    return <ArrayDiff beforeArr={bSections ?? []} afterArr={aSections ?? []} label={s => `${SECTION_TYPE_LABELS[s.type] ?? s.type} — ${sectionExcerpt(s)}`} />;
  }

  const bItems = Array.isArray((before as any)?.items) ? (before as any).items as any[] : null;
  const aItems = Array.isArray((after as any)?.items) ? (after as any).items as any[] : null;
  if (bItems || aItems) {
    return <ArrayDiff beforeArr={bItems ?? []} afterArr={aItems ?? []} label={f => (f.question_uk || f.question_ru || f.question_en || "—").slice(0, 80)} />;
  }

  if (!before && after) {
    return (
      <div className="flex flex-col gap-1.5">
        {Object.entries(after).filter(([, v]) => v !== null && v !== "" && v !== undefined).map(([k, v]) => (
          <div key={k} className="grid grid-cols-[200px_1fr] gap-2 text-xs">
            <span className="text-muted shrink-0">{fl(k)}</span>
            <span className="text-emerald-600 break-words">{tv(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (before && !after) {
    return (
      <div className="flex flex-col gap-1.5">
        {Object.entries(before).filter(([, v]) => v !== null && v !== "" && v !== undefined).map(([k, v]) => (
          <div key={k} className="grid grid-cols-[200px_1fr] gap-2 text-xs">
            <span className="text-muted shrink-0">{fl(k)}</span>
            <span className="text-red-400 line-through break-words">{tv(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (before && after) {
    const changed = computeChangedFields(before, after);
    if (!changed.length) {
      return (
        <p className="text-xs text-muted italic">
          Відстежувані поля не змінились. Могли бути оновлені: фото, фокусна точка, масштаб, SEO або інші поля.
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        {changed.map(k => (
          <div key={k} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">{fl(k)}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs break-words">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400 block mb-1">Було</span>
                {tv((before as any)[k])}
              </div>
              <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs break-words">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 block mb-1">Стало</span>
                {tv((after as any)[k])}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const { page: pageStr, type } = await searchParams;
  const page = Math.max(0, Number(pageStr ?? 0));
  const entityType = type || undefined;
  const { rows, total } = await getChangeLogs(page, 50, entityType);
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Журнал змін"
        subtitle={`${total} подій — хто, що та коли змінив`}
      />

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap gap-1.5 mb-4">
        {FILTER_TABS.map(tab => (
          <a
            key={tab.key}
            href={tab.key ? `?type=${tab.key}` : "?"}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (entityType ?? "") === tab.key
                ? "bg-main text-champagne"
                : "bg-champagne-dark text-muted hover:text-ink hover:bg-champagne-darker"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 text-center py-16 rounded-2xl border border-line bg-champagne-dark text-muted body-m">
          Змін не знайдено.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row: any) => {
            const entityLabel = ENTITY_LABELS[row.entity_type] ?? row.entity_type;
            const actionMeta = ACTION_STYLE[row.action] ?? { badge: "bg-muted/10 text-muted", label: row.action };
            const hasDiff = row.diff_before != null || row.diff_after != null;
            const summary = changeSummary(row.action, row.diff_before, row.diff_after);
            const rel = relativeTime(row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at);
            const dateStr = formatDate(row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at);
            const autoOpen = isToday(row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at);

            return (
              <div key={row.id} className="rounded-xl border border-line bg-white p-4 flex flex-col gap-3">
                {/* Header row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full shrink-0 ${actionMeta.badge}`}>
                    {actionMeta.label}
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {entityLabel}{row.entity_label ? ` · ${row.entity_label}` : ""}
                  </span>
                  <div className="flex-1" />
                  <span className="flex items-center gap-1.5 text-xs text-muted whitespace-nowrap" title={dateStr}>
                    <Clock size={11} />
                    {rel ? <><span className="font-medium text-ink/70">{rel}</span><span className="text-black-30">· {dateStr}</span></> : dateStr}
                  </span>
                </div>

                {/* User + change summary */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <User size={11} />
                    <span className="font-medium text-ink/70">{row.user_name}</span>
                    <span className="text-black-30">{row.user_email}</span>
                  </span>
                  {hasDiff && (
                    <span className={`text-xs ${summary.hasTrackedChanges ? "text-ink/60" : "text-muted italic"}`}>
                      {summary.hasTrackedChanges ? "✎ " : "○ "}{summary.text}
                    </span>
                  )}
                </div>

                {/* Diff — auto-open for today's entries */}
                {hasDiff && (
                  <details open={autoOpen} className="group">
                    <summary className="text-xs text-muted cursor-pointer hover:text-ink transition-colors select-none list-none flex items-center gap-1.5 mb-2">
                      <span className="inline-block transition-transform group-open:rotate-90">▶</span>
                      {autoOpen ? "Сховати деталі" : "Показати деталі"}
                    </summary>
                    <div className="border-t border-line pt-3">
                      <DiffView
                        before={row.diff_before as Record<string, unknown> | null}
                        after={row.diff_after as Record<string, unknown> | null}
                      />
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 0 && (
            <a href={`?${entityType ? `type=${entityType}&` : ""}page=${page - 1}`}
              className="px-4 py-2 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:bg-champagne transition-colors">
              ← Назад
            </a>
          )}
          <span className="text-sm text-muted">Стор. {page + 1} / {totalPages}</span>
          {page < totalPages - 1 && (
            <a href={`?${entityType ? `type=${entityType}&` : ""}page=${page + 1}`}
              className="px-4 py-2 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:bg-champagne transition-colors">
              Далі →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
