import Image from "next/image";
import type { SectionRelatedDoctors } from "@/lib/db/types";

export default function RelatedDoctorsSection({ heading, doctors }: SectionRelatedDoctors) {
  return (
    <section>
      {heading && <h2 className="heading-2 text-black mb-8">{heading}</h2>}
      {doctors?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc._id} className="flex flex-col items-center text-center gap-4">
              {doc.photoCard && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-champagne-dark">
                  <Image
                    src={doc.photoCard}
                    alt={doc.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}
              <div>
                <p className="body-strong text-black">{doc.name}</p>
                {doc.role && <p className="body-m text-muted mt-1">{doc.role}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
