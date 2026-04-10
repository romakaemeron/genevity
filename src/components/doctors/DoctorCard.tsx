"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { DOCTOR_PHOTOS } from "./constants";

interface DoctorCardProps {
  index: number;
  onClick: () => void;
}

export default function DoctorCard({ index, onClick }: DoctorCardProps) {
  const t = useTranslations("doctors");
  const tEquip = useTranslations("equipment");

  const name = t(`items.${index}.name`);
  const role = t(`items.${index}.role`);
  const experience = t(`items.${index}.experience`);
  const photo = DOCTOR_PHOTOS[index];

  return (
    <div
      className="group bg-champagne-dark rounded-[var(--radius-card)] overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className={`w-full aspect-square relative ${photo ? "skeleton" : "bg-champagne-darker"}`}>
        {photo ? (
          <Image
            src={photo.card}
            alt={name}
            fill
            className="object-cover"
            style={{ objectPosition: photo.cardPosition }}
            sizes="300px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-black-20 body-s">
            Photo
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col gap-2 flex-1">
        <h3 className="body-strong text-black">{name}</h3>
        <p className="body-m text-main">{role}</p>
        {experience && (
          <p className="body-s text-black-40">
            {t("experience", { years: experience })}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="self-start mt-auto gap-1.5 group-hover:gap-2.5 transition-all duration-300 px-0"
        >
          {tEquip("details")}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
