"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import NativeButton from "@/components/ui/Button";
import { refreshAllPassesAction, type RefreshPassesResult } from "../../_actions/loyalty";
import { useAdminLocale } from "../../_i18n/context";

type Done = Extract<RefreshPassesResult, { ok: true }>;

/** Pushes the current (deployed) card design to every active card in both wallets. */
export default function RefreshPassesButton() {
  const { t } = useAdminLocale();
  const l = t.loyaltyPage;
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<Done | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      try {
        const res = await refreshAllPassesAction();
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        setResult(res);
        setConfirming(false);
        toast.success(l.refreshDone(res.cards));
      } catch {
        toast.error(l.errorGeneric);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{l.refreshHint}</p>
      <p className="text-sm text-muted-foreground">{l.refreshLegacyNote}</p>
      {!confirming ? (
        <div>
          <NativeButton type="button" variant="neutral" size="sm" onClick={() => setConfirming(true)}>
            {l.refreshButton}
          </NativeButton>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{l.refreshQuestion}</p>
          <div className="flex gap-2">
            <NativeButton type="button" variant="primary" size="sm" onClick={run} disabled={pending}>
              {pending ? l.refreshing : l.refreshConfirm}
            </NativeButton>
            <NativeButton type="button" variant="neutral" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
              {l.refreshAbort}
            </NativeButton>
          </div>
        </div>
      )}
      {result && (
        <ul className="text-sm flex flex-col gap-1" aria-live="polite">
          <li className="font-medium">{l.refreshDone(result.cards)}</li>
          <li>{result.appleError ? l.refreshAppleError : l.refreshApple(result.applePushed, result.appleFailed)}</li>
          <li>{l.refreshGoogle(result.googleUpdated, result.googleNotSaved, result.googleFailed)}</li>
        </ul>
      )}
    </div>
  );
}
