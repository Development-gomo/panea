// src/lib/seo.js

import { DEFAULT_LANG, LOCALE_MAP, SUPPORTED_LANGS } from "@/config";
import { stripHtmlWs as stripHtml } from "@/lib/htmlText";

// Public site URL (e.g. https://www.panea.se) — used for canonical / og:url / hreflang.
const SITE_URL = String(process.env.SITE_URL || "").replace(/\/+$/, "");

// WordPress origin (e.g. https://backend.panea.se) — Yoast builds every URL on it.
const WP_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_WP_BASE).origin;
  } catch {
    return "";
  }
})();

// WP post-type URL bases. The frontend serves all of these at /{slug} (or /en/{slug}).
const WP_TYPE_BASES = ["product", "case-study", "solution", "business-area"];

// Used when an entry has no Yoast description and no excerpt.
const DEFAULT_DESCRIPTIONS = {
  sv: "Panea skapar kontor, hotell, restauranger, caféer och bagerier som fungerar – från analys och design till inköp, installation och service. Sedan 1978.",
  en: "Panea creates offices, hotels, restaurants, cafés and bakeries that work – from analysis and design to procurement, installation and service. Since 1978.",
};

// Fixed frontend URLs of the archive pages, per language (used for canonical + hreflang).
export const ARCHIVE_PATHS = {
  articles: { sv: "/artiklar", en: "/en/article" },
  cases: { sv: "/cases", en: "/en/cases" },
  career: { sv: "/karriar", en: "/en/career" },
  webshop: { sv: "/webbshop", en: "/en/webshop" },
};

