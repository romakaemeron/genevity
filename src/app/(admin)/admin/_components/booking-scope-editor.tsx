"use client";

/**
 * Which services each specialist is offered for in the online booking wizard.
 *
 * Built around categories rather than services on purpose: the 232 bookable
 * services sit in 8 broad headings, so a specialist is usually one or two
 * ticks. Individual services are there for the exceptions, behind a disclosure
 * so they don't dominate the common case.
 *
 * The rule the UI has to make obvious is the fallback — a specialist with
 * nothing ticked is offered **every** service. That is deliberate (the clinic
 * maps doctors one at a time and a half-done mapping must never show a patient
 * an empty list), but it is surprising if unstated, so an untouched specialist
 * is badged rather than left looking merely blank.
 */

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { saveBookingScope } from "../_actions/booking-scope";
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
  const [scopes, setScopes] = useState<Record<number, EmployeeScope>>(() => {
    const out: Record<number, EmployeeScope> = {};
    for (const e of employees) out[e.id] = initial[e.id] ?? emptyScope();
    return out;
  });
  const [open, setOpen] = useState<number | null>(null);

  if (employees.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Не вдалося отримати список спеціалістів із RoApp. Оновіть сторінку
        пізніше — редактор працює лише коли RoApp доступний.
      </p>
    );
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
          onChange={(next) => setScopes((s) => ({ ...s, [e.id]: next }))}
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
  onChange: (next: EmployeeScope) => void;
}) {
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showServices, setShowServices] = useState(false);

  const unrestricted = isUnrestricted(scope);

  /** How many services this specialist is actually offered for, live. */
  const covered = useMemo(() => {
    if (unrestricted) return services.length;
    const cats = new Set(scope.categories);
    const allow = new Set(scope.allowServices);
    const deny = new Set(scope.denyServices);
    return services.filter(
      (s) =>
        !deny.has(s.id) &&
        (allow.has(s.id) || (s.groupId != null && cats.has(s.groupId))),
    ).length;
  }, [services, scope, unrestricted]);

  const visibleServices = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as ScopeService[];
    return services.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 40);
  }, [services, query]);

  function toggleCategory(id: number) {
    const has = scope.categories.includes(id);
    onChange({
      ...scope,
      categories: has
        ? scope.categories.filter((c) => c !== id)
        : [...scope.categories, id],
      // Dropping a category makes its per-service exceptions meaningless;
      // leaving them behind would quietly re-add services later.
      denyServices: has
        ? scope.denyServices.filter(
            (sid) => services.find((s) => s.id === sid)?.groupId !== id,
          )
        : scope.denyServices,
    });
  }

  /** Cycle one service: inherited → explicitly on → explicitly off → inherited. */
  function cycleService(s: ScopeService) {
    const inCategory = s.groupId != null && scope.categories.includes(s.groupId);
    const allowed = scope.allowServices.includes(s.id);
    const denied = scope.denyServices.includes(s.id);
    const base = {
      ...scope,
      allowServices: scope.allowServices.filter((id) => id !== s.id),
      denyServices: scope.denyServices.filter((id) => id !== s.id),
    };
    if (denied) return onChange(base);
    if (allowed) return onChange({ ...base, denyServices: [...base.denyServices, s.id] });
    if (inCategory) return onChange({ ...base, denyServices: [...base.denyServices, s.id] });
    return onChange({ ...base, allowServices: [...base.allowServices, s.id] });
  }

  function serviceState(s: ScopeService): "on" | "off" | "inherited-on" {
    if (scope.denyServices.includes(s.id)) return "off";
    if (scope.allowServices.includes(s.id)) return "on";
    if (s.groupId != null && scope.categories.includes(s.groupId)) return "inherited-on";
    return "off";
  }

  function save() {
    setError(null);
    startSave(async () => {
      try {
        await saveBookingScope(employee.id, employee.name, scope);
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не вдалося зберегти");
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
          {unrestricted ? (
            <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs whitespace-nowrap">
              усі послуги ({services.length})
            </span>
          ) : (
            <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs whitespace-nowrap">
              {covered} з {services.length}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 flex flex-col gap-4">
          {unrestricted && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2">
              Поки нічого не обрано, цьому спеціалісту пропонуються всі послуги.
              Оберіть напрями — і пацієнти бачитимуть лише їх.
            </p>
          )}

          <div>
            <p className="text-xs font-medium text-foreground mb-2">Напрями</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groups.map((g) => {
                const on = scope.categories.includes(g.id);
                return (
                  <label
                    key={g.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md border cursor-pointer transition-colors duration-150 ${
                      on
                        ? "border-emerald-300 bg-emerald-50/60"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleCategory(g.id)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-sm text-foreground flex-1 min-w-0 truncate">
                      {g.title}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {g.serviceCount}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowServices(!showServices)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showServices ? "Сховати" : "Окремі послуги"}
              {scope.allowServices.length + scope.denyServices.length > 0 &&
                ` · ${scope.allowServices.length + scope.denyServices.length} винятків`}
            </button>

            {showServices && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  Для винятків із напрямів вище. Знайдіть послугу й натисніть,
                  щоб увімкнути або вимкнути її окремо.
                </p>
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Пошук послуги…"
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:border-muted-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                  {visibleServices.map((s) => {
                    const st = serviceState(s);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => cycleService(s)}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-border text-left hover:border-muted-foreground/40 cursor-pointer"
                      >
                        <span className="text-sm text-foreground truncate">{s.title}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${
                            st === "on"
                              ? "bg-emerald-50 text-emerald-700"
                              : st === "inherited-on"
                                ? "bg-muted text-muted-foreground"
                                : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {st === "on" ? "увімкнено" : st === "inherited-on" ? "з напряму" : "вимкнено"}
                        </span>
                      </button>
                    );
                  })}
                  {query.trim() && visibleServices.length === 0 && (
                    <p className="text-xs text-muted-foreground px-1 py-2">Нічого не знайдено</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-md bg-foreground text-background text-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? "Збереження…" : "Зберегти"}
            </button>
            {!unrestricted && (
              <button
                type="button"
                onClick={() => onChange(emptyScope())}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Очистити (показувати всі)
              </button>
            )}
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <Check className="w-3.5 h-3.5" /> Збережено
              </span>
            )}
            {error && <span className="text-xs text-rose-600">{error}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
