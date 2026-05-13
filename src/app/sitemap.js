// src/app/sitemap.js
// Dynamically generated sitemap from WordPress content.
// Revalidates every 60s (same as page ISR) so new WP content appears quickly.

import { fetchWP } from "@/lib/api";
import { SUPPORTED_LANGS, DEFAULT_LANG } from "@/config";

export const revalidate = 60;

const SITE_URL = process.env.SITE_URL;

function url(lang, path) {
  const prefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
  return `${SITE_URL}${prefix}${path}`;
}

const CONTENT_TYPES = [
  { endpoint: "/wp/v2/pages",      path: (s) => `/${s}`,            priority: 0.8, changeFrequency: "monthly", skip: new Set(["frontpage"]) },
  { endpoint: "/wp/v2/services",   path: (s) => `/service/${s}`,    priority: 0.8, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/case_study", path: (s) => `/case-study/${s}`, priority: 0.7, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/posts",      path: (s) => `/post/${s}`,       priority: 0.6, changeFrequency: "weekly"  },
];

export default async function sitemap() {
  const entries = [];

  // Homepages — one per language
  for (const lang of SUPPORTED_LANGS) {
    entries.push({
      url: lang === DEFAULT_LANG ? `${SITE_URL}/` : `${SITE_URL}/${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    });
  }

  // Content types — fetch all languages in parallel per type
  for (const type of CONTENT_TYPES) {
    const results = await Promise.all(
      SUPPORTED_LANGS.map((lang) =>
        fetchWP(`${type.endpoint}?per_page=100&lang=${lang}`)
      )
    );

    for (let i = 0; i < SUPPORTED_LANGS.length; i++) {
      const lang = SUPPORTED_LANGS[i];
      const items = Array.isArray(results[i]) ? results[i] : [];
      for (const item of items) {
        if (type.skip?.has(item.slug)) continue;
        // Exclude pages explicitly set to noindex in Yoast Advanced Settings.
        // Checks raw per-page meta (not aggregated robots which includes global WP noindex).
        if (item.meta?.["_yoast_wpseo_meta-robots-noindex"] === "1") continue;
        entries.push({
          url: url(lang, type.path(item.slug)),
          lastModified: new Date(item.modified || item.date),
          changeFrequency: type.changeFrequency,
          priority: type.priority,
        });
      }
    }
  }

  return entries;
}
