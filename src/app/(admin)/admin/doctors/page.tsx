import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { getUiStringsNamespace, getUiStringsTree } from "@/lib/db/queries";
import Link from "next/link";
import Image from "next/image";
import { Plus, ArrowUpRight } from "lucide-react";
import NamespaceTextsEditor from "../_components/namespace-texts-editor";
import { AdminPageHeader, AdminPrimaryButton, AdminSectionHeading } from "../_components/admin-list";

export default async function DoctorsListPage() {
  await requireSession();
  const [doctors, doctorsSectionTexts, doctorsPageTexts, fullTree] = await Promise.all([
    sql`SELECT * FROM doctors ORDER BY sort_order`,
    getUiStringsNamespace("doctors"),
    getUiStringsNamespace("doctorsPage"),
    getUiStringsTree(),
  ]);
  const doctorsMetaTexts = ((fullTree.pageMeta as Record<string, unknown>)?.doctors || {}) as Record<string, unknown>;

  return (
    <div className="p-8 flex flex-col gap-10">
      <AdminPageHeader
        title="Doctors"
        subtitle={`${doctors.length} physicians`}
        actions={<AdminPrimaryButton href="/admin/doctors/new"><Plus size={16} /> Add Doctor</AdminPrimaryButton>}
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
                  Photo
                </div>
              )}
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

      <AdminSectionHeading>Doctors section texts (homepage + /doctors)</AdminSectionHeading>
      <p className="body-m text-muted -mt-6">Section title, subtitle, CTA, and experience label.</p>
      <NamespaceTextsEditor namespace="doctors" initial={doctorsSectionTexts} />

      <AdminSectionHeading>Doctors page — filter labels</AdminSectionHeading>
      <p className="body-m text-muted -mt-6">Category filter pills on /doctors.</p>
      <NamespaceTextsEditor namespace="doctorsPage" initial={doctorsPageTexts} />

      <AdminSectionHeading>SEO meta</AdminSectionHeading>
      <p className="body-m text-muted -mt-6">Browser title + description for /doctors.</p>
      <NamespaceTextsEditor namespace="pageMeta.doctors" initial={doctorsMetaTexts} />
    </div>
  );
}
