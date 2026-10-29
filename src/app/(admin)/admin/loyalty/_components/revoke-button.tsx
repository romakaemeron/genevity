"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import NativeButton from "@/components/ui/Button";
import { revokeCardAction } from "../../_actions/loyalty";
import { useAdminLocale } from "../../_i18n/context";

export default function RevokeButton({ id }: { id: string }) {
  const { t } = useAdminLocale();
  const l = t.loyaltyPage;
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      try {
        const res = await revokeCardAction(id);
        if (!res.ok) {
          toast.error(res.error ?? l.errorGeneric);
          return;
        }
        if (res.googleWarning) toast.warning(res.googleWarning);
        else toast.success(l.cancelDone);
        setConfirming(false);
        router.refresh();
      } catch {
        toast.error(l.errorGeneric);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{l.cancelNote}</p>
      {!confirming ? (
        <div>
          <NativeButton type="button" variant="destructive-outline" size="sm" onClick={() => setConfirming(true)}>
            {l.cancelButton}
          </NativeButton>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{l.cancelQuestion}</p>
          <div className="flex gap-2">
            <NativeButton type="button" variant="destructive" size="sm" onClick={run} disabled={pending}>
              {pending ? l.cancelling : l.cancelConfirm}
            </NativeButton>
            <NativeButton type="button" variant="neutral" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
              {l.cancelAbort}
            </NativeButton>
          </div>
        </div>
      )}
    </div>
  );
}