/** Metadata options (path + alternatePaths) for an archive page in a language. */
export function archiveSeoOptions(archive, lang) {
  const paths = ARCHIVE_PATHS[archive];
  if (!paths) return {};
  return { path: paths[lang] || null, alternatePaths: paths };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Frontend path for a slug in a language: ("sv","x") → "/x", ("en","x") → "/en/x". */
export function localizedPath(lang, path = "") {
  const clean = path ? `/${String(path).replace(/^\/+/, "")}` : "";
  if (lang === DEFAULT_LANG) return clean || "/";
  return `/${lang}${clean}`;
}

/** Absolute public URL for a frontend path. Falls back to the path if SITE_URL is unset. */
export function absoluteUrl(path = "/") {
  if (!path) return SITE_URL || "/";
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL ? `${SITE_URL}${path === "/" ? "/" : path}` : path;
}

/**
 * Rewrite a WordPress URL (https://backend…/product/x/) to its public frontend URL
 * (https://www…/x). Media/API URLs (wp-content, wp-json, wp-includes) are left alone.
 */
export function toFrontendUrl(url) {
  if (!url || typeof url !== "string" || !WP_ORIGIN || !SITE_URL) return url;
  if (!url.startsWith(WP_ORIGIN)) return url;

  let path = url.slice(WP_ORIGIN.length) || "/";
  if (/^\/wp-(content|json|includes|admin)\b/.test(path)) return url;

  const typeBases = WP_TYPE_BASES.map(escapeRegExp).join("|");
  path = path.replace(new RegExp(`^(/[a-z]{2})?/(?:${typeBases})(?=/|$)`), "$1");
  // Swedish product categories live at /produktkategori on the frontend.
  path = path.replace(/^\/product-category(?=\/|$)/, "/produktkategori");

  // Drop trailing slash (except root) to match the frontend's URLs.
  const [pathname, ...rest] = path.split(/(?=[?#])/);
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return `${SITE_URL}${normalized || "/"}${rest.join("")}`;
}

// Google shows ~155–160 characters of a meta description; cut longer ones at a word.
const MAX_DESCRIPTION_LENGTH = 160;

export function truncateDescription(text, max = MAX_DESCRIPTION_LENGTH) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}

// Yoast's default term title is "X-arkiv - Panea" / "X Archives - Panea".
export function stripArchiveSuffix(title) {
  if (!title) return title;
  return String(title).replace(/\s*-?\s*(arkiv|archives?)(?=\s*(?:[-|–]|$))/i, "");
}

// First image found in ACF data (e.g. the banner) — used when there is no og:image.
function findFirstAcfImage(value, depth = 0) {
  if (!value || depth > 8) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstAcfImage(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value !== "object") return null;
  if (
    typeof value.url === "string" &&
    (value.type === "image" || /^image\/(jpe?g|png|webp)$/.test(value.mime_type || "")) &&
    !/\.svg$/i.test(value.url)
  ) {
    return { url: value.url, width: value.width, height: value.height, alt: value.alt || undefined };
  }
  for (const child of Object.values(value)) {
    const found = findFirstAcfImage(child, depth + 1);
    if (found) return found;
  }
  return null;
}

/**
 * Number of products in a category including its sub-categories.
 * Returns null when the counts are unknown (so callers never hide a category by mistake).
 */
export function categoryProductCount(category, allCategories = []) {
  if (!category || typeof category.count !== "number") return null;
  const list = Array.isArray(allCategories) ? allCategories : [];
  const total = (cat, depth = 0) =>
    (Number(cat?.count) || 0) +
    (depth > 5
      ? 0
      : list
          .filter((child) => Number(child?.parent) === Number(cat.id))
          .reduce((sum, child) => sum + total(child, depth + 1), 0));
  return total(category);
}

/**
 * Share image for a product category: the first product in it (or in one of its
 * sub-categories) that has an image. Categories have no image of their own.
 */
export function categoryShareImage(category, products = [], allCategories = []) {
  if (!category?.id || !Array.isArray(products)) return null;
  const ids = new Set([Number(category.id)]);
  // Add descendants (categories are a shallow tree, a few passes is enough).
  for (let pass = 0; pass < 3; pass += 1) {
    for (const cat of Array.isArray(allCategories) ? allCategories : []) {
      if (ids.has(Number(cat?.parent))) ids.add(Number(cat.id));
    }
  }
  for (const product of products) {
    const cats = Array.isArray(product?.product_cat) ? product.product_cat : [];
    if (!cats.some((id) => ids.has(Number(id)))) continue;
    const og = product?.yoast_head_json?.og_image?.[0];
    if (og?.url) return { url: og.url, width: og.width, height: og.height };
    const featured = product?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    if (featured) return { url: featured };
  }
  return null;
}

/**
 * Rewrite links to the WordPress backend inside HTML content to the public site,
 * e.g. href="https://backend…/product/x/" → href="https://www…/x". Media links are kept.
 */
export function rewriteBackendLinks(html) {
  if (!html || typeof html !== "string" || !WP_ORIGIN || !SITE_URL) return html;
  if (!html.includes(WP_ORIGIN)) return html;
  return html.replace(/href=(["'])([^"']+)\1/gi, (match, quote, href) =>
    href.startsWith(WP_ORIGIN) ? `href=${quote}${toFrontendUrl(href)}${quote}` : match
  );
}

function mapOgImages(images = []) {
  if (!Array.isArray(images)) return undefined;
  const mapped = images
    .map((img) => {
      if (!img?.url) return null;
      return {
        url: img.url,
        width: img.width,
        height: img.height,
        type: img.type,
        alt: img.alt,
      };
    })
    .filter(Boolean);
  return mapped.length > 0 ? mapped : undefined;
}

// { sv: "/x", en: "/en/y" } → { sv: abs, en: abs, "x-default": abs(sv) }
function buildLanguageAlternates(alternatePaths) {
  if (!alternatePaths || typeof alternatePaths !== "object") return undefined;

  const languages = {};
  for (const lang of SUPPORTED_LANGS) {
    if (alternatePaths[lang]) languages[lang] = absoluteUrl(alternatePaths[lang]);
  }
  if (Object.keys(languages).length < 2) return undefined;

  if (languages[DEFAULT_LANG]) languages["x-default"] = languages[DEFAULT_LANG];
  return languages;
}

/**
 * Build Next.js metadata from an entry's Yoast data.
 *
 * Options:
 *   lang             – current language
 *   path             – this page's frontend path ("/x", "/en/y"); enables canonical + og:url
 *   alternatePaths   – { sv: "/x", en: "/en/y" }; enables hreflang alternates
 *   fallbackTitle / fallbackDescription
 */
export function buildMetadataFromYoast(entry, options = {}) {
  const {
    lang = DEFAULT_LANG,
    fallbackTitle = "Panea",
    fallbackDescription = DEFAULT_DESCRIPTIONS[lang] || DEFAULT_DESCRIPTIONS[DEFAULT_LANG],
    path = null,
    alternatePaths = null,
    isArchiveTerm = false,
    fallbackImage = null,
  } = options;

  const canonical = path ? absoluteUrl(path) : undefined;
  const languages = buildLanguageAlternates(alternatePaths);
  const alternates =
    canonical || languages
      ? {
          ...(canonical ? { canonical } : {}),
          ...(languages ? { languages } : {}),
        }
      : undefined;

  if (!entry) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      ...(alternates ? { alternates } : {}),
    };
  }

  const yoast = entry.yoast_head_json;
  const renderedTitle = stripHtml(entry?.title?.rendered);
  const renderedExcerpt = stripHtml(entry?.excerpt?.rendered);

  const cleanTitle = (value) => (isArchiveTerm ? stripArchiveSuffix(value) : value);
  const title = cleanTitle(yoast?.title) || renderedTitle || fallbackTitle;
  const description = truncateDescription(
    yoast?.description ||
      yoast?.og_description ||
      renderedExcerpt ||
      fallbackDescription
  );

  const metadata = {
    title,
    description,
    alternates,
    openGraph: {
      title: cleanTitle(yoast?.og_title) || title,
      description: yoast?.og_description ? truncateDescription(yoast.og_description, 200) : description,
      url: canonical || toFrontendUrl(yoast?.og_url),
      siteName: yoast?.og_site_name,
      type: yoast?.og_type || (entry?.type === "case_study" ? "article" : "website"),
      locale: yoast?.og_locale || LOCALE_MAP[lang] || LOCALE_MAP[DEFAULT_LANG],
      images: mapOgImages(yoast?.og_image),
    },
    twitter: {
      card: yoast?.twitter_card || "summary_large_image",
      title: cleanTitle(yoast?.twitter_title || yoast?.og_title) || title,
      description: truncateDescription(
        yoast?.twitter_description || yoast?.og_description || description,
        200
      ),
      images: yoast?.twitter_image ? [yoast.twitter_image] : undefined,
    },
    robots: yoast?.robots
      ? {
          index: yoast.robots.index !== "noindex",
          follow: yoast.robots.follow !== "nofollow",
        }
      : undefined,
  };

  if (!metadata.openGraph.images) {
    const featuredMedia =
      entry?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      entry?.featured_image_url;
    if (featuredMedia) {
      metadata.openGraph.images = [{ url: featuredMedia }];
    } else {
      // Last resort: the page's first content image (usually the banner).
      const acfImage = findFirstAcfImage(entry?.acf) || fallbackImage;
      if (acfImage?.url) metadata.openGraph.images = [acfImage];
    }
  }

  if (!metadata.twitter.images && metadata.openGraph.images?.[0]?.url) {
    metadata.twitter.images = [metadata.openGraph.images[0].url];
  }

  return metadata;
}

/**
 * Yoast's JSON-LD schema graph for an entry, with WordPress URLs rewritten to the
 * public site. The entry's own URL is replaced with `path` when given, so the
 * schema matches the canonical. Returns null when there is no schema.
 */
export function buildSchemaFromYoast(entry, { path = null, organization = null } = {}) {
  const schema = entry?.yoast_head_json?.schema;
  if (!schema || typeof schema !== "object") return null;
  const withOrg = (graph) => addOrganization(graph, organization);

  const ownUrl = path ? absoluteUrl(path) : null;
  const ownWpUrls = [entry?.yoast_head_json?.og_url, entry?.yoast_head_json?.canonical, entry?.link]
    .filter((u) => typeof u === "string" && u);

  const rewrite = (value) => {
    if (typeof value === "string") {
      if (!value.startsWith(WP_ORIGIN) || !WP_ORIGIN) return value;
      if (ownUrl) {
        for (const wpUrl of ownWpUrls) {
          // Exact match, or a fragment id on the page (e.g. …/x/#breadcrumb).
          if (value === wpUrl) return ownUrl;
          if (value.startsWith(`${wpUrl}#`)) return `${ownUrl}${value.slice(wpUrl.length)}`;
        }
      }
      return toFrontendUrl(value);
    }
    if (Array.isArray(value)) return value.map(rewrite);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewrite(v)]));
    }
    return value;
  };

  const result = rewrite(schema);

  // Yoast advertises WordPress search (/?s=…), which the frontend doesn't have.
  if (Array.isArray(result?.["@graph"])) {
    for (const node of result["@graph"]) {
      if (!Array.isArray(node?.potentialAction)) continue;
      node.potentialAction = node.potentialAction.filter((a) => a?.["@type"] !== "SearchAction");
      if (node.potentialAction.length === 0) delete node.potentialAction;
    }
  }

  return withOrg(result);
}

