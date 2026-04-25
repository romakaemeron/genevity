"use server";

import { sql } from "@/lib/db/client";
import { requireSession } from "./auth";
import { logChange } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "admin") throw new Error("Forbidden");
  return session;
}

export async function getUsers() {
  await requireAdmin();
  return sql`SELECT id, email, name, role, last_login, created_at FROM cms_users ORDER BY created_at`;
}

export async function createUser(_: any, formData: FormData) {
  const session = await requireAdmin();
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  if (!email || !name || !role || !password) return { error: "All fields required" };
  if (!["admin", "marketing", "support"].includes(role)) return { error: "Invalid role" };
  if (password.length < 8) return { error: "Password must be at least 8 characters" };

  const existing = await sql`SELECT id FROM cms_users WHERE email = ${email}`;
  if (existing.length) return { error: "Email already exists" };

  const hash = await bcrypt.hash(password, 12);
  const rows = await sql`
    INSERT INTO cms_users (email, name, password_hash, role)
    VALUES (${email}, ${name}, ${hash}, ${role})
    RETURNING id
  `;

  await logChange({ action: "create", entityType: "cms_user", entityId: rows[0].id, entityLabel: email, after: { email, name, role } });
  revalidatePath("/admin/super/users");
  return { ok: true };
}

export async function updateUserRole(_: any, formData: FormData) {
  const session = await requireAdmin();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  if (!["admin", "marketing", "support"].includes(role)) return { error: "Invalid role" };
  if (userId === session.userId) return { error: "Cannot change your own role" };

  const rows = await sql`SELECT email, name, role FROM cms_users WHERE id = ${userId}`;
  if (!rows.length) return { error: "User not found" };
  const before = rows[0];

  await sql`UPDATE cms_users SET role = ${role} WHERE id = ${userId}`;
  await logChange({ action: "update", entityType: "cms_user", entityId: userId, entityLabel: before.email, before: { role: before.role }, after: { role } });
  revalidatePath("/admin/super/users");
  return { ok: true };
}

export async function resetUserPassword(_: any, formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const password = formData.get("password") as string;

  if (!password || password.length < 8) return { error: "Password must be at least 8 characters" };

  const rows = await sql`SELECT email FROM cms_users WHERE id = ${userId}`;
  if (!rows.length) return { error: "User not found" };

  const hash = await bcrypt.hash(password, 12);
  await sql`UPDATE cms_users SET password_hash = ${hash} WHERE id = ${userId}`;
  await logChange({ action: "update", entityType: "cms_user", entityId: userId, entityLabel: rows[0].email, after: { passwordReset: true } });
  revalidatePath("/admin/super/users");
  return { ok: true };
}

export async function deleteUser(_: any, formData: FormData) {
  const session = await requireAdmin();
  const userId = formData.get("userId") as string;

  if (userId === session.userId) return { error: "Cannot delete your own account" };

  const rows = await sql`SELECT email, name FROM cms_users WHERE id = ${userId}`;
  if (!rows.length) return { error: "User not found" };

  await sql`DELETE FROM cms_users WHERE id = ${userId}`;
  await logChange({ action: "delete", entityType: "cms_user", entityId: userId, entityLabel: rows[0].email });
  revalidatePath("/admin/super/users");
  return { ok: true };
}

export async function getChangeLogs(page = 0, pageSize = 50) {
  await requireAdmin();
  const offset = page * pageSize;
  const rows = await sql`
    SELECT id, user_email, user_name, action, entity_type, entity_id, entity_label,
           page_path, diff_before, diff_after, created_at
    FROM cms_change_log
    ORDER BY created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;
  const countRows = await sql`SELECT count(*) AS total FROM cms_change_log`;
  return { rows, total: Number(countRows[0]?.total ?? 0) };
}
