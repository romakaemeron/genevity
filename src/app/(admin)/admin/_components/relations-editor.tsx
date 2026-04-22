"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { saveServiceRelations } from "../_actions/relations";

interface Option {
  id: string;
  label: string;
  sub?: string;
}

interface Props {
  serviceId: string;
  initial: { doctorIds: string[]; relatedServiceIds: string[]; equipmentIds: string[] };
  doctors: Option[];
  services: Option[];
  equipment: Option[];
}

export default function RelationsEditor({ serviceId, initial, doctors, services, equipment }: Props) {
  const [doctorIds, setDoctorIds] = useState(initial.doctorIds);
  const [relatedServiceIds, setRelatedServiceIds] = useState(initial.relatedServiceIds);
  const [equipmentIds, setEquipmentIds] = useState(initial.equipmentIds);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const save = () => {
    startTransition(async () => {
      await saveServiceRelations(serviceId, { doctorIds, relatedServiceIds, equipmentIds });
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Picker label="Related doctors" options={doctors} value={doctorIds} onChange={setDoctorIds} />
      <Picker label="Related services" options={services} value={relatedServiceIds} onChange={setRelatedServiceIds} />
      <Picker label="Related equipment" options={equipment} value={equipmentIds} onChange={setEquipmentIds} />

      <div className="flex items-center gap-3">
        <div className="flex-1" />
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving..." : "Save relations"}
        </button>
      </div>
    </div>
  );
}

function Picker({ label, options, value, onChange }: { label: string; options: Option[]; value: string[]; onChange: (v: string[]) => void }) {
  const [query, setQuery] = useState("");
  const selected = value.map((id) => options.find((o) => o.id === id)).filter(Boolean) as Option[];
  const available = options.filter(
    (o) => !value.includes(o.id) && (query === "" || o.label.toLowerCase().includes(query.toLowerCase())),
  );

  const remove = (id: string) => onChange(value.filter((v) => v !== id));
  const add = (id: string) => {
    onChange([...value, id]);
    setQuery("");
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">{label} ({selected.length})</label>

      {selected.length > 0 && (
        <div className="flex flex-col gap-1 mb-1">
          {selected.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-champagne/60 border border-line">
              <span className="text-xs text-muted w-6">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-ink truncate">{opt.label}</div>
                {opt.sub && <div className="text-[11px] text-muted truncate">{opt.sub}</div>}
              </div>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="text-muted hover:text-ink disabled:opacity-20 transition-colors cursor-pointer text-xs">↑</button>
              <button type="button" disabled={i === selected.length - 1} onClick={() => move(i, 1)} className="text-muted hover:text-ink disabled:opacity-20 transition-colors cursor-pointer text-xs">↓</button>
              <button type="button" onClick={() => remove(opt.id)} className="text-muted hover:text-error transition-colors cursor-pointer">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${label.toLowerCase()}...`}
        className="px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20"
      />
      {query && available.length > 0 && (
        <div className="rounded-lg border border-line bg-champagne-dark max-h-48 overflow-y-auto">
          {available.slice(0, 20).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => add(opt.id)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-champagne/60 transition-colors cursor-pointer border-b border-line last:border-b-0"
            >
              <div className="text-ink">{opt.label}</div>
              {opt.sub && <div className="text-[11px] text-muted">{opt.sub}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
