"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.CMS_JWT_SECRET || "genevity-cms-dev-secret"
);
const COOKIE_NAME = "cms_session";
const SESSION_DAYS = 30;

/* ── Session helpers ── */

export async function createSession(userId: string, email: string, name: string, role: string) {
  const token = await new SignJWT({ userId, email, name, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DAYS}d`)
    .setIssuedAt()
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; name: string; role: string };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/* ── Login ── */

export async function login(_prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Введіть email та пароль" };
  }

  const rows = await sql`
    SELECT id, email, name, password_hash, role FROM cms_users WHERE email = ${email}
  `;

  if (!rows.length) {
    return { error: "Невірний email або пароль" };
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return { error: "Невірний email або пароль" };
  }

  // Update last_login
  await sql`UPDATE cms_users SET last_login = now() WHERE id = ${user.id}`;

  await createSession(user.id, user.email, user.name, user.role);
  redirect("/dashboard");
}

/* ── Logout ── */

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}
