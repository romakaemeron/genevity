import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import { cn } from "@/lib/utils";

const URGENCY_LABEL: Record<string, string> = {
  browsing:      "Переглядає",
  interested:    "Зацікавлений",
  ready_to_book: "Готовий до запису",
};

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const [sessionRows, messageRows] = await Promise.all([
    sql`SELECT * FROM chat_sessions WHERE id = ${id} LIMIT 1`,
    sql`
      SELECT role, content, created_at
      FROM chat_messages
      WHERE session_id = ${id}
      ORDER BY created_at ASC
    `,
  ]);

  if (!sessionRows[0]) notFound();

  const s = sessionRows[0];
  const messages = messageRows as Array<{ role: string; content: string; created_at: string }>;
  const topics = (s.topics as string[] | null) ?? [];

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/admin/chats"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={14} /> Усі чати
      </Link>

      {/* Operator briefing card */}
      {s.operator_note && (
        <div className="mb-6 border-2 border-amber-300 rounded-xl p-4 bg-amber-50">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-3">
            📋 Брифінг для оператора
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm mb-3">
            <div>
              <span className="text-muted-foreground">Статус:</span>{" "}
              <span className="font-medium">
                {URGENCY_LABEL[(s.urgency as string | null) ?? "browsing"] ?? s.urgency as string}
              </span>
            </div>
            {s.patient_name && (
              <div>
                <span className="text-muted-foreground">Ім&apos;я:</span>{" "}
                <span className="font-medium">{s.patient_name as string}</span>
              </div>
            )}
            {s.patient_phone && (
              <div>
                <span className="text-muted-foreground">Телефон:</span>{" "}
                <span className="font-mono font-medium">{s.patient_phone as string}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Мова:</span>{" "}
              <span className="uppercase">{s.locale as string}</span>
            </div>
            {s.page_title && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Сторінка:</span>{" "}
                {s.page_title as string}
              </div>
            )}
          </div>
          {topics.length > 0 && (
            <div className="mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Питання пацієнта:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {topics.map((t) => (
                  <span key={t} className="text-xs bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {s.summary && (
            <div className="text-sm text-amber-900 bg-amber-100 rounded-lg px-3 py-2">
              {s.summary as string}
            </div>
          )}
          {/* Full note for copy-paste to Binotel / CRM */}
          <details className="mt-3">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Повна нотатка для CRM / Binotel
            </summary>
            <pre className="mt-2 text-xs bg-white border border-amber-200 rounded-lg p-3 whitespace-pre-wrap font-mono select-all">
              {s.operator_note as string}
            </pre>
          </details>
        </div>
      )}

      {/* Session meta */}
      <div className="mb-6 space-y-1 text-sm border border-border rounded-xl p-4 bg-muted/20">
        <div>
          <span className="text-muted-foreground">Початок: </span>
          {new Date(s.started_at as string).toLocaleString("uk-UA")}
        </div>
        {s.escalated_at && (
          <div>
            <span className="text-muted-foreground">Ескалація → </span>
            <span className="font-medium">{s.escalation_target as string}</span>
            {" "}({new Date(s.escalated_at as string).toLocaleString("uk-UA")})
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {messages.map((m, i) => {
          if (m.content.startsWith("__")) return null;
          return (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  m.role === "user"
                    ? "bg-[var(--color-main)] text-white rounded-tr-sm"
                    : "bg-[var(--color-champagne-dark,#f0ede7)] text-[var(--color-black)] rounded-tl-sm"
                )}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
