"use client";

/**
 * Which services each specialist is offered for in the online booking wizard.
 *
 * RoApp cannot express this — its booking API accepts an `employee_id` on the
 * services endpoint and ignores it — so the mapping lives here. Migration 028
 * has the background.
 *
 * One list, two levels: every category is always visible with a tri-state box
 * (all / some / none) and expands to its own services. An earlier version put
 * a category grid above a separate searchable panel, which asked the editor to
 * hold two models of the same thing at once and hid the services of any
 * category they had not already ticked. Categories alone are not enough
 * either: "Консультації лікарів" is one flat heading holding 29 consultations
 * across 13 specialties, so selecting it wholesale would offer a urologist
 * every consultation the clinic sells.
 *
 * The rule the UI must make obvious is the fallback: a specialist with nothing
 * selected is offered **every** service. That is deliberate — the clinic maps
 * doctors one at a time and a half-done mapping must never show a patient an
 * empty list — but it surprises unless stated, so it is badged rather than
 * left looking merely blank.
 */

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, Search, Check, Minus } from "lucide-react";
import { saveBookingScope } from "../_actions/booking-scope";
import { useAdminLocale } from "../_i18n/context";
import {
  isUnrestricted,
  type EmployeeScope,
  type ScopeMap,
} from "@/lib/booking-scope-rules";

export interface ScopeEmployee {
  id: number;
  name: string;
  position: string;
}
export interface ScopeGroup {
  id: number;
  title: string;
  serviceCount: number;
}
export interface ScopeService {
  id: number;
  title: string;
  groupId: number | null;
}

function emptyScope(): EmployeeScope {
  return { categories: [], allowServices: [], denyServices: [] };
}

export default function BookingScopeEditor({
  employees, groups, services, initial,
}: {
  employees: ScopeEmployee[];
  groups: ScopeGroup[];
  services: ScopeService[];
  initial: ScopeMap;
}) {
  const { t } = useAdminLocale();
  const [scopes, setScopes] = useState<Record<number, EmployeeScope>>(() => {
    const out: Record<number, EmployeeScope> = {};
    for (const e of employees) out[e.id] = initial[e.id] ?? emptyScope();
    return out;
  });
  const [open, setOpen] = useState<number | null>(null);

  if (employees.length === 0) {
    return <p className="text-sm text-muted-foreground">{t.bookingScopeEditor.roappDown}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {employees.map((e) => (
        <EmployeeRow
          key={e.id}
          employee={e}
          groups={groups}
          services={services}
          scope={scopes[e.id] ?? emptyScope()}
          expanded={open === e.id}
          onToggle={() => setOpen(open === e.id ? null : e.id)}
          onChange={(update) =>
            setScopes((all) => ({ ...all, [e.id]: update(all[e.id] ?? emptyScope()) }))
          }
        />
      ))}
    </div>
  );
}

