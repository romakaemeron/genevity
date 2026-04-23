"use client";

/**
 * Admin lead list. Native <table> for rock-solid column alignment,
 * with sortable headers, search, and live polling.
 *
 *   • Search — case-insensitive substring match against name + phone.
 *   • Sort   — click any sortable column header to toggle asc/desc.
 *              Default is created_at descending (newest first).
 *   • Rows   — click anywhere on a row to open the detail page.
 *              The status dropdown inside the first cell stops
 *              propagation so its own click doesn't navigate away.
 *   • Live   — polls the server every POLL_MS for new submissions.
 *              Rows that arrive between polls get a soft highlight
 *              so the admin sees "something new just showed up".
 *              Toggle pauses the poller if it gets distracting.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUp, ArrowDown, ArrowUpDown, Pause, Play } from "lucide-react";
import FormStatusDropdown from "../../_components/form-status-dropdown";
import { listRecentSubmissions, type FormStatus } from "../../_actions/forms";

const POLL_MS = 20_000;    // 20 s — balances freshness against DB load
const FLASH_MS = 4_000;    // how long a newly-arrived row stays highlighted

export interface SubmissionRow {
  id: string;
  status: FormStatus;
  name: string | null;
  phone: string | null;
  direction: string | null;
  form_label: string | null;
  page_url: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string | Date;
}

type SortKey = "status" | "name" | "phone" | "date";

interface Props {
  submissions: SubmissionRow[];
}

function formatDate(raw: string | Date): string {
  const d = raw instanceof Date ? raw : new Date(raw);
  return d.toLocaleString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hostOf(url: string | null): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.hostname + u.pathname;
  } catch {
    return url;
  }
}

export default function SubmissionsTable({ submissions }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Live poll state: local copy of the rows (so the table can update
  // without re-rendering the server page), plus a set of IDs that are
  // brand new relative to the last poll — used to flash-highlight them.
  const [rows, setRows] = useState<SubmissionRow[]>(submissions);
  const [paused, setPaused] = useState(false);
  const [lastPoll, setLastPoll] = useState<number>(Date.now());
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const knownIds = useRef<Set<string>>(new Set(submissions.map((s) => s.id)));

  // Resync when the server page passes in a fresh snapshot (e.g. user
  // navigated back to /admin/forms) so the client state doesn't go stale.
  useEffect(() => {
    setRows(submissions);
    knownIds.current = new Set(submissions.map((s) => s.id));
  }, [submissions]);

  // Poll for new submissions. Fires every POLL_MS while unpaused; the
  // effect re-subscribes whenever paused flips so there's no stray
  // timer hanging around.
  useEffect(() => {
    if (paused) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const latest = await listRecentSubmissions(200);
        if (cancelled) return;
        const latestIds = new Set(latest.map((r) => r.id));
        const newlySeen = latest
          .filter((r) => !knownIds.current.has(r.id))
          .map((r) => r.id);
        if (newlySeen.length > 0) {
          setFreshIds((prev) => {
            const next = new Set(prev);
            for (const id of newlySeen) next.add(id);
            return next;
          });
          // Clear the highlight after the flash window so it doesn't
          // permanently accumulate on every row.
          setTimeout(() => {
            setFreshIds((prev) => {
              const next = new Set(prev);
              for (const id of newlySeen) next.delete(id);
              return next;
            });
          }, FLASH_MS);
        }
        knownIds.current = latestIds;
        setRows(latest as SubmissionRow[]);
        setLastPoll(Date.now());
      } catch {
        // Swallow — next tick will try again. Don't spam console.
      }
    };
    const interval = setInterval(tick, POLL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [paused]);

  const displayed = useMemo(() => {
    let pool = rows;
    const q = query.trim().toLowerCase();
    if (q) {
      pool = pool.filter((r) => {
        const nameMatch = r.name?.toLowerCase().includes(q) ?? false;
        const phoneMatch = r.phone?.toLowerCase().includes(q) ?? false;
        const phoneDigitsMatch = q.replace(/\D+/g, "").length > 0
          && (r.phone || "").replace(/\D+/g, "").includes(q.replace(/\D+/g, ""));
        return nameMatch || phoneMatch || phoneDigitsMatch;
      });
    }

    const dir = sortDir === "asc" ? 1 : -1;
    const sorted = [...pool].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return ((a.name || "").localeCompare(b.name || "", "uk")) * dir;
        case "phone":
          return ((a.phone || "").localeCompare(b.phone || "")) * dir;
        case "status":
          // "new" before "processed" in ascending order
          return (a.status === b.status ? 0 : a.status === "new" ? -1 : 1) * dir;
        case "date":
        default: {
          const at = a.created_at instanceof Date ? a.created_at.getTime() : new Date(a.created_at).getTime();
          const bt = b.created_at instanceof Date ? b.created_at.getTime() : new Date(b.created_at).getTime();
          return (at - bt) * dir;
        }
      }
    });
    return sorted;
  }, [rows, query, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "date" ? "desc" : "asc");
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={11} className="text-stone/70" />;
    return sortDir === "asc"
      ? <ArrowUp size={11} className="text-main" />
      : <ArrowDown size={11} className="text-main" />;
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white overflow-hidden">
      {/* Search bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-champagne-dark/40">
        <Search size={14} className="text-stone shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук за ім'ям або телефоном…"
          className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-stone"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-[11px] text-muted hover:text-ink transition-colors cursor-pointer"
          >
            очистити
          </button>
        )}
        <span className="text-[11px] text-muted whitespace-nowrap">
          {displayed.length} з {rows.length}
        </span>
        <span className="w-px h-4 bg-line" />
        {/* Live-poll indicator — a pulsing green dot when active, a
             muted dot when paused. Click toggles the poller. */}
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted hover:text-ink transition-colors cursor-pointer"
          title={paused ? "Відновити автооновлення" : "Призупинити автооновлення"}
        >
          {paused ? (
            <Play size={11} />
          ) : (
            <span className="relative inline-flex" aria-hidden>
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="absolute inset-0 w-2 h-2 rounded-full bg-success/50 animate-ping" />
            </span>
          )}
          <span>{paused ? "Пауза" : "Живе"}</span>
          {!paused && (
            <span className="text-stone/70 tabular-nums">
              · {new Date(lastPoll).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted">
          {query
            ? "Нічого не знайдено — спробуйте інший запит."
            : "Заявок поки що немає. Вони з'являться тут, щойно відвідувач надішле форму."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 130 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 170 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 200 }} />
              <col />
              <col style={{ width: 110 }} />
              <col style={{ width: 120 }} />
            </colgroup>
            <thead>
              <tr className="bg-champagne-dark/60 text-[11px] font-semibold uppercase tracking-wider text-stone">
                <ColumnHeader label="Статус" sortable onSort={() => handleSort("status")} icon={<SortIcon k="status" />} />
                <ColumnHeader label="Ім'я"    sortable onSort={() => handleSort("name")}   icon={<SortIcon k="name" />} />
                <ColumnHeader label="Телефон" sortable onSort={() => handleSort("phone")}  icon={<SortIcon k="phone" />} />
                <ColumnHeader label="Форма" />
                <ColumnHeader label="Спеціальність" />
                <ColumnHeader label="Сторінка" />
                <ColumnHeader label="Джерело" />
                <ColumnHeader label="Дата" sortable onSort={() => handleSort("date")} icon={<SortIcon k="date" />} align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {displayed.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => router.push(`/admin/forms/${s.id}`)}
                  className={`hover:bg-champagne-dark/40 cursor-pointer transition-colors ${
                    freshIds.has(s.id) ? "bg-main/5 animate-[pulse_1.2s_ease-in-out_2]" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <FormStatusDropdown id={s.id} current={s.status} stopRowNavigation />
                  </td>
                  <td className="px-4 py-3 text-ink truncate">{s.name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-ink truncate">{s.phone || "—"}</td>
                  <td className="px-4 py-3 text-muted text-[13px] truncate">{s.form_label || "—"}</td>
                  <td className="px-4 py-3 text-ink text-[13px] truncate">{s.direction || "—"}</td>
                  <td className="px-4 py-3 text-muted text-[13px] truncate" title={s.page_url || ""}>
                    {hostOf(s.page_url) || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted text-[13px] truncate" title={s.utm_campaign || undefined}>
                    {s.utm_source || "—"}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted text-right whitespace-nowrap">
                    {formatDate(s.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ColumnHeader({
  label, sortable, onSort, icon, align = "left",
}: {
  label: string;
  sortable?: boolean;
  onSort?: () => void;
  icon?: React.ReactNode;
  align?: "left" | "right";
}) {
  const base = `px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`;
  if (!sortable) return <th className={base}>{label}</th>;
  return (
    <th className={`${base} select-none`}>
      <button
        type="button"
        onClick={onSort}
        className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-ink transition-colors ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
      >
        <span>{label}</span>
        {icon}
      </button>
    </th>
  );
}
