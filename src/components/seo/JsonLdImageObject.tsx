import { JsonLd } from "./JsonLd";

const BASE = "https://genevity.com.ua";

function absUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

interface Props {
  url: string;
  caption: string;
}

export function JsonLdImageObject({ url, caption }: Props) {
  if (!url) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org/",
        "@type": "ImageObject",
        contentUrl: absUrl(url),
        creditText: "GENEVITY",
        caption,
        creator: {
          "@type": "Organization",
          name: "GENEVITY",
        },
      }}
    />
  );
}
