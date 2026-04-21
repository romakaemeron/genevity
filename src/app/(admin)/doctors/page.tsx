import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import Image from "next/image";
import { Plus, User } from "lucide-react";

export default async function DoctorsListPage() {
  await requireSession();

  const doctors = await sql`SELECT * FROM doctors ORDER BY sort_order`;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-2 text-ink">Doctors</h1>
          <p className="body-m text-muted mt-1">{doctors.length} physicians</p>
        </div>
        <Link
          href="/doctors/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors"
        >
          <Plus size={16} /> Add Doctor
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {doctors.map((doc) => (
          <Link
            key={doc.id}
            href={`/doctors/${doc.id}`}
            className="bg-white rounded-2xl border border-line hover:border-main/30 hover:shadow-md transition-all overflow-hidden group"
          >
            <div className="relative aspect-[3/4] bg-champagne-dark">
              {doc.photo_card ? (
                <Image
                  src={doc.photo_card}
                  alt={doc.name_uk}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  sizes="200px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted">
                  <User size={40} strokeWidth={1} />
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-ink truncate">{doc.name_uk}</p>
              <p className="text-xs text-muted truncate mt-0.5">{doc.role_uk}</p>
              {doc.experience_uk && (
                <p className="text-xs text-main mt-1">{doc.experience_uk}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
