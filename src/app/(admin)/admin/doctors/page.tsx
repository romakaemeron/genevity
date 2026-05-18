import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import Image from "next/image";
import { Plus, ArrowUpRight, Settings } from "lucide-react";
import { AdminPageHeader, AdminPrimaryButton } from "../_components/admin-list";

export default async function DoctorsListPage() {
  await requireSession();
  const doctors = await sql`SELECT * FROM doctors ORDER BY sort_order`;

  return (
    <div className="p-8 flex flex-col gap-8">
      <AdminPageHeader
        title="Doctors"
        subtitle={`${doctors.length} physicians`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings/ui-strings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-ink hover:bg-champagne-darker transition-colors"
              title="Edit section texts and labels"
            >
              <Settings size={14} />
              Section texts
            </Link>
            <AdminPrimaryButton href="/admin/doctors/new">
              <Plus size={16} /> Add Doctor
            </AdminPrimaryButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {doctors.map((doc) => (
          <Link
            key={doc.id}
            href={`/admin/doctors/${doc.id}`}
            className="group bg-champagne-dark rounded-[var(--radius-card)] overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
          >
            <div className="w-full aspect-square relative bg-champagne-darker">
              {doc.photo_card ? (
                <Image
                  src={doc.photo_card}
                  alt={`Лікар ${doc.role_uk} ${doc.name_uk} — GENEVITY Дніпро`}
                  fill
                  className="object-cover"
                  style={{ objectPosition: doc.card_position || "center center" }}
                  sizes="300px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-black-20 body-s">
                  No photo
                </div>
              )}
              <span className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${doc.is_published ? "bg-success-light text-success" : "bg-amber-50 text-amber-600"}`}>
                <span aria-hidden style={{ width: 6, height: 6 }} className={`block rounded-full ${doc.is_published ? "bg-success" : "bg-amber-400"}`} />
                {doc.is_published ? "Published" : "Draft"}
              </span>
            </div>
            <div className="p-6 flex flex-col gap-2 flex-1">
              <h3 className="body-strong text-black">{doc.name_uk}</h3>
              <p className="body-m text-main">{doc.role_uk}</p>
              {doc.experience_uk && <p className="body-s text-black-40">{doc.experience_uk}</p>}
              <div className="flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300 mt-auto pt-2 text-sm text-ink">
                Edit
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
