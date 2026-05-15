"use server";

import { sql } from "@/lib/db/client";
import { getSession } from "@/app/(admin)/admin/_actions/auth";

export interface AuditEntry {
  action: "create" | "update" | "delete";
  entityType: string;
  entityId?: string;
  entityLabel?: string;
  pagePath?: string;
  before?: unknown;
  after?: unknown;
}

export async function logChange(entry: AuditEntry): Promise<void> {
  try {
    const session = await getSession();
    if (!session) return;
    // Always use fresh DB values — JWT email/name can be stale after profile edits
    const userRows = await sql`SELECT email, name FROM cms_users WHERE id = ${session.userId}`;
    const userEmail = userRows[0]?.email ?? session.email;
    const userName = userRows[0]?.name ?? session.name;
    await sql`
      INSERT INTO cms_change_log
        (user_id, user_email, user_name, action, entity_type, entity_id, entity_label, page_path, diff_before, diff_after)
      VALUES
        (${session.userId}, ${userEmail}, ${userName}, ${entry.action},
         ${entry.entityType}, ${entry.entityId ?? null}, ${entry.entityLabel ?? null},
         ${entry.pagePath ?? null},
         ${entry.before != null ? JSON.stringify(entry.before) : null}::jsonb,
         ${entry.after != null ? JSON.stringify(entry.after) : null}::jsonb)
    `;
  } catch {
    // Logging must never break the main action
  }
}
