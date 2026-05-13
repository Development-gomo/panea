import { DEFAULT_LANG } from "@/config";
import { WP_BASE } from "@/config";
import { cache } from "react";

// Deduped fetch: React.cache ensures identical calls within the same
// server render are only executed once (works across page + generateMetadata).
const _fetchWP = cache(async function _fetchWP(url, revalidate) {
  try {
    const res = await fetch(url, { next: { revalidate } });
    return await res.json();
  } catch {
    return null;
  }
});

// Generic fetch helper with ISR revalidation (60s by default).
export function fetchWP(endpoint, { revalidate = 60 } = {}) {
  const url = `${WP_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  return _fetchWP(url, revalidate);
}

// Pages
async function getSingleEntry(endpoint, slug, lang = DEFAULT_LANG) {
  if (!slug) return null;

  try {
    const url = `/wp/v2/${endpoint}?slug=${encodeURIComponent(slug)}&lang=${lang}`;
    const entries = await fetchWP(url);

    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    return (
      entries.find((entry) => entry.lang === lang) ||
      entries.find((entry) => entry.slug === slug) ||
      entries[0]
    );
  } catch (err) {
    return null;
  }
}

export async function getPageBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("pages", slug, lang);
}

export async function getServiceBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("services", slug, lang);
}

export async function getCaseStudyBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("case_study", slug, lang);
}

export async function getPostBySlug(slug, lang = DEFAULT_LANG) {
  const post = await getSingleEntry("posts", slug, lang);

  if (post) {
    // Fetch related posts based on categories or tags
    const relatedPosts = await fetchWP(
      `/wp/v2/posts?categories=${post.categories?.join(",")}&exclude=${post.id}&per_page=5&lang=${lang}`
    );
    post.relatedPosts = relatedPosts || [];
  }

  return post;
}

export async function getAllTeam(lang = DEFAULT_LANG) {
  return await fetchWP(
    `/wp/v2/team?per_page=100&_embed&lang=${lang}`
  );
}

export async function getMediaById(id) {
  if (!id) return null;
  try {
    return await fetchWP(`/wp/v2/media/${id}`);
  } catch (err) {
    return null;
  }
}

// Menus — cache for 1 hour (menus rarely change)
export async function getMenu(lang = DEFAULT_LANG) {
  const menu = await fetchWP(`/myroutes/v1/menus?lang=${lang}`, { revalidate: 3600 });
  return menu;
}

// Footer widgets — cache for 1 hour
export async function getFooterWidgets(lang = DEFAULT_LANG) {
  const footer = await fetchWP(`/myroutes/v1/footer-widgets?lang=${lang}`, { revalidate: 3600 });
  return footer;
}

// Theme options (logo, colours, socials) — cache for 24 hours
export async function getThemeOptions(lang = DEFAULT_LANG) {
  try {
    const options = await fetchWP(`/panea/v1/theme-options?lang=${lang}`, { revalidate: 86400 });
    if (!options) {
      return { header: {}, footer: {} };
    }
    return options;
  } catch {
    return { header: {}, footer: {} };
  }
}

async function getEntryById(endpoint, id, lang = DEFAULT_LANG) {
  if (!id) return null;
  try {
    return await fetchWP(`/wp/v2/${endpoint}/${id}?lang=${lang}`);
  } catch {
    return null;
  }
}

// Get translated slug for other languages
export async function getTranslations(pageId) {
  const data = await fetchWP(`/wp/v2/pages/${pageId}`);
  return data?.translations || null;
}

// Get a page by ID (for finding translated slugs)
export async function getPageById(id, lang) {
  return await getEntryById("pages", id, lang);
}

export async function getServiceById(id, lang) {
  return await getEntryById("services", id, lang);
}

export async function getAllServices(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/services?lang=${lang}&per_page=100&_embed`);
}

