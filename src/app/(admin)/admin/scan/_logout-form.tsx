/** Plain form POST (not a server action): restricted roles may not call server actions. */
export default function LogoutForm({ label }: { label: string }) {
  return (
    <form method="post" action="/admin/logout">
      <button
        type="submit"
        className="min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-6 text-base font-medium text-neutral-800 active:bg-neutral-100"
      >
        {label}
      </button>
    </form>
  );
}
