// src/app/sitemap.js
// Dynamically generated sitemap from WordPress content.
// Revalidates every 60s (same as page ISR) so new WP content appears quickly.

import { fetchWP } from "@/lib/api";
import { SUPPORTED_LANGS, DEFAULT_LANG, langHref } from "@/config";
import { categoryProductCount } from "@/lib/seo";

export const revalidate = 60;

const SITE_URL = process.env.SITE_URL;
const PER_PAGE = 100;
const MAX_PAGES = 50; // safety cap: 5,000 items per type/language

// langHref adds the language prefix and applies localized paths (/webshop → /webbshop).
function url(lang, path) {
  return `${SITE_URL}${langHref(path, lang)}`;
}

// WP pages that must not be listed: the homepage (listed separately as "/"),
// WooCommerce system pages, thank-you pages and test content.
const SKIPPED_PAGE_SLUGS = new Set([
  "frontpage",
  "hem",
  "cart",
  "checkout",
  "my-account",
  "shop",
  "tack",
  "thankyou",
  "test-page",
]);

// Fetch every item of a type in a language (the REST API caps per_page at 100).
async function fetchAllItems(endpoint, lang) {
  const items = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const batch = await fetchWP(
      `${endpoint}?per_page=${PER_PAGE}&page=${page}&lang=${lang}&_fields=slug,modified,date,meta`
    );
    // Past the last page WP returns an error object instead of an array.
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    if (batch.length < PER_PAGE) break;
  }
  return items;
}

const CONTENT_TYPES = [
  { endpoint: "/wp/v2/pages",      path: (s) => `/${s}`,            priority: 0.8, changeFrequency: "monthly", skip: SKIPPED_PAGE_SLUGS },
  {
    endpoint: "/wp/v2/solutions",
    path: (s) => `/${s}`,
    priority: 0.8,
    changeFrequency: "monthly",
  },
  { endpoint: "/wp/v2/business_areas", path: (s) => `/${s}`,        priority: 0.8, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/case_study", path: (s) => `/${s}`,            priority: 0.7, changeFrequency: "monthly" },
  {
    endpoint: "/wp/v2/posts",
    path: (s) => `/${s}`,
    priority: 0.6,
    changeFrequency: "weekly",
  },
  // Products are served at /{slug} (see next.config redirects for /product/:slug).
  { endpoint: "/wp/v2/product", path: (s) => `/${s}`, priority: 0.7, changeFrequency: "weekly" },
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
      SUPPORTED_LANGS.map((lang) => fetchAllItems(type.endpoint, lang))
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
          url: url(lang, type.path(item.slug, lang)),
          lastModified: new Date(item.modified || item.date),
          changeFrequency: type.changeFrequency,
          priority: type.priority,
        });
      }
    }
  }

  const categoryResults = await Promise.all(
    SUPPORTED_LANGS.map((lang) =>
      fetchWP(`/wp/v2/product_cat?per_page=100&lang=${lang}&_fields=id,slug,parent,count`)
    )
  );

  for (let i = 0; i < SUPPORTED_LANGS.length; i++) {
    const lang = SUPPORTED_LANGS[i];
    const allCategories = Array.isArray(categoryResults[i]) ? categoryResults[i] : [];
    const categories = allCategories.filter((category) => !category.parent);

    for (const category of categories) {
      if (!category.slug) continue;
      // Skip empty categories (no products, also in sub-categories) — they are noindex.
      if (categoryProductCount(category, allCategories) === 0) continue;
      entries.push({
        url: url(lang, `${lang === DEFAULT_LANG ? "/produktkategori" : "/product-category"}/${category.slug}`),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Drop any duplicate URLs (e.g. a slug shared by two content types).
  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
