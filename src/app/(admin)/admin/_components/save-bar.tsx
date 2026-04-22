"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { snapshotForm } from "./unsaved-changes";

/**
 * Reads dirty-ness directly off the surrounding <form> by diffing its current
 * values against a snapshot taken on mount. This way Save/Cancel disable
 * themselves when the user edits and then restores the original value, and no
 * per-form wiring is required — SaveBar just walks up to the nearest form.
 */
function useEnclosingFormDirty(anchor: React.RefObject<HTMLElement | null>) {
  const baselineRef = useRef<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const el = anchor.current;
    const form = el?.closest("form") as HTMLFormElement | null;
    if (!form) return;

    const take = () => {
      baselineRef.current = snapshotForm(form);
      setDirty(false);
    };
    const raf = requestAnimationFrame(take);

    const recompute = () => {
      if (baselineRef.current === null) return;
      setDirty(snapshotForm(form) !== baselineRef.current);
    };
    const onReset = () => {
      setDirty(false);
      requestAnimationFrame(take);
    };
    const onSubmit = () => {
      // Re-baseline once the submit has been dispatched so subsequent edits
      // compare against the just-saved values instead of the pre-save state.
      requestAnimationFrame(take);
    };

    form.addEventListener("input", recompute);
    form.addEventListener("change", recompute);
    form.addEventListener("reset", onReset);
    form.addEventListener("submit", onSubmit);
    return () => {
      cancelAnimationFrame(raf);
      form.removeEventListener("input", recompute);
      form.removeEventListener("change", recompute);
      form.removeEventListener("reset", onReset);
      form.removeEventListener("submit", onSubmit);
    };
  }, [anchor]);

  return dirty;
}

function SubmitButton({ label = "Save Changes", dirty }: { label?: string; dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button variant="primary" size="sm" type="submit" disabled={pending || !dirty}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

function CancelButton({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      variant="neutral"
      size="sm"
      type="reset"
      disabled={pending || !dirty}
      title="Revert unsaved edits to the last-saved values"
    >
      Cancel changes
    </Button>
  );
}

export default function SaveBar({ label }: { label?: string }) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const dirty = useEnclosingFormDirty(anchorRef);

  return (
    <div
      ref={anchorRef}
      className="sticky bottom-0 left-0 right-0 bg-champagne border-t border-line px-8 py-4 flex items-center justify-end gap-3 z-10"
    >
      {dirty && <span className="text-xs text-warning">Unsaved changes</span>}
      <CancelButton dirty={dirty} />
      <SubmitButton label={label} dirty={dirty} />
    </div>
  );
}
