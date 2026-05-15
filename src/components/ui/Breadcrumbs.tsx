import { Link } from "@/i18n/navigation";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";
import { absoluteUrl } from "@/lib/url";
import type { Locale } from "@/i18n/routing";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface Props {
  items: BreadcrumbItem[];
  locale: Locale;
  variant?: "light" | "dark";
}

export default function Breadcrumbs({ items, locale, variant = "dark" }: Props) {
  const jsonLdItems = items.map((item) => ({
    name: item.label,
    url: absoluteUrl(item.href, locale),
  }));

  const textClass = variant === "light" ? "text-white-60" : "text-muted";
  const activeClass = variant === "light" ? "text-champagne" : "text-black";
  const dividerClass = variant === "light" ? "text-white-20" : "text-black-20";
  const hoverClass = variant === "light" ? "hover:text-champagne" : "hover:text-main";

  return (
    <>
      <JsonLdBreadcrumbList items={jsonLdItems} />
      <nav aria-label="Breadcrumb" className={`body-s ${textClass}`}>
        <ol className="flex items-center gap-1.5 flex-wrap">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {i > 0 && <span className={dividerClass}>/</span>}
                {isLast ? (
                  <span className={activeClass}>{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className={`${hoverClass} transition-colors`}
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
