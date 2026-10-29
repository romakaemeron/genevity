"use client";

import { useActionState } from "react";
import { issueCard, type IssueState } from "../../_actions/loyalty";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import NativeButton from "@/components/ui/Button";
import { useAdminLocale } from "../../_i18n/context";

const TIERS = [10, 15] as const;

export default function IssueForm() {
  const { t } = useAdminLocale();
  const l = t.loyaltyPage;
  const [state, action, pending] = useActionState<IssueState, FormData>(issueCard, {});

  return (
    <Card className="p-6">
      <form action={action} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="loyalty-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {l.nameLabel}
          </label>
          <Input id="loyalty-name" name="name" required maxLength={80} placeholder={l.namePlaceholder} autoComplete="off" />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{l.tierLabel}</legend>
          <div className="flex gap-3">
            {TIERS.map((tier, i) => (
              <label
                key={tier}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm cursor-pointer has-[:checked]:border-main has-[:checked]:bg-main/10"
              >
                <input type="radio" name="tier" value={tier} defaultChecked={i === 0} className="accent-[#8B7B6B]" />
                <span className="font-medium">{l.tierValue(tier)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}

        <div className="flex gap-3">
          <NativeButton type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? l.submitting : l.submit}
          </NativeButton>
          <NativeButton href="/admin/loyalty" variant="neutral" size="sm">{l.back}</NativeButton>
        </div>
      </form>
    </Card>
  );
}
