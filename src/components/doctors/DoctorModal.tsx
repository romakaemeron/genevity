"use client";

import Image from "next/image";
import BookingCTA from "@/components/ui/BookingCTA";
import type { DoctorItem } from "@/lib/db/types";

interface DoctorModalProps {
  doctor: DoctorItem;
  cta: string;
  experience: string;
}

export default function DoctorModal({ doctor, cta, experience }: DoctorModalProps) {
  const { name, role, experience: years, specialties, photoModal, modalPosition } = doctor;

  const experienceLabel = years ? experience.replace("{years}", years) : null;

  return (
    <div className="flex flex-col">
      {/* Photo — uses modal (high-quality) version */}
      {photoModal && (
        <div className="w-full aspect-[16/10] relative skeleton">
          <Image
            src={photoModal}
            alt={name}
            fill
            className="object-cover"
            style={{ objectPosition: modalPosition }}
            sizes="(max-width: 640px) 100vw, 512px"
            priority
          />
        </div>
      )}

      <div className="p-6 sm:p-8 flex flex-col gap-4">
        <div>
          <h3 className="heading-3 text-black mb-1">{name}</h3>
          <p className="body-l text-main">{role}</p>
          {experienceLabel && (
            <p className="body-m text-black-40 mt-1">
              {experienceLabel}
            </p>
          )}
        </div>

        {specialties.length > 0 && (
          <ul className="flex flex-col gap-1">
            {specialties.map((spec, i) => (
              <li key={i} className="body-m text-black-60 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-main mt-2 shrink-0" />
                {spec}
              </li>
            ))}
          </ul>
        )}

        <BookingCTA variant="primary" className="self-start mt-2">
          {cta}
        </BookingCTA>
      </div>
    </div>
  );
}
