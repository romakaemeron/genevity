import { sql } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { requireSession } from "../../_actions/auth";
import FormStatusDropdown from "../../_components/form-status-dropdown";
import DeleteSubmissionButton from "./_components/delete-button";
import type { FormStatus } from "../../_actions/forms";

/** Server-side formatter — Kyiv time is where ops reads these. */
function formatKyiv(raw: Date | string | null | undefined): string {
  if (!raw) return "—";
  const d = raw instanceof Date ? raw : new Date(raw);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  });
}

/** Render either a value or a muted em-dash for missing rows. */
function Value({ children, mono }: { children?: React.ReactNode; mono?: boolean }) {
  const present = children !== undefined && children !== null && children !== "";
  const cls = mono
    ? "text-[13px] font-mono text-ink break-words"
    : "text-[14px] text-ink break-words";
  return present ? <p className={cls}>{children}</p> : <p className="text-[13px] text-muted italic">не вказано</p>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 md:gap-6 py-3 border-t border-line first:border-t-0">
      <div className="text-[12px] font-medium text-muted uppercase tracking-wider pt-0.5">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  const rows = await sql`
    SELECT id, status, name, phone, email, message, direction, preferred_time,
           page_url, page_title, referrer, form_label, service_id,
           utm_source, utm_medium, utm_campaign, utm_term, utm_content,
           created_at, read_at, processed_at
    FROM form_submissions
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!rows.length) notFound();
  const r = rows[0];

  // Fetch linked service (if any) so the page can link through.
  let linkedService: { slug: string; title_uk: string; category_slug: string } | null = null;
  if (r.service_id) {
    const svc = await sql`
      SELECT s.slug, s.title_uk, c.slug AS category_slug
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      WHERE s.id = ${r.service_id}
      LIMIT 1
    `;
    if (svc[0]) {
      linkedService = {
        slug: svc[0].slug as string,
        title_uk: svc[0].title_uk as string,
        category_slug: svc[0].category_slug as string,
      };
    }
  }

  const status = (r.status === "processed" ? "processed" : "new") as FormStatus;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/forms"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          До всіх заявок
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="heading-2 text-ink">{r.name || "Без імені"}</h1>
          <FormStatusDropdown id={r.id as string} current={status} />
        </div>
        <p className="body-s text-muted mt-1">
          Отримано {formatKyiv(r.created_at as Date)}
          {r.processed_at ? ` · Оброблено ${formatKyiv(r.processed_at as Date)}` : ""}
        </p>
      </div>

      {/* Client */}
      <section className="mb-8 rounded-[var(--radius-card)] bg-white border border-line p-5">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Клієнт</h2>
        <Row label="Ім'я клієнта"><Value>{r.name}</Value></Row>
        <Row label="Телефон клієнта">
          {r.phone ? (
            <a href={`tel:${String(r.phone).replace(/\s/g, "")}`} className="text-[14px] font-mono text-ink hover:text-main transition-colors">
              {r.phone}
            </a>
          ) : <Value />}
        </Row>
        {r.email && <Row label="Email"><Value>{r.email}</Value></Row>}
        <Row label="Цікавиться">
          <Value>{r.direction}</Value>
          {linkedService && (
            <Link
              href={`/admin/pages/services`}
              className="inline-flex items-center gap-1 text-[12px] text-main hover:text-main-dark transition-colors mt-1"
            >
              <ExternalLink size={11} />
              Перейти до послуги в адмінці
            </Link>
          )}
        </Row>
      </section>

      {/* Form context */}
      <section className="mb-8 rounded-[var(--radius-card)] bg-white border border-line p-5">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Контекст форми</h2>
        <Row label="Клініка"><Value>GENEVITY</Value></Row>
        <Row label="Форма"><Value>{r.form_label}</Value></Row>
        <Row label="Сторінка">
          {r.page_url ? (
            <>
              {r.page_title && <Value>{r.page_title}</Value>}
              <a
                href={r.page_url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-mono text-main hover:text-main-dark transition-colors break-all"
              >
                {r.page_url}
                <ExternalLink size={10} className="shrink-0" />
              </a>
            </>
          ) : <Value />}
        </Row>
        <Row label="Джерело переходу">
          {r.referrer ? (
            <a
              href={r.referrer as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-mono text-main hover:text-main-dark transition-colors break-all inline-flex items-center gap-1"
            >
              {r.referrer}
              <ExternalLink size={10} className="shrink-0" />
            </a>
          ) : <Value />}
        </Row>
      </section>

      {/* Attribution */}
      <section className="mb-8 rounded-[var(--radius-card)] bg-white border border-line p-5">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">UTM атрибуція</h2>
        <Row label="utm_source"><Value mono>{r.utm_source}</Value></Row>
        <Row label="utm_medium"><Value mono>{r.utm_medium}</Value></Row>
        <Row label="utm_campaign"><Value mono>{r.utm_campaign}</Value></Row>
        <Row label="utm_term"><Value mono>{r.utm_term}</Value></Row>
        <Row label="utm_content"><Value mono>{r.utm_content}</Value></Row>
      </section>

      {/* Danger zone */}
      <div className="flex justify-end">
        <DeleteSubmissionButton id={r.id as string} />
      </div>
    </div>
  );
}
