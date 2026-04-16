import Image from "next/image";
import type { DoctorItem } from "@/sanity/types";

interface Props {
  title: string;
  doctors: DoctorItem[];
}

export default function RelatedDoctorsStrip({ title, doctors }: Props) {
  if (!doctors?.length) return null;

  return (
    <section>
      <h2 className="heading-2 text-black mb-8">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div
            key={doc._id}
            className="flex items-center gap-4 p-4 rounded-[var(--radius-card)] bg-champagne-dark"
          >
            {doc.photoCard && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-champagne-darker">
                <Image
                  src={doc.photoCard}
                  alt={doc.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div>
              <p className="body-strong text-black">{doc.name}</p>
              {doc.role && <p className="body-s text-muted mt-0.5">{doc.role}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
