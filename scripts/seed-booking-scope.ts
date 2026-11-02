/**
 * First-pass mapping of RoApp specialists to the services they are offered for.
 *
 * Derived, not invented. Three sources, all authored by the clinic:
 *   1. the specialist's job title in RoApp        ("Лікар-подолог")
 *   2. the service title, which names a specialty ("Консультація подолога")
 *      or a specific doctor                       ("… (Мінчук)")
 *   3. the doctor's role and service links on our own site (service_doctors)
 *
 * Nothing here is a clinical judgement by the author: a mapping only exists
 * where two of those sources agree. Where they didn't, the specialist is left
 * out and the clinic decides — see KNOWN_GAPS.
 *
 * Re-runnable. Each specialist's rules are replaced wholesale, so running it
 * again after the clinic has edited in /admin WOULD discard their edits. It is
 * an initial-import tool; say no if someone asks to put it on a schedule.
 *
 * Run: npx tsx scripts/seed-booking-scope.ts [--dry]
 */
import * as fs from "fs";
import * as path from "path";

for (const line of fs
  .readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8")
  .split("\n")) {
  const i = line.indexOf("=");
  if (i < 1 || line.startsWith("#")) continue;
  process.env[line.slice(0, i).trim()] ||= line.slice(i + 1).trim();
}

const DRY = process.argv.includes("--dry");
const BOOKING = "https://c4bj5.roapp.page/api/booking";
const LOCATION = Number(process.env.ROAPP_LOCATION_ID || 221552);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Second-level RoApp category ids — the headings the editor ticks. */
const CAT = {
  CONSULTATIONS: 1814519,
  APPARATUS: 1814571,
  INJECTABLE: 1814577,
  DIAGNOSTICS: 1820183,
  CARE: 1822344,
  PODOLOGY: 1822345,
  DRIPS: 1824524,
} as const;

/**
 * Whole categories, justified by the doctor's own service links on the site.
 * Consultations are never assigned by category — that heading mixes thirteen
 * specialties, so it is always resolved service by service below.
 */
const CATEGORIES: Record<number, number[]> = {
  322928: [CAT.PODOLOGY],                                   // Кириленко, подолог
  323455: [CAT.DIAGNOSTICS],                                // Федоренко, УЗД
  325060: [CAT.APPARATUS],                                  // Полуніна: лазер, пігментація, акне
  324055: [CAT.DRIPS],                                      // Полешко: IV-терапія
  318845: [CAT.APPARATUS, CAT.INJECTABLE, CAT.CARE],        // Бєлянушкін, 47 site services
  322929: [CAT.APPARATUS, CAT.INJECTABLE, CAT.CARE],        // Сепкіна, 47 site services
};

/**
 * Which consultation titles belong to which job title.
 *
 * Matched on the specialty word, with two corrections that cost real debugging:
 *   - "фізичний терапевт" must not match "лікаря-терапевта"; a physiotherapist
 *     is not a general practitioner.
 *   - RoApp spells one surname Толсти-кова and the catalogue Толсті-кова, so
 *     surnames are compared with і/и folded together.
 */
const SPECIALTY: [string, string][] = [
  ["подолог", "подолог"],
  ["уролог", "уролог"],
  ["гінеколог", "гінеколог"],
  ["репродуктолог", "репродуктолог"],
  ["дерматовенеролог", "дерматолог"],
  ["дерматолог", "дерматолог"],
  ["гастроентеролог", "гастроентеролог"],
  ["нутриціолог", "дієтолог"],
  ["дієтолог", "дієтолог"],
  ["харчуванн", "дієтолог"],
  ["ендокринолог", "ендокринолог"],
  ["косметолог", "косметолог"],
  ["невролог", "невролог"],
];

