"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { DoctorItem } from "@/lib/db/types";

interface DoctorCardProps {
  doctor: DoctorItem;
  detailsLabel: string;
  onClick: () => void;
}

const cardClass = "group bg-champagne-dark rounded-[var(--radius-card)] overflow-hidden flex flex-col h-full hover:bg-champagne-darker transition-all duration-300 cursor-pointer";

function CardInner({ doctor, detailsLabel }: { doctor: DoctorItem; detailsLabel: string }) {
  const { name, role, experience, photoCard, cardPosition } = doctor;
  return (
    <>
      <div className={`w-full aspect-square relative ${photoCard ? "skeleton" : "bg-champagne-darker"}`}>
        {photoCard ? (
          <Image
            src={photoCard}
            alt={`Лікар ${role} ${name} – GENEVITY Дніпро`}
            fill
            className="object-cover"
            style={{ objectPosition: cardPosition }}
            sizes="300px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-black-20 body-s">Photo</div>
        )}
      </div>
      <div className="p-6 flex flex-col gap-2 flex-1">
        <h3 className="body-strong text-black">{name}</h3>
        <p className="body-m text-main">{role}</p>
        {experience && <p className="body-s text-black-40">{experience}</p>}
        <span className="self-start mt-auto inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300 body-s text-black-60 group-hover:text-main">
          {detailsLabel}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </>
  );
}

export default function DoctorCard({ doctor, detailsLabel, onClick }: DoctorCardProps) {
  if (doctor.slug) {
    return (
      <Link href={`/doctors/${doctor.slug}`} className={cardClass}>
        <CardInner doctor={doctor} detailsLabel={detailsLabel} />
      </Link>
    );
  }
  return (
    <div className={cardClass} onClick={onClick}>
      <CardInner doctor={doctor} detailsLabel={detailsLabel} />
    </div>
  );
}
