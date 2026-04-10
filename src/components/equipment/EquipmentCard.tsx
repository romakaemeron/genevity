"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";

interface EquipmentCardProps {
  index: number;
  onClick: () => void;
}

export default function EquipmentCard({ index, onClick }: EquipmentCardProps) {
  const t = useTranslations("equipment");

  return (
    <div
      className="group bg-champagne-dark rounded-[var(--radius-card)] p-8 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow duration-300 h-full"
      onClick={onClick}
    >
      <h3 className="heading-3 text-black">{t(`items.${index}.name`)}</h3>
      <p className="body-m text-black-60">{t(`items.${index}.shortDescription`)}</p>
      <Button
        variant="outline"
        size="sm"
        className="self-start mt-auto gap-1.5 group-hover:gap-3 transition-all duration-300 px-0"
      >
        {t("details")}
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
