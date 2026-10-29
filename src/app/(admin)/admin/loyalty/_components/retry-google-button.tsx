"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import NativeButton from "@/components/ui/Button";
import { revokeCardAction } from "../../_actions/loyalty";
import { useAdminLocale } from "../../_i18n/context";

/** Re-sends the (idempotent) Google Wallet expiry for an already cancelled card. */
export default function RetryGoogleButton({ id }: { id: string }) {
  const { t } = useAdminLocale();
  const l = t.loyaltyPage;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      try {
        const res = await revokeCardAction(id);
        if (!res.ok) toast.error(res.error ?? l.errorGeneric);
        else if (res.googleWarning) toast.warning(res.googleWarning);
        else toast.success(l.retryGoogleDone);
        router.refresh();
      } catch {
        toast.error(l.errorGeneric);
      }
    });
  }

  return (
    <NativeButton type="button" variant="neutral" size="sm" onClick={run} disabled={pending}>
      {l.retryGoogle}
    </NativeButton>
  );
}
