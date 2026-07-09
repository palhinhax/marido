// Renders a JSON-LD structured-data script. Server-safe.
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      // Structured data is trusted, generated server-side from our own content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
