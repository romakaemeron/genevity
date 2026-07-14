import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ShieldCheck } from "lucide-react";

interface Props {
  name: string;
  role: string;
  slug: string | null;
  photoCircle: string | null;
  date: string | null;
  label: string; // "Перевірено лікарем"
  updatedLabel: string; // "оновлено"
}

export default function ReviewedByBadge({ name, role, slug, photoCircle, date, label, updatedLabel }: Props) {
  const inner = (
    <span className="inline-flex items-center gap-3 rounded-[var(--radius-card)] bg-champagne-dark px-4 py-3">
      {photoCircle ? (
        <Image src={photoCircle} alt={name} width={40} height={40} className="rounded-full object-cover w-10 h-10" />
      ) : (
        <ShieldCheck className="w-5 h-5 text-main" />
      )}
      <span className="flex flex-col">
        <span className="body-s text-muted">{label}</span>
        <span className="body-strong text-black text-sm">
          {name}{role ? `, ${role}` : ""}
        </span>
        {date && <span className="body-s text-muted">{updatedLabel}: {date}</span>}
      </span>
    </span>
  );
  return slug ? <Link href={`/doctors/${slug}`} className="hover:opacity-80 transition-opacity">{inner}</Link> : inner;
}
