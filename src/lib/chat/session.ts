import { sql } from "@/lib/db/client";

export interface ChatSession {
  id: string;
  session_token: string;
  locale: string;
}

export async function getOrCreateSession(params: {
  sessionToken: string;
  locale: string;
  pageUrl?: string;
  pageTitle?: string;
}): Promise<ChatSession> {
  const existing = await sql`
    SELECT id, session_token, locale
    FROM chat_sessions
    WHERE session_token = ${params.sessionToken}
    LIMIT 1
  `;
  if (existing[0]) return existing[0] as ChatSession;

  const created = await sql`
    INSERT INTO chat_sessions (session_token, locale, page_url, page_title)
    VALUES (${params.sessionToken}, ${params.locale},
            ${params.pageUrl ?? null}, ${params.pageTitle ?? null})
    RETURNING id, session_token, locale
  `;
  return created[0] as ChatSession;
}

export async function saveMessage(params: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
}): Promise<void> {
  await sql`
    INSERT INTO chat_messages (session_id, role, content)
    VALUES (${params.sessionId}, ${params.role}, ${params.content})
  `;
}

export async function escalateSession(params: {
  sessionId: string;
  escalationBy: "bot" | "user";
  escalationTarget: "genevity" | "helyos";
  summary: string;
  patientName?: string | null;
  patientPhone?: string | null;
  patientInterest?: string | null;
}): Promise<void> {
  await sql`
    UPDATE chat_sessions SET
      escalated_at      = now(),
      escalation_by     = ${params.escalationBy},
      escalation_target = ${params.escalationTarget},
      summary           = ${params.summary},
      patient_name      = ${params.patientName ?? null},
      patient_phone     = ${params.patientPhone ?? null},
      patient_interest  = ${params.patientInterest ?? null}
    WHERE id = ${params.sessionId}
  `;
}
