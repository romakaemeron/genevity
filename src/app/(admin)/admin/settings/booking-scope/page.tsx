import { requireSession } from "../../_actions/auth";
import { AdminPageHeader } from "../../_components/admin-list";
import BookingScopeEditor, {
  type ScopeEmployee,
  type ScopeGroup,
  type ScopeService,
} from "../../_components/booking-scope-editor";
import { getScopeMap } from "@/lib/db/queries/booking-scope";
import { listEmployees, listServicesGrouped, serviceTaxonomy } from "@/lib/roapp/client";
import type { ScopeMap } from "@/lib/booking-scope-rules";

export const dynamic = "force-dynamic";

/**
 * Which services each specialist is offered for in the online booking wizard.
 *
 * RoApp has no way to express this: its booking API accepts an `employee_id`
 * on the services endpoint and ignores it, so without this mapping every
 * specialist is offered all 232 bookable services — the urologist included.
 * Migration 028 has the full background.
 *
 * The lists come from RoApp live rather than a local copy, so a service added
 * there appears here without a sync step. If RoApp is unreachable the editor
 * says so rather than rendering an empty form that would save empty mappings.
 */
export default async function BookingScopePage() {
  await requireSession();

  let employees: ScopeEmployee[] = [];
  let groups: ScopeGroup[] = [];
  let services: ScopeService[] = [];
  let scope: ScopeMap = {};
  let roappError: string | null = null;

  try {
    const [emps, bookable, taxonomy, saved] = await Promise.all([
      listEmployees(),
      // Employee id 0 = the whole bookable catalogue, which is what the editor
      // maps against. Passing a real id would change nothing (RoApp ignores
      // it) but would read as if it did.
      listServicesGrouped(undefined),
      serviceTaxonomy(),
      getScopeMap(),
    ]);
    employees = emps.map((e) => ({ id: e.id, name: e.name, position: e.position }));
    services = bookable.map((s) => ({
      id: s.id,
      title: s.title,
      groupId: s.categoryId,
    }));
    // Only headings that actually hold a bookable service — the catalogue has
    // 15, but 8 of them are all a patient can ever reach.
    const used = new Set(services.map((s) => s.groupId).filter((g): g is number => g != null));
    groups = taxonomy.groups
      .filter((g) => used.has(g.id))
      .map((g) => ({
        id: g.id,
        title: g.title,
        serviceCount: services.filter((s) => s.groupId === g.id).length,
      }));
    scope = saved;
  } catch (e) {
    console.error("[admin/booking-scope] RoApp unreachable:", e);
    roappError = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Послуги спеціалістів"
        subtitle="Які послуги пропонуються пацієнту для кожного лікаря в онлайн-записі. Спеціаліст без обраних напрямів отримує всі послуги — так само, як було раніше."
      />

      {roappError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            Не вдалося отримати дані з RoApp, тому редактор зараз недоступний.
            Збережені налаштування не змінилися — оновіть сторінку пізніше.
          </p>
          <p className="text-xs text-amber-700 mt-2 font-mono break-all">{roappError}</p>
        </div>
      ) : (
        <BookingScopeEditor
          employees={employees}
          groups={groups}
          services={services}
          initial={scope}
        />
      )}
    </div>
  );
}