function EmployeeRow({
  employee, groups, services, scope, expanded, onToggle, onChange,
}: {
  employee: ScopeEmployee;
  groups: ScopeGroup[];
  services: ScopeService[];
  scope: EmployeeScope;
  expanded: boolean;
  onToggle: () => void;
  /** Receives the previous scope and returns the next — never a bare value, so
   *  two toggles landing in one React batch cannot clobber each other. */
  onChange: (update: (prev: EmployeeScope) => EmployeeScope) => void;
}) {
  const { t } = useAdminLocale();
  const s = t.bookingScopeEditor;
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<number | null>(null);

  const unrestricted = isUnrestricted(scope);

  const byGroup = useMemo(() => {
    const out = new Map<number, ScopeService[]>();
    for (const svc of services) {
      if (svc.groupId == null) continue;
      if (!out.has(svc.groupId)) out.set(svc.groupId, []);
      out.get(svc.groupId)!.push(svc);
    }
    return out;
  }, [services]);

  /**
   * Is this one service selected?
   *
   * Mirrors isServiceAllowed minus its fallback: an unmapped specialist shows
   * every box unticked here, which is what the warning above the list explains.
   * Showing 232 ticked boxes would imply someone had chosen them.
   */
  const isOn = useMemo(() => {
    const allow = new Set(scope.allowServices);
    const deny = new Set(scope.denyServices);
    const cats = new Set(scope.categories);
    return (svc: ScopeService) => {
      if (deny.has(svc.id)) return false;
      if (allow.has(svc.id)) return true;
      return svc.groupId != null && cats.has(svc.groupId);
    };
  }, [scope]);

  const covered = useMemo(
    () => (unrestricted ? services.length : services.filter(isOn).length),
    [services, isOn, unrestricted],
  );

  /** Search spans the whole catalogue; otherwise the list is the category tree. */
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return services.filter((x) => x.title.toLowerCase().includes(q)).slice(0, 80);
  }, [services, query]);

  function setGroup(groupId: number, on: boolean) {
    const ids = (byGroup.get(groupId) ?? []).map((x) => x.id);
    onChange((prev) => ({
      categories: on
        ? [...new Set([...prev.categories, groupId])]
        : prev.categories.filter((c) => c !== groupId),
      // Selecting a whole category supersedes its per-service exceptions, and
      // clearing it drops that category's explicit allows too — otherwise a
      // service would quietly survive a "clear all".
      allowServices: prev.allowServices.filter((id) => !ids.includes(id)),
      denyServices: prev.denyServices.filter((id) => !ids.includes(id)),
    }));
  }

  function toggleService(svc: ScopeService) {
    const on = isOn(svc);
    onChange((prev) => {
      const base = {
        ...prev,
        allowServices: prev.allowServices.filter((id) => id !== svc.id),
        denyServices: prev.denyServices.filter((id) => id !== svc.id),
      };
      const inCategory = svc.groupId != null && prev.categories.includes(svc.groupId);
      if (on) {
        // Turning one off inside a selected category needs an explicit deny;
        // outside one, dropping the allow is enough.
        return inCategory ? { ...base, denyServices: [...base.denyServices, svc.id] } : base;
      }
      return { ...base, allowServices: [...base.allowServices, svc.id] };
    });
  }

  function save() {
    setError(null);
    startSave(async () => {
      try {
        await saveBookingScope(employee.id, employee.name, scope);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (e) {
        setError(e instanceof Error ? e.message : s.saveError);
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-4 p-4 text-left cursor-pointer"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{employee.name}</p>
          <p className="text-xs text-muted-foreground truncate">{employee.position}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`px-2 py-1 rounded-md text-xs whitespace-nowrap ${
              unrestricted ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {unrestricted
              ? `${s.unmappedBadge} (${services.length})`
              : `${covered} ${s.coveredBadge} ${services.length}`}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 flex flex-col gap-4">
          {unrestricted && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2">
              {s.unmappedWarning}
            </p>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={s.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:border-muted-foreground"
            />
          </div>

          {matches ? (
            <div className="flex flex-col gap-1 max-h-[32rem] overflow-y-auto">
              {matches.map((svc) => (
                <ServiceRow key={svc.id} svc={svc} on={isOn(svc)} onToggle={() => toggleService(svc)} />
              ))}
              {matches.length === 0 && (
                <p className="text-xs text-muted-foreground px-1 py-2">{s.noMatches}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[32rem] overflow-y-auto">
              {groups.map((g) => {
                const rows = byGroup.get(g.id) ?? [];
                const on = rows.filter(isOn).length;
                const state = on === 0 ? "none" : on === rows.length ? "all" : "some";
                const isOpen = openGroup === g.id;
                return (
                  <div key={g.id} className="rounded-md border border-border">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={state === "all" ? true : state === "some" ? "mixed" : false}
                        aria-label={g.title}
                        onClick={() => setGroup(g.id, state !== "all")}
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                          state === "none"
                            ? "border-muted-foreground/50 bg-background"
                            : "border-emerald-600 bg-emerald-600 text-white"
                        }`}
                      >
                        {state === "all" && <Check className="w-3 h-3" strokeWidth={3} />}
                        {state === "some" && <Minus className="w-3 h-3" strokeWidth={3} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenGroup(isOpen ? null : g.id)}
                        aria-expanded={isOpen}
                        title={s.expandHint}
                        className="flex-1 min-w-0 flex items-center justify-between gap-3 text-left cursor-pointer"
                      >
                        <span className="text-sm text-foreground truncate">{g.title}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {state === "none" ? rows.length : `${on} / ${rows.length}`}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </span>
                      </button>
                    </div>
                    {isOpen && (
                      <div className="border-t border-border p-2 flex flex-col gap-1">
                        <div className="flex gap-3 px-1 pb-1">
                          <button
                            type="button"
                            onClick={() => setGroup(g.id, true)}
                            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {s.selectAll}
                          </button>
                          <button
                            type="button"
                            onClick={() => setGroup(g.id, false)}
                            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {s.clearAll}
                          </button>
                        </div>
                        {rows.map((svc) => (
                          <ServiceRow
                            key={svc.id}
                            svc={svc}
                            on={isOn(svc)}
                            onToggle={() => toggleService(svc)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-md bg-foreground text-background text-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? s.saving : s.save}
            </button>
            {!unrestricted && (
              <button
                type="button"
                onClick={() => onChange(() => emptyScope())}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {s.reset}
              </button>
            )}
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <Check className="w-3.5 h-3.5" /> {s.saved}
              </span>
            )}
            {error && <span className="text-xs text-rose-600">{error}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/** One service, ticked or not. Kept small — it renders up to 232 times. */
function ServiceRow({
  svc, on, onToggle,
}: {
  svc: ScopeService;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onToggle}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-muted/50 cursor-pointer"
    >
      <span
        className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
          on ? "border-emerald-600 bg-emerald-600 text-white" : "border-muted-foreground/50 bg-background"
        }`}
      >
        {on && <Check className="w-3 h-3" strokeWidth={3} />}
      </span>
      <span className="text-sm text-foreground truncate">{svc.title}</span>
    </button>
  );
}
