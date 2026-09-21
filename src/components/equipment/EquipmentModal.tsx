"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { EquipmentItem } from "@/lib/db/types";
import { isPreOptimized } from "@/lib/image-src";

interface EquipmentModalProps {
  item: EquipmentItem;
  suitsTitle: string;
  resultsTitle: string;
  servicesTitle: string;
  /** Slug of the page the modal is opened from, so a service page's equipment
   *  modal doesn't link back to itself. */
  excludeServiceSlug?: string;
}

function ModalText({ item, suitsTitle, resultsTitle, servicesTitle, excludeServiceSlug }: EquipmentModalProps) {
  const services = excludeServiceSlug
    ? item.services.filter((s) => s.slug !== excludeServiceSlug)
    : item.services;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="heading-3 text-black mb-2">{item.name}</h3>
        <p className="body-l text-black-80">{item.description}</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="body-strong text-black">{suitsTitle}</p>
        <ul className="flex flex-col gap-1">
          {item.suits.map((suit, i) => (
            <li key={i} className="body-m text-black-60 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-main mt-2 shrink-0" />
              {suit}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <p className="body-strong text-black">{resultsTitle}</p>
        <ul className="flex flex-col gap-1">
          {item.results.map((result, i) => (
            <li key={i} className="body-m text-black-60 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
              {result}
            </li>
          ))}
        </ul>
      </div>

      {/* Service landing pages this device is used for. Most devices power
          several procedures, so every linked service gets its own link rather
          than the modal guessing at one. */}
      {services.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-black-10 pt-4">
          <p className="body-strong text-black">{servicesTitle}</p>
          <ul className="flex flex-col">
            {services.map((service) => (
              <li key={`${service.categorySlug}/${service.slug}`}>
                <Link
                  href={`/services/${service.categorySlug}/${service.slug}`}
                  className="group flex items-center gap-1.5 -mx-2 px-2 py-1.5 rounded-lg body-m text-main hover:bg-champagne-dark transition-colors"
                >
                  <span className="underline decoration-transparent group-hover:decoration-current transition-colors">
                    {service.title}
                  </span>
                  <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.note && (
        <p className="body-s text-black-40 border-t border-black-10 pt-4">
          {item.note}
        </p>
      )}
    </div>
  );
}

export default function EquipmentModal({ item, suitsTitle, resultsTitle, servicesTitle, excludeServiceSlug }: EquipmentModalProps) {
  if (!item.photo) {
    return (
      <div className="p-6 sm:p-8 pt-12">
        <ModalText item={item} suitsTitle={suitsTitle} resultsTitle={resultsTitle} servicesTitle={servicesTitle} excludeServiceSlug={excludeServiceSlug} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Photo — left on desktop, top on mobile */}
      <div className="relative lg:w-[45%] shrink-0 bg-champagne-dark overflow-hidden">
        <div className="relative w-full h-64 lg:h-full lg:min-h-[480px]">
          <Image
            src={item.photo} unoptimized={isPreOptimized(item.photo)}
            alt={item.name}
            title={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 400px"
          />
        </div>
      </div>

      {/* Text — right on desktop, below on mobile */}
      <div className="flex-1 p-6 sm:p-8 pt-12 lg:pt-8 overflow-y-auto lg:max-h-[80vh]">
        <ModalText item={item} suitsTitle={suitsTitle} resultsTitle={resultsTitle} servicesTitle={servicesTitle} excludeServiceSlug={excludeServiceSlug} />
      </div>
    </div>
  );
}
