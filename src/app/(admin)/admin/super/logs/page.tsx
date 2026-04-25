import { getChangeLogs } from "../../_actions/super";
import { AdminPageHeader } from "../../_components/admin-list";
import { Clock, User, FileText } from "lucide-react";

const ACTION_STYLE: Record<string, string> = {
  create: "bg-success/15 text-success",
  update: "bg-main/15 text-main",
  delete: "bg-error/15 text-error",
};

const ENTITY_LABELS: Record<string, string> = {
  cms_user: "User",
  service: "Service",
  doctor: "Doctor",
  equipment: "Equipment",
  static_page: "Page",
  sections: "Content Sections",
  faq: "FAQ",
  ui_string: "UI Text",
  site_settings: "Settings",
  hero: "Hero",
  about: "About",
  hero_slide: "Hero Slide",
  gallery_item: "Gallery",
  legal_doc: "Legal Doc",
  price_item: "Price",
  form_submission: "Form",
};

// Human-readable labels for snake_case field names
const FIELD_LABELS: Record<string, string> = {
  title_uk: "Title (UA)", title_ru: "Title (RU)", title_en: "Title (EN)",
  h1_uk: "H1 (UA)", h1_ru: "H1 (RU)", h1_en: "H1 (EN)",
  summary_uk: "Summary (UA)", summary_ru: "Summary (RU)", summary_en: "Summary (EN)",
  name_uk: "Name (UA)", name_ru: "Name (RU)", name_en: "Name (EN)",
  role_uk: "Role (UA)", role_ru: "Role (RU)", role_en: "Role (EN)",
  experience_uk: "Experience (UA)", experience_ru: "Experience (RU)", experience_en: "Experience (EN)",
  short_description_uk: "Short desc (UA)", short_description_ru: "Short desc (RU)", short_description_en: "Short desc (EN)",
  description_uk: "Description (UA)", description_ru: "Description (RU)", description_en: "Description (EN)",
  note_uk: "Note (UA)", note_ru: "Note (RU)", note_en: "Note (EN)",
  procedure_length_uk: "Duration (UA)", procedure_length_ru: "Duration (RU)", procedure_length_en: "Duration (EN)",
  effect_duration_uk: "Effect (UA)", effect_duration_ru: "Effect (RU)", effect_duration_en: "Effect (EN)",
  sessions_recommended_uk: "Sessions (UA)", sessions_recommended_ru: "Sessions (RU)", sessions_recommended_en: "Sessions (EN)",
  price_from_uk: "Price from (UA)", price_from_ru: "Price from (RU)", price_from_en: "Price from (EN)",
  price_unit_uk: "Price unit (UA)", price_unit_ru: "Price unit (RU)", price_unit_en: "Price unit (EN)",
  seo_title_uk: "SEO title (UA)", seo_title_ru: "SEO title (RU)", seo_title_en: "SEO title (EN)",
  seo_desc_uk: "SEO desc (UA)", seo_desc_ru: "SEO desc (RU)", seo_desc_en: "SEO desc (EN)",
  seo_keywords_uk: "SEO keywords (UA)", seo_keywords_ru: "SEO keywords (RU)", seo_keywords_en: "SEO keywords (EN)",
  slug: "Slug", category_id: "Category", sort_order: "Sort order",
  phone1: "Phone 1", phone2: "Phone 2", instagram: "Instagram", maps_url: "Maps URL",
  address_uk: "Address (UA)", address_ru: "Address (RU)", address_en: "Address (EN)",
  hours_uk: "Hours (UA)", hours_ru: "Hours (RU)", hours_en: "Hours (EN)",
  name: "Name", role: "Role", email: "Email", avatar: "Avatar", passwordReset: "Password",
};

