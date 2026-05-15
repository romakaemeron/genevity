"use client";

/**
 * Unsaved-changes guard for the admin.
 *
 * Each editor that holds in-memory state registers itself with
 * `useUnsavedTracker({ id, label, dirty, save, discard })`. When any editor is
 * dirty:
 *   • clicks on in-app <a> links are intercepted → confirmation modal
 *   • the browser's native `beforeunload` prompt fires on tab close / refresh
 *   • the "Stay / Save all / Discard all" modal lets the user choose
 *
 * The store is a ref-backed registry so editors updating their own state
 * (typing a character, toggling a flag) don't re-render the provider on every
 * keystroke. The provider only re-renders when the "any dirty?" summary flips.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo,
  useRef, useState,
} from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface EditorEntry {
  id: string;
  label: string;
  dirty: boolean;
  save: () => Promise<void> | void;
  discard: () => void;
}

interface Ctx {
  register: (e: EditorEntry) => void;
  unregister: (id: string) => void;
  snapshot: () => EditorEntry[];
  anyDirty: boolean;
}

const UnsavedContext = createContext<Ctx | null>(null);

export function useUnsavedCtx() {
  const ctx = useContext(UnsavedContext);
  if (!ctx) throw new Error("useUnsavedCtx outside UnsavedChangesProvider");
  return ctx;
}

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<Map<string, EditorEntry>>(new Map());
  const [anyDirty, setAnyDirty] = useState(false);

  const recomputeDirty = useCallback(() => {
    let dirty = false;
    for (const e of storeRef.current.values()) {
      if (e.dirty) { dirty = true; break; }
    }
    setAnyDirty((prev) => (prev === dirty ? prev : dirty));
  }, []);

  const register = useCallback((entry: EditorEntry) => {
    storeRef.current.set(entry.id, entry);
    recomputeDirty();
  }, [recomputeDirty]);

  const unregister = useCallback((id: string) => {
    storeRef.current.delete(id);
    recomputeDirty();
  }, [recomputeDirty]);

  const snapshot = useCallback(() => Array.from(storeRef.current.values()), []);

  const value = useMemo<Ctx>(() => ({ register, unregister, snapshot, anyDirty }),
    [register, unregister, snapshot, anyDirty]);

  return (
    <UnsavedContext.Provider value={value}>
      {children}
      <UnsavedGuard />
    </UnsavedContext.Provider>
  );
}

/* ---------- Editor hook ---------- */

interface TrackerOptions {
  id: string;
  label: string;
  dirty: boolean;
  save: () => Promise<void> | void;
  discard: () => void;
}

/**
 * Report your editor's dirty state upstream. `save` and `discard` are stored as
 * refs so they can change per render without re-registering.
 */
export function useUnsavedTracker({ id, label, dirty, save, discard }: TrackerOptions) {
  const ctx = useUnsavedCtx();
  const saveRef = useRef(save);
  const discardRef = useRef(discard);
  saveRef.current = save;
  discardRef.current = discard;

  useEffect(() => {
    ctx.register({
      id,
      label,
      dirty,
      save: () => saveRef.current(),
      discard: () => discardRef.current(),
    });
    return () => ctx.unregister(id);
    // Re-register whenever dirty / label changes so the provider knows
  }, [ctx, id, label, dirty]);
}

/* ---------- Guard: intercept navigations ---------- */

