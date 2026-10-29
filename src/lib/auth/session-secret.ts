export function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.CMS_JWT_SECRET || "genevity-cms-dev-secret");
}