export async function getCaseStudies(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/case_study?lang=${lang}&per_page=100&_embed`);
}

export async function getAllPosts(lang) {
  return fetchWP(`/wp/v2/posts?lang=${lang}&per_page=10&_embed`);
}

export async function getCaseStudyById(id, lang) {
  return await getEntryById("case_study", id, lang);
}

// Get translations for any entry type - try custom endpoint first, then fallback
export async function getEntryTranslations(entryId, entryType = "pages", lang = DEFAULT_LANG) {
  // Try custom endpoint first (works for all post types if WordPress endpoint supports it)
  const customTranslations = await fetchWP(`/myroutes/v1/translations/${entryId}?lang=${lang}`);
  if (customTranslations && Object.keys(customTranslations).length > 0) {
    return customTranslations;
  }

  // Fallback: get the entry and extract translations
  const entry = await fetchWP(`/wp/v2/${entryType}/${entryId}`);
  return entry?.translations || entry?.wpml_translations || entry?.icl_translations || null;
}

// Get translations for a page - try custom endpoint first, then fallback
export async function getPageTranslations(pageId, lang) {
  return getEntryTranslations(pageId, "pages", lang);
}

// Get translation by slug - with fallback for custom post types
export async function getTranslationBySlug(slug, currentLang, targetLang, postType = "page") {
  // Map postType to WordPress REST endpoint names
  const endpointMap = {
    page: "pages",
    service: "services",
    case_study: "case_study",
    posts: "posts",
    post: "posts",
  };
  const endpoint = endpointMap[postType] || postType;

  // First try the custom endpoint (works for pages)
  const translation = await fetchWP(`/myroutes/v1/translation-by-slug?slug=${encodeURIComponent(slug)}&lang=${currentLang}&target_lang=${targetLang}&post_type=${postType}`);

  // If custom endpoint returned valid data, use it
  if (translation?.slug && !translation?.code) {
    return translation;
  }

  // Fallback: Fetch the current entry by slug and extract WPML translation data
  try {
    // Get the current entry to find its ID and translation data
    const entries = await fetchWP(`/wp/v2/${endpoint}?slug=${encodeURIComponent(slug)}&lang=${currentLang}`);

    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    const currentEntry = entries[0];
    const entryId = currentEntry.id;

    // Check for WPML translation data in various formats
    const translations = currentEntry?.translations ||
      currentEntry?.wpml_translations ||
      currentEntry?.icl_translations;

    if (translations && translations[targetLang]) {
      const translatedId = typeof translations[targetLang] === 'number'
        ? translations[targetLang]
        : translations[targetLang]?.id || translations[targetLang]?.element_id;

      if (translatedId) {
        // Fetch the translated entry to get its slug
        const translatedEntry = await fetchWP(`/wp/v2/${endpoint}/${translatedId}?lang=${targetLang}`);
        if (translatedEntry?.slug) {
          return { slug: translatedEntry.slug };
        }
      }
    }

    // Alternative: Query all entries in target language and find by translation group
    const allTargetEntries = await fetchWP(`/wp/v2/${endpoint}?lang=${targetLang}&per_page=100`);

    if (Array.isArray(allTargetEntries)) {
      for (const altEntry of allTargetEntries) {
        const altTranslations = altEntry?.translations ||
          altEntry?.wpml_translations ||
          altEntry?.icl_translations;

        if (altTranslations && altTranslations[currentLang]) {
          const currentId = typeof altTranslations[currentLang] === 'number'
            ? altTranslations[currentLang]
            : altTranslations[currentLang]?.id || altTranslations[currentLang]?.element_id;

          if (currentId === entryId) {
            return { slug: altEntry.slug };
          }
        }
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}

// Get all entries of a type in a language (for finding translations)
export async function getAllEntriesByType(endpoint, lang = DEFAULT_LANG) {
  try {
    const entries = await fetchWP(`/wp/v2/${endpoint}?lang=${lang}&per_page=100`);
    return Array.isArray(entries) ? entries : [];
  } catch (err) {
    return [];
  }
}

// Find translation by checking all entries in alternate language
export async function findTranslationByEntry(entryId, entryType, currentLang, targetLang) {
  try {
    // First, try to get the entry's translation metadata
    const entry = await fetchWP(`/wp/v2/${entryType}/${entryId}`);

    // Check for translation relationships
    const translations = entry?.translations ||
      entry?.wpml_translations ||
      entry?.icl_translations;

    if (translations && translations[targetLang]) {
      const translatedId = typeof translations[targetLang] === 'number'
        ? translations[targetLang]
        : translations[targetLang]?.id || translations[targetLang]?.element_id;

      if (translatedId) {
        const translatedEntry = await getEntryById(entryType, translatedId, targetLang);
        if (translatedEntry) {
          return translatedEntry;
        }
      }
    }

    // Fallback: query all entries in target language
    const allEntries = await getAllEntriesByType(entryType, targetLang);

    for (const altEntry of allEntries) {
      const altTranslations = altEntry?.translations ||
        altEntry?.wpml_translations ||
        altEntry?.icl_translations;

      if (altTranslations && altTranslations[currentLang]) {
        const currentId = typeof altTranslations[currentLang] === 'number'
          ? altTranslations[currentLang]
          : altTranslations[currentLang]?.id || altTranslations[currentLang]?.element_id;

        if (currentId === entryId) {
          return altEntry;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Alternative: Get page by slug in alternate language (if WPML uses same slug structure)
export async function getPageBySlugInLang(slug, lang) {
  const page = await getPageBySlug(slug, lang);
  return page;
}

// Team type

export function extractTeamTypes(member) {
  const types = [];

  // Preferred: embedded taxonomy
  const embedded = member?._embedded?.["wp:term"] || [];
  embedded.flat().forEach((term) => {
    if (term.taxonomy === "teamtype") {
      types.push({
        id: term.id,
        slug: term.slug,
        name: term.name,
      });
    }
  });

  // Fallback: class_list
  if (types.length === 0 && Array.isArray(member?.class_list)) {
    member.class_list.forEach((cls) => {
      if (cls.startsWith("teamtype-")) {
        const slug = cls.replace("teamtype-", "");
        types.push({
          slug,
          name: slug.replace(/-/g, " "),
        });
      }
    });
  }

  return types;
}

export function buildTeamFilters(team = []) {
  const map = {};

  team.forEach((member) => {
    extractTeamTypes(member).forEach((type) => {
      map[type.slug] = type;
    });
  });

  return [
    { slug: "all", name: "All" },
    ...Object.values(map),
  ];
}

export function filterTeamByType(team = [], activeType = "all") {
  if (activeType === "all") return team;

  return team.filter((member) =>
    extractTeamTypes(member).some(
      (type) => type.slug === activeType
    )
  );
}
export function getTeamImage(member) {
  return (
    member?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    null
  );
}


// ✅ schema endpoint you already exposed
export async function getCf7FormSchema(formId, lang = DEFAULT_LANG) {
  return await fetchWP(`/panea/v1/cf7-form/${formId}?lang=${lang}`);
}

// ✅ recommended: submit via your proxy endpoint (stable)
export async function submitCf7FormProxy(formId, payload) {
  const res = await fetch(`${WP_BASE}/panea/v1/cf7-submit/${formId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw json;
  return json;
}

export async function submitCf7Direct(formId, schemaHidden, values) {
  const fd = new FormData();
  Object.entries({ ...(schemaHidden || {}), ...(values || {}) }).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((vv) => fd.append(k, String(vv)));
    else fd.append(k, String(v));
  });

  const res = await fetch(`${WP_BASE}/contact-form-7/v1/contact-forms/${formId}/feedback`, {
    method: "POST",
    body: fd,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw {
      ...json,
      message: json?.message || "CF7 direct submit failed",
      cf7: json,
    };
  }

  if (json?.status && json.status !== "mail_sent") {
    throw {
      ...json,
      message: json?.message || "CF7 validation failed",
      cf7: json,
    };
  }

  return json;
}