function UnsavedGuard() {
  const ctx = useUnsavedCtx();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [working, setWorking] = useState<"save" | "discard" | null>(null);
  // Set to `true` right before a user-confirmed navigation. The beforeunload
  // handler checks this and bails out so Chrome doesn't stack its own
  // "Leave site?" dialog on top of ours.
  const bypassBeforeUnloadRef = useRef(false);

  // beforeunload — native browser prompt on tab close / refresh
  useEffect(() => {
    if (!ctx.anyDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (bypassBeforeUnloadRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [ctx.anyDirty]);

  // Intercept <a> clicks so Next.js Link and plain anchors both show the modal
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ctx.anyDirty) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      if (target.target === "_blank") return;
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;

      // Resolve relative hrefs against current location
      let destination: string;
      try {
        destination = new URL(href, window.location.href).toString();
      } catch {
        return;
      }
      // Same-URL click (just a re-render trigger) — ignore
      if (destination === window.location.href) return;

      e.preventDefault();
      e.stopPropagation();
      setPendingHref(destination);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [ctx.anyDirty]);

  const close = () => setPendingHref(null);

  const goToPending = () => {
    if (!pendingHref) return;
    // Signal to our beforeunload handler that this navigation is intentional
    // so it does NOT fire Chrome's native "Leave site?" prompt on top of ours.
    bypassBeforeUnloadRef.current = true;
    // Use a full assignment so we don't need the Next.js router here
    window.location.href = pendingHref;
  };

  const saveAllAndLeave = async () => {
    if (!pendingHref) return;
    setWorking("save");
    try {
      for (const e of ctx.snapshot()) {
        if (e.dirty) await e.save();
      }
      goToPending();
    } finally {
      setWorking(null);
    }
  };

  const discardAndLeave = () => {
    setWorking("discard");
    for (const e of ctx.snapshot()) {
      if (e.dirty) e.discard();
    }
    setWorking(null);
    goToPending();
  };

  if (!pendingHref || typeof document === "undefined") return null;

  const dirtyEditors = ctx.snapshot().filter((e) => e.dirty);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-champagne-dark rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-champagne-dark text-muted flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="font-heading text-xl text-ink">Unsaved changes</h2>
            <p className="body-m text-muted mt-1">
              You have changes that haven&apos;t been saved yet. What would you like to do?
            </p>
          </div>
        </div>

        <div className="bg-champagne-dark rounded-xl p-4 mb-5 max-h-48 overflow-y-auto">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            {dirtyEditors.length} unsaved section{dirtyEditors.length === 1 ? "" : "s"}
          </p>
          <ul className="flex flex-col gap-1">
            {dirtyEditors.map((e) => (
              <li key={e.id} className="text-sm text-ink flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                {e.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="primary" size="sm" onClick={saveAllAndLeave} disabled={!!working} className="w-full">
            {working === "save" ? "Saving..." : "Save all and leave"}
          </Button>
          <Button variant="neutral" size="sm" onClick={close} disabled={!!working} className="w-full">
            Stay on page
          </Button>
          <Button variant="destructive-outline" size="sm" onClick={discardAndLeave} disabled={!!working} className="w-full">
            Discard changes and leave
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ---------- Generic tracker for native <form> elements ---------- */

interface FormTrackerProps {
  id: string;
  label: string;
  /** Ref to the <form> element to watch. */
  formRef: React.RefObject<HTMLFormElement | null>;
  /** Called to persist the form's current values (typically submit the form). */
  onSave: () => Promise<void> | void;
  /**
   * External dirty signal — e.g. set by parent when it detects a controlled
   * field changed. If provided, it OR's with the native input-change detector.
   */
  externalDirty?: boolean;
  /** Additional non-DOM keys to reset (resetCount) to clear controlled state. */
  onDiscard?: () => void;
}

/**
 * Serialize every form control into a stable JSON string so we can diff the
 * current form state against the initial snapshot. Used to determine whether
 * the user's edits actually change anything vs. them editing and undoing.
 */
export function snapshotForm(form: HTMLFormElement): string {
  const data: Record<string, unknown> = {};
  for (const el of Array.from(form.elements)) {
    const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const name = input.name;
    if (!name) continue;
    if (input instanceof HTMLInputElement) {
      if (input.type === "submit" || input.type === "reset" || input.type === "button") continue;
      if (input.type === "checkbox") {
        data[name] = input.checked;
        continue;
      }
      if (input.type === "radio") {
        if (input.checked) data[name] = input.value;
        continue;
      }
      if (input.type === "file") {
        // Compare by file identity (name+size) — enough to detect a new upload
        data[name] = Array.from(input.files || []).map((f) => `${f.name}:${f.size}`);
        continue;
      }
    }
    // Inputs can share a name (rare in admin), but for our forms it's 1-to-1;
    // later writes simply win, which is fine for diffing.
    data[name] = input.value;
  }
  return JSON.stringify(data);
}

/**
 * Track a native-form `<form>` by snapshot-comparison. Takes a baseline on
 * mount (and after reset), then recomputes dirty whenever an input/change
 * event fires. Dirty flips back to false when the user restores the original
 * values, unlike a simple "was-edited" flag.
 */
export function FormDirtyTracker({
  id, label, formRef, onSave, externalDirty, onDiscard,
}: FormTrackerProps) {
  const initialSnapRef = useRef<string | null>(null);
  const [nativeDirty, setNativeDirty] = useState(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    // Snapshot on the next frame so any deferred hydration (React, ImageUpload
    // hidden inputs, etc.) has settled before we freeze the baseline.
    const take = () => {
      initialSnapRef.current = snapshotForm(form);
      setNativeDirty(false);
    };
    const raf = requestAnimationFrame(take);

    const recompute = () => {
      if (initialSnapRef.current === null) return;
      setNativeDirty(snapshotForm(form) !== initialSnapRef.current);
    };
    const onReset = () => {
      // Defer re-baseline to next frame so `reset` has actually reverted the DOM
      setNativeDirty(false);
      requestAnimationFrame(take);
    };

    form.addEventListener("input", recompute);
    form.addEventListener("change", recompute);
    form.addEventListener("reset", onReset);
    return () => {
      cancelAnimationFrame(raf);
      form.removeEventListener("input", recompute);
      form.removeEventListener("change", recompute);
      form.removeEventListener("reset", onReset);
    };
  }, [formRef]);

  const dirty = nativeDirty || !!externalDirty;

  useUnsavedTracker({
    id,
    label,
    dirty,
    save: async () => {
      await onSave();
      // After save, the form's DOM holds the new values — re-baseline so a
      // subsequent "edit then undo" correctly shows dirty=false again.
      if (formRef.current) initialSnapRef.current = snapshotForm(formRef.current);
      setNativeDirty(false);
    },
    discard: () => {
      formRef.current?.reset();
      setNativeDirty(false);
      onDiscard?.();
    },
  });

  return null;
}
