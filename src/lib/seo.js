// src/lib/seo.js

import { DEFAULT_LANG, LOCALE_MAP } from "@/config";

function stripHtml(raw) {
  if (!raw) return "";
  return raw.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
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

export function buildMetadataFromYoast(entry, options = {}) {
  const {
    fallbackTitle = "panea",
    fallbackDescription = "Headless WordPress + Next.js + WPML",
    lang = DEFAULT_LANG,
  } = options;

  if (!entry) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }

  const yoast = entry.yoast_head_json;
  const renderedTitle = stripHtml(entry?.title?.rendered);
  const renderedExcerpt = stripHtml(entry?.excerpt?.rendered);

  const title = yoast?.title || renderedTitle || fallbackTitle;
  const description =
    yoast?.description ||
    yoast?.og_description ||
    renderedExcerpt ||
    fallbackDescription;

  const metadata = {
    title,
    description,
    alternates: yoast?.canonical
      ? {
          canonical: yoast.canonical.replace(/^https?:\/\/(www\.)?[^\/]+\/en(\/|$)/, "/"),
        }
      : undefined,
    openGraph: {
      title: yoast?.og_title || title,
      description: yoast?.og_description || description,
      url: yoast?.og_url,
      siteName: yoast?.og_site_name,
      type: yoast?.og_type || (entry?.type === "case_study" ? "article" : "website"),
      locale: yoast?.og_locale || LOCALE_MAP[lang] || LOCALE_MAP[DEFAULT_LANG],
      images: mapOgImages(yoast?.og_image),
    },
    twitter: {
      card: yoast?.twitter_card || "summary_large_image",
      title: yoast?.twitter_title || yoast?.og_title || title,
      description:
        yoast?.twitter_description || yoast?.og_description || description,
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
    }
  }

  return metadata;
}

