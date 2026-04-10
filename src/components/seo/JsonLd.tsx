interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Injects JSON-LD structured data into the page.
 * Content is developer-controlled schema.org data, not user input.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
