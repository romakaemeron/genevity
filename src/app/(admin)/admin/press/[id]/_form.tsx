"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { MediaMentionAdmin } from "@/lib/db/queries/media";
import { fetchMeta, saveMention, deleteMention } from "../_actions";
import Button from "@/components/ui/Button";

const inputCls =
  "w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border border-line focus:ring-1 focus:ring-main outline-none";
const labelCls = "block text-xs font-semibold text-black-50 uppercase tracking-wider mb-1";

function SubmitBtn({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? "Збереження…" : isNew ? "Створити" : "Зберегти зміни"}
    </Button>
  );
}

export default function PressForm({ mention }: { mention: MediaMentionAdmin | null }) {
  const isNew = !mention;
  const [f, setF] = useState({
    url: mention?.url ?? "",
    publisherName: mention?.publisherName ?? "",
    publisherDomain: mention?.publisherDomain ?? "",
    titleUk: mention?.titleUk ?? "",
    titleRu: mention?.titleRu ?? "",
    titleEn: mention?.titleEn ?? "",
    imageUrl: mention?.imageUrl ?? "",
    logoUrl: mention?.logoUrl ?? "",
    publishedAt: mention?.publishedAt ?? "",
    sortOrder: mention?.sortOrder ?? 0,
    isPublished: mention?.isPublished ?? true,
  });
  const [fetching, startFetch] = useTransition();

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  function autofill() {
    if (!f.url.trim()) return;
    startFetch(async () => {
      const m = await fetchMeta(f.url.trim());
      setF((prev) => ({
        ...prev,
        publisherName: m.publisherName || prev.publisherName,
        publisherDomain: m.publisherDomain || prev.publisherDomain,
        titleUk: m.titleUk || prev.titleUk,
        titleRu: m.titleRu || prev.titleRu,
        titleEn: m.titleEn || prev.titleEn,
        imageUrl: m.imageUrl || prev.imageUrl,
        publishedAt: m.publishedAt || prev.publishedAt,
      }));
    });
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{isNew ? "Нова згадка в ЗМІ" : "Редагування згадки"}</h1>
        {!isNew && (
          <form
            action={deleteMention}
            onSubmit={(e) => {
              if (!confirm("Видалити цю згадку?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={mention.id} />
            <button type="submit" className="text-sm text-red-500 hover:text-red-600">
              Видалити
            </button>
          </form>
        )}
      </div>

      <form action={saveMention} className="flex flex-col gap-6">
        {mention && <input type="hidden" name="id" value={mention.id} />}

        <div>
          <label className={labelCls}>URL статті</label>
          <div className="flex gap-2">
            <input
              name="url"
              value={f.url}
              onChange={(e) => set("url", e.target.value)}
              required
              className={inputCls}
            />
            <button
              type="button"
              onClick={autofill}
              disabled={fetching}
              className="whitespace-nowrap rounded-lg bg-main px-4 py-2 text-sm text-champagne hover:bg-main-dark disabled:opacity-50 transition-colors"
            >
              {fetching ? "Завантаження…" : "Отримати дані"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Видання</label>
            <input
              name="publisherName"
              value={f.publisherName}
              onChange={(e) => set("publisherName", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Домен</label>
            <input
              name="publisherDomain"
              value={f.publisherDomain}
              onChange={(e) => set("publisherDomain", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelCls}>Заголовок (UA)</label>
            <input
              name="titleUk"
              value={f.titleUk}
              onChange={(e) => set("titleUk", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Заголовок (RU)</label>
            <input
              name="titleRu"
              value={f.titleRu}
              onChange={(e) => set("titleRu", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Заголовок (EN)</label>
            <input
              name="titleEn"
              value={f.titleEn}
              onChange={(e) => set("titleEn", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Зображення (URL)</label>
            <input
              name="imageUrl"
              value={f.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Лого (URL, опц.)</label>
            <input
              name="logoUrl"
              value={f.logoUrl}
              onChange={(e) => set("logoUrl", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Дата публікації</label>
            <input
              type="date"
              name="publishedAt"
              value={f.publishedAt ?? ""}
              onChange={(e) => set("publishedAt", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Порядок</label>
            <input
              type="number"
              name="sortOrder"
              value={f.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={f.isPublished}
          />
          Опубліковано
        </label>

        <div className="flex items-center gap-4">
          <SubmitBtn isNew={isNew} />
        </div>
      </form>
    </div>
  );
}
