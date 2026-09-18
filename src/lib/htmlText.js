// Shared helpers for turning WP REST HTML fragments (titles, excerpts, menu
// labels, etc.) into safe plain text. WordPress's `wptexturize` renders
// typographic characters (curly quotes, en/em dashes, ellipses, apostrophes)
// as numeric HTML entities (e.g. `&#8217;`), so decoding must cover those,
// not just the handful of named entities (&amp;, &lt;, ...).
export function decodeHtml(value) {
  if (value === undefined || value === null) return "";

  return String(value)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function stripHtml(value) {
  if (value === undefined || value === null) return "";
  return decodeHtml(String(value).replace(/<[^>]*>/g, "")).trim();
}

// Same as stripHtml, but also collapses runs of whitespace left behind by
// stripped tags/line breaks into single spaces.
export function stripHtmlWs(value) {
  if (value === undefined || value === null) return "";
  return decodeHtml(String(value).replace(/<[^>]*>?/gm, ""))
    .replace(/\s+/g, " ")
    .trim();
}
