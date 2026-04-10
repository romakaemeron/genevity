"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { DOCTOR_PHOTOS } from "./constants";

interface DoctorModalProps {
  index: number;
}

export default function DoctorModal({ index }: DoctorModalProps) {
  const t = useTranslations("doctors");

  const name = t(`items.${index}.name`);
  const role = t(`items.${index}.role`);
  const experience = t(`items.${index}.experience`);
  const photo = DOCTOR_PHOTOS[index];

  const specialties = (() => {
    const result = [];
    for (let i = 0; i < 8; i++) {
      const key = `items.${index}.specialties.${i}`;
      if (!t.has(key)) break;
      result.push(t(key));
    }
    return result;
  })();

  return (
    <div className="flex flex-col">
      {/* Photo — uses modal (high-quality) version */}
      {photo && (
        <div className="w-full aspect-[16/10] relative">
          <Image
            src={photo.modal}
            alt={name}
            fill
            className="object-cover"
            style={{ objectPosition: photo.modalPosition }}
            sizes="(max-width: 640px) 100vw, 512px"
            priority
          />
        </div>
      )}

      <div className="p-6 sm:p-8 flex flex-col gap-4">
        <div>
          <h3 className="heading-3 text-black mb-1">{name}</h3>
          <p className="body-l text-main">{role}</p>
          {experience && (
            <p className="body-m text-black-40 mt-1">
              {t("experience", { years: experience })}
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

        <Button variant="primary" href="#booking" className="self-start mt-2">
          {t("cta")}
        </Button>
      </div>
    </div>
  );
}
