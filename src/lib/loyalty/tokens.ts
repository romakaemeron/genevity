import { randomBytes } from "node:crypto";

/** 24 random bytes as base64url: 192 bits, 32 characters, safe in a URL path. */
export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

const TOKEN_RE = /^[A-Za-z0-9_-]{32}$/;

/** Shape check only; lets callers reject junk before touching the database. */
export function isWellFormedToken(s: unknown): s is string {
  return typeof s === "string" && TOKEN_RE.test(s);
}