function fieldLabel(k: string) {
  return FIELD_LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("uk-UA", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function truncate(s: string, n = 80) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function textVal(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

// ── Section excerpt ─────────────────────────────────────────────────────────
function sectionExcerpt(s: { type: string; data: any }): string {
  const d = s.data ?? {};
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = d[k];
      if (typeof v === "string" && v.trim()) return truncate(v.trim(), 70);
      if (typeof v === "object" && v?.uk) return truncate(String(v.uk), 70);
    }
    return "";
  };
  const text = pick("heading", "title", "text", "subtitle", "label", "question", "answer", "content");
  return text || s.type;
}

const SECTION_TYPE_LABELS: Record<string, string> = {
  text_block: "Text", image_text: "Image + Text", gallery: "Gallery",
  steps: "Steps", benefits: "Benefits", video: "Video",
  testimonial: "Testimonial", cta: "CTA", faq: "FAQ block",
  rich_text: "Rich text", hero: "Hero", team: "Team",
};

function sectionLabel(type: string) {
  return SECTION_TYPE_LABELS[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Array diff (sections / faq items) ───────────────────────────────────────
function ArrayDiff({
  beforeArr, afterArr, renderItem,
}: {
  beforeArr: any[];
  afterArr: any[];
  renderItem: (item: any) => string;
}) {
  // Match by id when available, otherwise by index
  const beforeById = new Map(beforeArr.map((s) => [s.id ?? null, s]));
  const afterById = new Map(afterArr.map((s) => [s.id ?? null, s]));

  const rows: { status: "added" | "removed" | "changed" | "same"; label: string; detail?: string }[] = [];

  // Items in after
  for (const item of afterArr) {
    const prev = item.id ? beforeById.get(item.id) : null;
    if (!prev) {
      rows.push({ status: "added", label: renderItem(item) });
    } else {
      const same = JSON.stringify(prev) === JSON.stringify(item);
      rows.push({ status: same ? "same" : "changed", label: renderItem(item) });
    }
  }

  // Items removed (in before but not after)
  for (const item of beforeArr) {
    if (item.id && !afterById.has(item.id)) {
      rows.push({ status: "removed", label: renderItem(item) });
    }
  }

  const visible = rows.filter((r) => r.status !== "same");

  if (visible.length === 0) {
    const sameCount = rows.length;
    return <p className="text-xs text-muted italic">{sameCount} item{sameCount !== 1 ? "s" : ""} — no content changes detected</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {visible.map((r, i) => (
        <div key={i} className={`flex items-start gap-2 text-xs rounded px-2 py-1.5 ${
          r.status === "added" ? "bg-success/8 border border-success/20" :
          r.status === "removed" ? "bg-error/8 border border-error/20" :
          "bg-main/8 border border-main/20"
        }`}>
          <span className={`font-bold shrink-0 ${
            r.status === "added" ? "text-success" :
            r.status === "removed" ? "text-error" : "text-main"
          }`}>
            {r.status === "added" ? "+" : r.status === "removed" ? "−" : "~"}
          </span>
          <span className={r.status === "removed" ? "line-through text-error/70" : "text-ink/80"}>
            {r.label}
          </span>
        </div>
      ))}
      {rows.filter((r) => r.status === "same").length > 0 && (
        <p className="text-[10px] text-muted pl-1 mt-0.5">
          + {rows.filter((r) => r.status === "same").length} unchanged
        </p>
      )}
    </div>
  );
}

// ── Main diff renderer ───────────────────────────────────────────────────────
function DiffView({ before, after }: {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}) {
  const normalize = (v: unknown) => (v === null || v === undefined || v === "") ? null : v;

  // Sections array diff
  const bSections = Array.isArray((before as any)?.sections) ? (before as any).sections as any[] : null;
  const aSections = Array.isArray((after as any)?.sections) ? (after as any).sections as any[] : null;
  if (bSections || aSections) {
    return (
      <ArrayDiff
        beforeArr={bSections ?? []}
        afterArr={aSections ?? []}
        renderItem={(s) => `${sectionLabel(s.type)} — ${sectionExcerpt(s)}`}
      />
    );
  }

  // FAQ items array diff
  const bItems = Array.isArray((before as any)?.items) ? (before as any).items as any[] : null;
  const aItems = Array.isArray((after as any)?.items) ? (after as any).items as any[] : null;
  if (bItems || aItems) {
    return (
      <ArrayDiff
        beforeArr={bItems ?? []}
        afterArr={aItems ?? []}
        renderItem={(f) => truncate(f.question_uk || f.question_ru || f.question_en || "—", 80)}
      />
    );
  }

  // Create: show non-empty after fields
  if (!before && after) {
    const entries = Object.entries(after).filter(([, v]) => normalize(v) !== null);
    return (
      <div className="flex flex-col gap-1.5">
        {entries.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[180px_1fr] gap-2 text-xs">
            <span className="text-muted">{fieldLabel(k)}</span>
            <span className="text-success break-words font-mono">{truncate(textVal(v))}</span>
          </div>
        ))}
      </div>
    );
  }

  // Delete: show non-empty before fields
  if (before && !after) {
    const entries = Object.entries(before).filter(([, v]) => normalize(v) !== null);
    return (
      <div className="flex flex-col gap-1.5">
        {entries.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[180px_1fr] gap-2 text-xs">
            <span className="text-muted">{fieldLabel(k)}</span>
            <span className="text-error line-through break-words font-mono">{truncate(textVal(v))}</span>
          </div>
        ))}
      </div>
    );
  }

  // Update: field-by-field before → after for only changed fields
  if (before && after) {
    const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
    const changed = allKeys.filter(
      (k) => JSON.stringify(normalize(before[k])) !== JSON.stringify(normalize(after[k]))
    );

    if (changed.length === 0) {
      return <p className="text-xs text-muted italic">No changes detected</p>;
    }

    return (
      <div className="flex flex-col gap-3">
        {changed.map((k) => (
          <div key={k} className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">{fieldLabel(k)}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs font-mono">
              <div className="px-2.5 py-1.5 rounded-lg bg-error/6 border border-error/15 text-error break-words line-through">
                {truncate(textVal(before[k]))}
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-success/6 border border-success/15 text-success break-words">
                {truncate(textVal(after[k]))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function LogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(0, Number(pageStr ?? 0));
  const { rows, total } = await getChangeLogs(page, 50);
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Change Log"
        subtitle={`${total} events recorded — every content change with who, what, and when.`}
      />

      {rows.length === 0 ? (
        <div className="mt-10 text-center py-16 rounded-2xl border border-line bg-champagne-dark text-muted body-m">
          No changes logged yet. Edits made from here on will appear here.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {rows.map((row: any) => {
            const entityLabel = ENTITY_LABELS[row.entity_type] ?? row.entity_type;
            const hasDiff = row.diff_before != null || row.diff_after != null;
            return (
              <div key={row.id} className="rounded-xl border border-line bg-champagne-dark p-4 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${ACTION_STYLE[row.action] ?? "bg-muted/10 text-muted"}`}>
                    {row.action}
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {entityLabel}{row.entity_label ? ` · ${row.entity_label}` : ""}
                  </span>
                  <div className="flex-1" />
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <Clock size={11} /> {formatDate(row.created_at)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-0.5">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <User size={11} />
                    <span className="font-medium text-ink/70">{row.user_name}</span>
                    <span className="text-black-30">{row.user_email}</span>
                  </span>
                  {row.page_path && (
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <FileText size={11} /> {row.page_path}
                    </span>
                  )}
                </div>

                {hasDiff && (
                  <details className="mt-1 group">
                    <summary className="text-xs text-muted cursor-pointer hover:text-ink transition-colors select-none list-none flex items-center gap-1.5">
                      <span className="inline-block transition-transform group-open:rotate-90">▶</span>
                      Show changes
                    </summary>
                    <div className="mt-3 border-t border-line pt-3">
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
            <a href={`?page=${page - 1}`} className="px-4 py-2 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:bg-champagne transition-colors">
              ← Previous
            </a>
          )}
          <span className="text-sm text-muted">Page {page + 1} of {totalPages}</span>
          {page < totalPages - 1 && (
            <a href={`?page=${page + 1}`} className="px-4 py-2 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:bg-champagne transition-colors">
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
