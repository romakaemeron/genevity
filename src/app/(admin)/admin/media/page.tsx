import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Image from "next/image";
import { AdminPageHeader } from "../_components/admin-list";

export default async function MediaPage() {
  await requireSession();

  const doctors = await sql`SELECT photo_card, photo_full, name_uk FROM doctors WHERE photo_card IS NOT NULL OR photo_full IS NOT NULL`;
  const equipment = await sql`SELECT photo, name FROM equipment WHERE photo IS NOT NULL`;

  const images: { url: string; label: string; type: string }[] = [];
  doctors.forEach((d) => {
    if (d.photo_card) images.push({ url: d.photo_card, label: d.name_uk, type: "Doctor" });
    if (d.photo_full) images.push({ url: d.photo_full, label: `${d.name_uk} (HQ)`, type: "Doctor" });
  });
  equipment.forEach((e) => {
    if (e.photo) images.push({ url: e.photo, label: e.name, type: "Equipment" });
  });

  return (
    <div className="p-8">
      <AdminPageHeader title="Media Library" subtitle={`${images.length} images in use`} />

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-champagne-dark group">
            <Image src={img.url} alt={img.label} fill className="object-cover" sizes="150px" />
            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] text-white truncate">{img.label}</p>
              <p className="text-[9px] text-white/60">{img.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
