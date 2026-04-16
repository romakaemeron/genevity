import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface ServiceCard {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  heroImage: string | null;
}

interface Props {
  title: string;
  services: ServiceCard[];
  categorySlug: string;
}

export default function RelatedServicesGrid({ title, services, categorySlug }: Props) {
  if (!services?.length) return null;

  return (
    <section>
      <h2 className="heading-2 text-black mb-8">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <Link
            key={svc._id}
            href={`/services/${categorySlug}/${svc.slug}`}
            className="group flex flex-col rounded-[var(--radius-card)] overflow-hidden bg-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
          >
            {svc.heroImage && (
              <div className="relative aspect-[16/10] bg-champagne-dark">
                <Image
                  src={svc.heroImage}
                  alt={svc.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="flex flex-col gap-2 p-5">
              <h3 className="body-strong text-black group-hover:text-main transition-colors">
                {svc.title}
              </h3>
              {svc.summary && (
                <p className="body-m text-muted line-clamp-2">{svc.summary}</p>
              )}
              <span className="inline-flex items-center gap-1 body-m text-main mt-1">
                Детальніше
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
