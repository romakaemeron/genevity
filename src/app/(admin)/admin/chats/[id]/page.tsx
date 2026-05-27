import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import { cn } from "@/lib/utils";

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

  const session = sessionRows[0];
  const messages = messageRows as Array<{
    role: string;
    content: string;
    created_at: string;
  }>;

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/admin/chats"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={14} /> Усі чати
      </Link>

      <div className="mb-6 space-y-1 text-sm border border-border rounded-xl p-4 bg-muted/20">
        <div>
          <span className="text-muted-foreground">Початок: </span>
          {new Date(session.started_at as string).toLocaleString("uk-UA")}
        </div>
        <div>
          <span className="text-muted-foreground">Мова: </span>
          {(session.locale as string).toUpperCase()}
        </div>
        {session.patient_name && (
          <div>
            <span className="text-muted-foreground">Пацієнт: </span>
            {session.patient_name as string}
          </div>
        )}
        {session.patient_phone && (
          <div>
            <span className="text-muted-foreground">Телефон: </span>
            <span className="font-mono">{session.patient_phone as string}</span>
          </div>
        )}
        {session.patient_interest && (
          <div>
            <span className="text-muted-foreground">Інтерес: </span>
            {session.patient_interest as string}
          </div>
        )}
        {session.escalated_at && (
          <div>
            <span className="text-muted-foreground">Ескалація → </span>
            <span className="font-medium">{session.escalation_target as string}</span>
            {" "}({new Date(session.escalated_at as string).toLocaleString("uk-UA")})
          </div>
        )}
        {session.summary && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <span className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">
              Summary для оператора
            </span>
            {session.summary as string}
          </div>
        )}
      </div>

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
