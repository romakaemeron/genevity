import { JsonLd } from "./JsonLd";

/**
 * schema.org BreadcrumbList structured data.
 * @see https://schema.org/BreadcrumbList
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export function JsonLdBreadcrumbList({ items }: Props) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