/* ------------------------------------------------------------------ */
/* Organization                                                        */
/* ------------------------------------------------------------------ */

const ORGANIZATION_NAME = "Panea";

function firstMatch(html, regex) {
  const match = String(html || "").match(regex);
  return match ? match[1].trim() : undefined;
}

/**
 * Organization node built from the theme options (logo, phone, email, socials).
 * Yoast's "Site representation" is not filled in, so we add it ourselves.
 */
export function buildOrganizationSchema(themeOptions) {
  if (!SITE_URL) return null;
  const logo = themeOptions?.footer?.footer_logo;
  const contact = themeOptions?.footer?.footer_column_4 || {};
  const telephone = firstMatch(contact.mobile_no, /href=["']tel:([^"']+)["']/i);
  const email = firstMatch(contact.email_id, /href=["']mailto:([^"'?]+)/i);
  const sameAs = Object.values(themeOptions?.social || {}).filter(
    (url) => typeof url === "string" && /^https?:\/\//.test(url)
  );

  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORGANIZATION_NAME,
    url: `${SITE_URL}/`,
    foundingDate: "1978",
    ...(logo?.url
      ? {
          logo: {
            "@type": "ImageObject",
            "@id": `${SITE_URL}/#logo`,
            url: logo.url,
            contentUrl: logo.url,
            ...(logo.width ? { width: logo.width } : {}),
            ...(logo.height ? { height: logo.height } : {}),
            caption: ORGANIZATION_NAME,
          },
        }
      : {}),
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

// Add the Organization to a Yoast graph (unless Yoast already has one) and link it.
function addOrganization(schema, organization) {
  if (!organization || !Array.isArray(schema?.["@graph"])) return schema;
  const graph = schema["@graph"];
  const hasType = (node, type) => [].concat(node?.["@type"]).includes(type);
  if (graph.some((node) => hasType(node, "Organization"))) return schema;

  const ref = { "@id": organization["@id"] };
  for (const node of graph) {
    if (hasType(node, "WebSite") && !node.publisher) node.publisher = ref;
    if (hasType(node, "WebPage") && !node.about) node.about = ref;
  }
  graph.push(organization);
  return schema;
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

const FAQ_LAYOUT = /faq|frequently_asked/i;

// HTML → plain text, keeping paragraph/line breaks as spaces and decoding &nbsp;.
function toPlainText(html) {
  return stripHtml(String(html || "").replace(/<\/(p|li|h\d)>|<br\s*\/?>/gi, " $& "))
    .replace(/&nbsp;| /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Collect { question, answer } pairs anywhere inside a FAQ block, whatever the
// field names (q&a / faqs / faq_data / items, with or without a faq_data wrapper).
function collectQuestions(value, out, depth = 0) {
  if (!value || depth > 6) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectQuestions(item, out, depth + 1));
    return;
  }
  if (typeof value !== "object") return;
  if (typeof value.question === "string" && typeof value.answer === "string") {
    out.push({ question: value.question, answer: value.answer });
    return;
  }
  Object.values(value).forEach((child) => collectQuestions(child, out, depth + 1));
}

/**
 * All FAQ questions in an entry's ACF page builder(s). Finds every flexible-content
 * block whose layout name contains "faq", so new page types are picked up automatically.
 */
export function extractFaqItems(entry) {
  const blocks = [];
  const findBlocks = (value, depth = 0) => {
    if (!value || depth > 8) return;
    if (Array.isArray(value)) return value.forEach((v) => findBlocks(v, depth + 1));
    if (typeof value !== "object") return;
    if (typeof value.acf_fc_layout === "string" && FAQ_LAYOUT.test(value.acf_fc_layout)) {
      blocks.push(value);
      return;
    }
    Object.values(value).forEach((v) => findBlocks(v, depth + 1));
  };
  findBlocks(entry?.acf);

  const raw = [];
  blocks.forEach((block) => collectQuestions(block, raw));

  const seen = new Set();
  return raw
    .map(({ question, answer }) => ({
      question: toPlainText(question),
      answer: toPlainText(answer),
    }))
    .filter(({ question, answer }) => {
      if (!question || !answer) return false;
      const key = question.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * FAQPage JSON-LD generated automatically from the entry's FAQ blocks.
 * Returns null when the page has no FAQ (or Yoast already outputs one).
 */
export function buildFaqSchema(entry, { path = null, lang = DEFAULT_LANG } = {}) {
  const yoastGraph = entry?.yoast_head_json?.schema?.["@graph"];
  if (
    Array.isArray(yoastGraph) &&
    yoastGraph.some((node) => [].concat(node?.["@type"]).includes("FAQPage"))
  ) {
    return null;
  }

  const items = extractFaqItems(entry);
  if (!items.length) return null;

  const url = path ? absoluteUrl(path) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "@id": `${url}#faq`, url } : {}),
    inLanguage: LOCALE_MAP[lang]?.replace("_", "-") || lang,
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Product                                                             */
/* ------------------------------------------------------------------ */

function termNames(ids, terms) {
  if (!Array.isArray(ids) || !Array.isArray(terms)) return [];
  return ids
    .map((id) => terms.find((term) => Number(term?.id) === Number(id))?.name)
    .filter(Boolean)
    .map((name) => stripHtml(name));
}

/**
 * Product JSON-LD for a WooCommerce product. Products have no public price (quote
 * based), so no Offer is added — it describes the product for search/AI engines.
 */
export function buildProductSchema(product, { path = null, brands = [], categories = [] } = {}) {
  if (!product) return null;
  const yoast = product.yoast_head_json || {};
  const name = stripHtml(product?.title?.rendered) || yoast.og_title;
  if (!name) return null;

  const url = path ? absoluteUrl(path) : toFrontendUrl(product.link);
  const description = truncateDescription(
    yoast.description ||
      stripHtml(product?.acf?.short_information) ||
      stripHtml(product?.excerpt?.rendered) ||
      stripHtml(product?.content?.rendered),
    500
  );
  const images = [
    ...(Array.isArray(yoast.og_image) ? yoast.og_image.map((img) => img?.url) : []),
    product?._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
  ].filter((src, i, all) => src && all.indexOf(src) === i);
  const brandNames = termNames(product.product_brand, brands);
  const categoryNames = termNames(product.product_cat, categories);
  const sku = product?.acf?.article_number;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    ...(url ? { "@id": `${url}#product`, url } : {}),
    name,
    ...(description ? { description } : {}),
    ...(images.length ? { image: images } : {}),
    ...(brandNames[0] ? { brand: { "@type": "Brand", name: brandNames[0] } } : {}),
    ...(categoryNames.length ? { category: categoryNames.join(", ") } : {}),
    ...(sku && typeof sku === "string" ? { sku: stripHtml(sku) } : {}),
  };
}
