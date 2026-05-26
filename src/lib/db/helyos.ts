import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function getHelyosSql(): NeonQueryFunction<false, false> | null {
  if (_sql) return _sql;
  const url = process.env.HELYOS_DATABASE_URL;
  if (!url) return null;
  _sql = neon(url);
  return _sql;
}
