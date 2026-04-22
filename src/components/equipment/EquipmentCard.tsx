"use client";

import { ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";
import type { EquipmentItem } from "@/lib/db/types";

interface EquipmentCardProps {
  item: EquipmentItem;
  detailsLabel: string;
  onClick: () => void;
}

export default function EquipmentCard({ item, detailsLabel, onClick }: EquipmentCardProps) {
  return (
    <div
      className="group bg-champagne-dark rounded-[var(--radius-card)] p-8 flex flex-col gap-4 cursor-pointer hover:bg-champagne-darker transition-all duration-300 h-full"
      onClick={onClick}
    >
      <h3 className="heading-3 text-black">{item.name}</h3>
      <p className="body-m text-black-60">{item.shortDescription}</p>
      <Button
        variant="outline"
        size="sm"
        className="self-start mt-auto gap-1.5 group-hover:gap-3 transition-all duration-300 px-0"
      >
        {detailsLabel}
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
