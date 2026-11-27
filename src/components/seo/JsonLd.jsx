// src/components/seo/JsonLd.jsx
// Renders structured data (schema.org JSON-LD). Server component.

export default function JsonLd({ data }) {
  if (!data) return null;

  // Escape "<" so content can never close the script tag early.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
