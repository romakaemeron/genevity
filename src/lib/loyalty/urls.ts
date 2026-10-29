// Bases are read at call time, not import time, so tests (and a redeployed
// env) take effect without a module reload.

function base(envValue: string | undefined, fallback: string): string {
  return (envValue?.trim() || fallback).replace(/\/+$/, "");
}

/** Origin of the public site, where holders open their "add to wallet" page. */
export function getPublicBase(): string {
  return base(process.env.LOYALTY_PUBLIC_BASE_URL, "https://genevity.com.ua");
}

/** Origin of the admin app, which hosts the staff scan/verify page. */
export function getVerifyBase(): string {
  return base(process.env.LOYALTY_VERIFY_BASE_URL, "https://admin.genevity.com.ua");
}

export function addPageUrl(addToken: string): string {
  return `${getPublicBase()}/card/${addToken}`;
}

export function verifyUrl(verifyToken: string): string {
  return `${getVerifyBase()}/scan/${verifyToken}`;
}
