import Link from "next/link";
import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { AdminPageHeader } from "../_components/admin-list";
import { cn } from "@/lib/utils";

export default async function ChatsPage() {
  await requireSession();

  const rows = await sql`
    SELECT
      id, session_token, locale, started_at, escalated_at,
      escalation_target, patient_name, patient_phone, patient_interest,
      page_title, page_url,
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
              <th className="px-4 py-3 font-medium">Мова</th>
              <th className="px-4 py-3 font-medium">Пацієнт</th>
              <th className="px-4 py-3 font-medium">Сторінка</th>
              <th className="px-4 py-3 font-medium text-center">Повідом.</th>
              <th className="px-4 py-3 font-medium">Ескалація</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id as string}
                className={cn(
                  "border-t border-border hover:bg-muted/40 transition-colors",
                  r.escalated_at && "bg-amber-50/30"
                )}
              >
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3 uppercase text-xs">{r.locale as string}</td>
                <td className="px-4 py-3">
                  <div>
                    {(r.patient_name as string | null) ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  {r.patient_phone && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {r.patient_phone as string}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">
                  {(r.page_title as string | null) ??
                    (r.page_url as string | null) ??
                    "—"}
                </td>
                <td className="px-4 py-3 text-center">{r.message_count as number}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
