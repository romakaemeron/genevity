import Link from "next/link";
import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { AdminPageHeader } from "../_components/admin-list";
import { cn } from "@/lib/utils";

const URGENCY = {
  browsing:      { label: "Переглядає",  cls: "bg-gray-100 text-gray-600" },
  interested:    { label: "Цікавиться",  cls: "bg-blue-100 text-blue-700" },
  ready_to_book: { label: "До запису",   cls: "bg-green-100 text-green-700" },
} as const;

export default async function ChatsPage() {
  await requireSession();

  const rows = await sql`
    SELECT
      id, session_token, locale, started_at, escalated_at,
      escalation_target, patient_name, patient_phone,
      urgency, topics, page_title, page_url,
      (SELECT count(*)::int FROM chat_messages WHERE session_id = chat_sessions.id) AS message_count
    FROM chat_sessions
    ORDER BY started_at DESC
    LIMIT 100
  `;

  return (
    <div className="p-8">
      <AdminPageHeader title="Чати" subtitle={`${rows.length} сесій`} />
      <div className="mt-6 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground text-left">
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Пацієнт</th>
              <th className="px-4 py-3 font-medium">Теми</th>
              <th className="px-4 py-3 font-medium text-center">Повід.</th>
              <th className="px-4 py-3 font-medium">Ескалація</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const urgency = (r.urgency as string | null) ?? "browsing";
              const u = URGENCY[urgency as keyof typeof URGENCY] ?? URGENCY.browsing;
              const topics = (r.topics as string[] | null) ?? [];
              return (
                <tr
                  key={r.id as string}
                  className={cn(
                    "border-t border-border hover:bg-muted/40 transition-colors",
                    r.escalated_at && "bg-amber-50/30"
                  )}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/chats/${r.id}`}
                      className="hover:underline text-foreground"
                    >
                      {new Date(r.started_at as string).toLocaleString("uk-UA", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Link>
                    <div className="text-xs text-muted-foreground uppercase">{r.locale as string}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium", u.cls)}>
                      {u.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {(r.patient_name as string | null) ?? (
                        <span className="text-muted-foreground font-normal">—</span>
                      )}
                    </div>
                    {r.patient_phone && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {r.patient_phone as string}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    {topics.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {topics.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs bg-muted px-1.5 py-0.5 rounded-md">
                            {t}
                          </span>
                        ))}
                        {topics.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{topics.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {r.message_count as number}
                  </td>
                  <td className="px-4 py-3">
                    {r.escalated_at ? (
                      <span
                        className={cn(
                          "inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium",
                          r.escalation_target === "helyos"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {r.escalation_target === "helyos" ? "Helyos" : "Genevity"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
