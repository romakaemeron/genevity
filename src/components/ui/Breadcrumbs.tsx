import { Link } from "@/i18n/navigation";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";
import { absoluteUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface Props {
  items: BreadcrumbItem[];
  locale: Locale;
}

export default function Breadcrumbs({ items, locale }: Props) {
  const jsonLdItems = items.map((item) => ({
    name: item.label,
    url: absoluteUrl(item.href, locale),
  }));

  return (
    <>
      <JsonLdBreadcrumbList items={jsonLdItems} />
      <nav aria-label="Breadcrumb" className="body-s text-muted">
        <ol className="flex items-center gap-1.5 flex-wrap">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-black-20">/</span>}
                {isLast ? (
                  <span className="text-black">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-main transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