/** Left for the clinic — printed at the end rather than guessed. */
const KNOWN_GAPS = [
  'Вовк (фізичний терапевт) — каталог не має ні консультації фізичного терапевта, ні відповідного напряму. Залишено без мапінгу: йому пропонуються всі послуги, доки клініка не вирішить.',
  '"Консультація гастроентеролога (к.м.н.)" призначена обом гастроентерологам — науковий ступінь має хтось один.',
  "Бєлянушкін і Сепкіна отримали три напрями цілком (105 послуг) — це єдине місце, де широту виведено з кількості послуг на сайті, а не з прямої вказівки.",
];

function fold(s: string): string {
  let out = s.toLowerCase().replace(/[’ʼ]/g, "'");
  for (const [a, b] of [["і", "и"], ["ї", "и"], ["й", "и"]]) out = out.split(a).join(b);
  return out;
}

interface Emp { id: number; name: string; position: string }
interface Svc { id: number; title: string }

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return (await res.json()) as T;
}

async function main() {
  const { saveEmployeeScope } = await import("../src/lib/db/queries/booking-scope");
  const { sql } = await import("../src/lib/db/client");

  const employees = await getJson<Emp[]>(`${BOOKING}/locations/${LOCATION}/employees`);
  await sleep(400);
  const services: Svc[] = [];
  for (let page = 1; page <= 6; page += 1) {
    const r = await getJson<{ data: Svc[]; totalPages: number }>(
      `${BOOKING}/locations/${LOCATION}/services?page=${page}&pageSize=50`,
    );
    services.push(...(r.data ?? []));
    if (page >= (r.totalPages ?? 1)) break;
    await sleep(450);
  }

  const cmsRows = (await sql`
    SELECT name_uk, role_uk FROM doctors WHERE is_published = true
  `) as unknown as { name_uk: string; role_uk: string | null }[];
  const cmsRole = new Map(
    cmsRows.map((r) => [fold(r.name_uk.split(" ")[0]), (r.role_uk ?? "").toLowerCase()]),
  );

  const consultations = services.filter((s) => s.title.includes("онсультац"));

  let mapped = 0;
  for (const e of employees) {
    const surname = fold(e.name.split(" ").pop() ?? "");
    // RoApp's job title plus the site's role — the site is more specific for
    // at least one doctor (gastroenterologist there, "gastro + dietitian" here).
    const role = `${e.position} ${cmsRole.get(surname) ?? ""}`.toLowerCase();
    const words = SPECIALTY.filter(([k]) => role.includes(k)).map(([, w]) => w);

    const allow: number[] = [];
    for (const c of consultations) {
      const title = fold(c.title);
      const paren = /\(([^)]*)\)/.exec(c.title);
      const inner = paren ? fold(paren[1]) : "";
      // Names inside parentheses that are people, not qualifiers.
      const people = inner
        .split(/[/,]/)
        .map((x) => x.trim())
        .filter((x) => x && !["онлаин", "к.м.н", "повторна"].some((q) => x.includes(q)));
      const isMine = people.some((p) => p.startsWith(surname.slice(0, 6)) || surname.startsWith(p.slice(0, 6)));
      if (!words.some((w) => title.includes(fold(w)))) continue;
      // A title naming another doctor is theirs, whatever the specialty says.
      if (people.length > 0 && !isMine) continue;
      allow.push(c.id);
    }

    const categories = CATEGORIES[e.id] ?? [];
    if (!categories.length && !allow.length) {
      console.log(`  —  ${e.name}  (${e.position}) — no evidence, left unmapped`);
      continue;
    }
    if (!DRY) {
      await saveEmployeeScope(e.id, { categories, allowServices: allow, denyServices: [] });
    }
    mapped += 1;
    console.log(
      `  ✓  ${e.name.padEnd(34)} ${categories.length} напрям(ів) + ${allow.length} консультацій`,
    );
  }

  console.log(`\n${mapped}/${employees.length} specialists mapped${DRY ? " (dry run, nothing written)" : ""}`);
  console.log("\nLeft for the clinic:");
  for (const g of KNOWN_GAPS) console.log(`  • ${g}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
