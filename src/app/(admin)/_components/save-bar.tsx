"use client";

import { useFormStatus } from "react-dom";

function SubmitButton({ label = "Save Changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export default function SaveBar({ label }: { label?: string }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-line px-8 py-4 flex justify-end z-10">
      <SubmitButton label={label} />
    </div>
  );
}
