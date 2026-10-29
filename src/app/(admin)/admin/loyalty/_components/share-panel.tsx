"use client";

import { useState } from "react";
import NativeButton from "@/components/ui/Button";
import { useAdminLocale } from "../../_i18n/context";

/** `qrSvgMarkup` is generated server-side by our own qrSvg() from our own URL; it never contains user input. */
export default function SharePanel({ url, qrSvgMarkup }: { url: string; qrSvgMarkup: string }) {
  const { t } = useAdminLocale();
  const l = t.loyaltyPage;
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="w-64 max-w-full bg-white p-3 rounded-xl border border-border [&>svg]:w-full [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
      />
      <p className="text-sm text-muted-foreground">{l.shareHint}</p>
      <div className="flex items-center gap-3">
        <NativeButton type="button" variant="primary" size="sm" onClick={copy}>
          {state === "copied" ? l.copied : l.copyLink}
        </NativeButton>
      </div>
      {state === "failed" && (
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">{l.copyFallback}</p>
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"
          />
        </div>
      )}
    </div>
  );
}
