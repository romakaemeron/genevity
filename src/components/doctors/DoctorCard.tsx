"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import type { DoctorItem } from "@/lib/db/types";

interface DoctorCardProps {
  doctor: DoctorItem;
  detailsLabel: string;
  experienceLabel?: string;
  onClick: () => void;
  priority?: boolean;
}

const cardClass = "group relative bg-champagne-dark rounded-[var(--radius-card)] overflow-hidden flex flex-col h-full hover:bg-champagne-darker transition-all duration-300 cursor-pointer";

function CardInner({ doctor, detailsLabel, experienceLabel, slug, onClick, priority }: { doctor: DoctorItem; detailsLabel: string; experienceLabel?: string; slug?: string | null; onClick?: () => void; priority?: boolean }) {
  const { name, role, experience, photoCard, cardPosition } = doctor;
  return (
    <>
      <div className={`w-full aspect-square relative ${photoCard ? "skeleton" : "bg-champagne-darker"}`}>
        {photoCard ? (
          <Image
            src={photoCard}
            alt={`Лікар ${role} ${name} – GENEVITY Дніпро`}
            title={name}
            fill
            className="object-cover"
            style={{ objectPosition: cardPosition }}
            sizes="300px"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-black-20 body-s">Photo</div>
        )}
      </div>
      <div className="p-6 flex flex-col gap-2 flex-1">
        <h3 className="body-strong text-black">{name}</h3>
        <p className="body-m text-main">{role}</p>
        {experience && (
          <p className="body-s text-black-40">
            {experienceLabel ? experienceLabel.replace("{years}", experience) : experience}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          href={slug ? `/doctors/${slug}` : undefined}
          onClick={slug ? undefined : onClick}
          className="self-start mt-auto"
        >
          {detailsLabel}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </>
  );
}

export default function DoctorCard({ doctor, detailsLabel, experienceLabel, onClick, priority }: DoctorCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (doctor.slug) {
      router.push(`/doctors/${doctor.slug}`);
    } else {
      onClick();
    }
  };

  return (
    <div className={cardClass} onClick={handleCardClick}>
      <CardInner doctor={doctor} detailsLabel={detailsLabel} experienceLabel={experienceLabel} slug={doctor.slug} onClick={onClick} priority={priority} />
    </div>
  );
}
