/**
 * Manual ISR invalidation for the custom Neon CMS.
 *
 * Content edited directly in the database (admin panel, seed scripts) does not
 * appear on the site until the ISR window of each page elapses — 24 h for most
 * pages, 1 h for the sitemap. This script drops those caches on demand by
 * calling POST /api/revalidate on the target deployment.
 *
 * Usage:
 *   npx tsx scripts/revalidate.ts service:couperose-treatment
 *   npx tsx scripts/revalidate.ts serviceCategory:apparatus-cosmetology
 *   npx tsx scripts/revalidate.ts doctor:detsyk-dmytro priceItem /faq
 *   npx tsx scripts/revalidate.ts --url https://genevity-git-develop-x.vercel.app service:laser-peel
 *
 * Targets are either `entity:slug`, a bare `entity`, or a literal path starting
 * with "/". The homepage (all locales) and /sitemap.xml are always included.
 *
 * Options:
 *   --url <base>   deployment to hit (default: $REVALIDATE_URL, else production)
 *   --dry-run      print what would be sent, call nothing
 *
 * Requires REVALIDATE_SECRET — read from .env.local, or the environment.
 * The same value must be set on the deployment (`vercel env add REVALIDATE_SECRET`).
 */
import * as fs from "fs";
import * as path from "path";

const PROD_URL = "https://genevity.com.ua";

const ENTITIES = [
  "service", "serviceCategory", "staticPage", "doctor",
  "priceItem", "priceCategory", "navigation", "siteSettings",
] as const;
type Entity = (typeof ENTITIES)[number];

function loadEnvLocal(): Record<string, string> {
  const file = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const [k, ...v] = line.split("=");
    if (k && v.length) out[k.trim()] = v.join("=").trim();
  }
  return out;
}

interface Target { entity?: Entity; slug?: string; path?: string }

function parseTarget(arg: string): Target {
  if (arg.startsWith("/")) return { path: arg };
  const [head, ...rest] = arg.split(":");
  if (!(ENTITIES as readonly string[]).includes(head)) {
    throw new Error(
      `Unknown target "${arg}". Use a path starting with "/", or one of: ${ENTITIES.join(", ")}`,
    );
  }
  return { entity: head as Entity, slug: rest.join(":") || undefined };
}

async function main() {
  const argv = process.argv.slice(2);
  const env = { ...loadEnvLocal(), ...process.env } as Record<string, string>;

  let baseUrl = env.REVALIDATE_URL || PROD_URL;
  let dryRun = false;
  const rawTargets: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--url") { baseUrl = argv[++i]; continue; }
    if (argv[i] === "--dry-run") { dryRun = true; continue; }
    rawTargets.push(argv[i]);
  }

  if (!rawTargets.length) {
    console.error("No targets given.\n");
    console.error("  npx tsx scripts/revalidate.ts service:couperose-treatment");
    console.error("  npx tsx scripts/revalidate.ts serviceCategory:apparatus-cosmetology /faq");
    console.error(`\nEntities: ${ENTITIES.join(", ")}`);
    process.exit(1);
  }

  const secret = env.REVALIDATE_SECRET || env.SANITY_REVALIDATE_SECRET;
  if (!secret && !dryRun) {
    console.error("REVALIDATE_SECRET is not set (.env.local or environment).");
    console.error("Set the same value on the deployment: vercel env add REVALIDATE_SECRET");
    process.exit(1);
  }

  const targets = rawTargets.map(parseTarget);
  // Literal paths ride along with the first request; entities each get their own.
  const literalPaths = targets.filter((t) => t.path).map((t) => t.path!);
  const entityTargets = targets.filter((t) => t.entity);
  const requests: { entity?: Entity; slug?: string; paths?: string[] }[] =
    entityTargets.length
      ? entityTargets.map((t, i) => ({
          entity: t.entity, slug: t.slug,
          paths: i === 0 && literalPaths.length ? literalPaths : undefined,
        }))
      : [{ paths: literalPaths }];

  console.log(`→ ${baseUrl}/api/revalidate${dryRun ? "  (dry run)" : ""}\n`);

  let failed = 0;
  for (const body of requests) {
    const label = body.entity ? `${body.entity}${body.slug ? `:${body.slug}` : ""}` : "paths";
    if (dryRun) { console.log(`  ${label} → ${JSON.stringify(body)}`); continue; }

    try {
      const res = await fetch(`${baseUrl}/api/revalidate`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-revalidate-secret": secret! },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let json: { paths?: string[]; message?: string } = {};
      try { json = JSON.parse(text); } catch { /* non-JSON error page */ }

      if (!res.ok) {
        failed++;
        console.error(`  ✗ ${label} — HTTP ${res.status} ${json.message ?? text.slice(0, 120)}`);
        continue;
      }
      console.log(`  ✓ ${label} — ${json.paths?.length ?? 0} paths`);
      for (const p of json.paths ?? []) console.log(`      ${p}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${label} — ${String(err)}`);
    }
  }

  if (failed) { console.error(`\n${failed}/${requests.length} request(s) failed.`); process.exit(1); }
  if (!dryRun) console.log("\nDone. Pages re-render on the next request.");
}

main().catch((e) => { console.error(e); process.exit(1); });
