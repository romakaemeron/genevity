interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Injects JSON-LD structured data into the page.
 * Content is developer-controlled schema.org data, not user input.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
