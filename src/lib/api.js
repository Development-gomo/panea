import { DEFAULT_LANG } from "@/config";
import { WP_BASE } from "@/config";
import { cache } from "react";

// Process-level cache for WP responses. Needed on top of Next's fetch data
// cache because that cache silently refuses to store responses over 2MB
// (several of our list endpoints with `_embed` are well past that) — without
// this, every static page render re-fetches those multi-MB payloads from the
// WP backend, which is what causes build timeouts on large sites.
const memoryCache = new Map();

// Deduped fetch: React.cache ensures identical calls within the same
// server render are only executed once (works across page + generateMetadata).
const _fetchWP = cache(async function _fetchWP(url, revalidate) {
  const now = Date.now();
  const cached = memoryCache.get(url);
  const isFresh =
    cached && (revalidate === false || now - cached.time < revalidate * 1000);

  if (isFresh) {
    return cached.data;
  }

  // A single transient failure (timeout, bot-protection challenge page, etc.)
  // must not silently render an empty page section — retry a couple of times
  // before giving up.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(url, { next: { revalidate } });
      const data = await res.json();
      memoryCache.set(url, { data, time: now });
      return data;
    } catch {
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }

  // Serve stale data on persistent failure rather than nothing.
  return cached ? cached.data : null;
});

// Generic fetch helper with ISR revalidation (60s by default).
export function fetchWP(endpoint, { revalidate = 60 } = {}) {
  const url = `${WP_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  return _fetchWP(url, revalidate);
}

async function fetchAllWP(endpoint, { perPage = 20 } = {}) {
  const items = [];
  const separator = endpoint.includes("?") ? "&" : "?";

  for (let page = 1; page <= 100; page += 1) {
    const pageItems = await fetchWP(
      `${endpoint}${separator}per_page=${perPage}&page=${page}`
    );

    if (!Array.isArray(pageItems) || pageItems.length === 0) break;
    items.push(...pageItems);
    if (pageItems.length < perPage) break;
  }

  return items;
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
  if (!slug) return null;

  try {
    const entries = await fetchWP(
      `/wp/v2/pages?slug=${encodeURIComponent(slug)}&lang=${lang}&_embed&acf_format=standard`
    );

    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    return (
      entries.find((entry) => entry.lang === lang) ||
      entries.find((entry) => entry.slug === slug) ||
      entries[0]
    );
  } catch {
    return null;
  }
}

export async function getSolutionBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("solutions", slug, lang);
}

export async function getBusinessAreaBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("business_areas", slug, lang);
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

export async function getProductBySlug(slug, lang = DEFAULT_LANG) {
  if (!slug) return null;

  const getProductFromEndpoint = async (endpoint) => {
    const entries = await fetchWP(
      `/wp/v2/${endpoint}?slug=${encodeURIComponent(slug)}&lang=${lang}&_embed&acf_format=standard`
    );

    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    return (
      entries.find((entry) => entry.lang === lang) ||
      entries.find((entry) => entry.slug === slug) ||
      entries[0]
    );
  };

  const product = (
    (await getProductFromEndpoint("product")) ||
    (await getProductFromEndpoint("products"))
  );

  if (!product) return null;

  const storeProducts = await fetchWP(
    `/wc/store/v1/products?slug=${encodeURIComponent(slug)}`
  );
  const storeProduct = Array.isArray(storeProducts) ? storeProducts[0] : null;

  return storeProduct
    ? {
        ...product,
        woo: storeProduct,
      }
    : product;
}

export async function getAllTeam(lang = DEFAULT_LANG) {
  return await fetchWP(
    `/wp/v2/team?per_page=100&_embed&lang=${lang}`
  );
}

export async function getTeamMembersByIds(ids = [], lang = DEFAULT_LANG) {
  const cleanIds = [...new Set(ids.map((id) => Number(id)).filter(Boolean))];

  if (!cleanIds.length) return [];

  return await fetchWP(
    `/wp/v2/team?include=${cleanIds.join(",")}&per_page=${cleanIds.length}&orderby=include&_embed&lang=${lang}`
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

export async function getSolutionById(id, lang) {
  return await getEntryById("solutions", id, lang);
}

export async function getAllSolutions(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/solutions?lang=${lang}&per_page=100&_embed&acf_format=standard`);
}

export async function getAllBusinessAreas(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/business_areas?lang=${lang}&per_page=100&_embed`);
}

export async function getCaseStudies(lang = DEFAULT_LANG) {
  return await fetchAllWP(`/wp/v2/case_study?lang=${lang}&_embed`);
}

export async function getRecentCaseStudies(lang = DEFAULT_LANG) {
  return await fetchWP(
    `/wp/v2/case_study?lang=${lang}&per_page=8&orderby=date&order=desc&_embed`
  );
}

export async function getCaseStudySlugs(lang = DEFAULT_LANG) {
  return await fetchWP(
    `/wp/v2/case_study?lang=${lang}&per_page=100&_fields=slug`
  );
}

export async function getCaseStudyTypes(lang = DEFAULT_LANG) {
  return await fetchWP(
    `/wp/v2/case_study_type?lang=${lang}&per_page=100&hide_empty=true`
  );
}

export async function getCaseStudiesByType(typeId, lang = DEFAULT_LANG) {
  if (!typeId) return [];

  return await fetchAllWP(
    `/wp/v2/case_study?lang=${lang}&case_study_type=${typeId}&_embed`
  );
}

export async function getAllSuppliers(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/suppliers?lang=${lang}&per_page=100&_embed&acf_format=standard`);
}

export async function getAllCareers(lang = DEFAULT_LANG) {
  const careers = await fetchWP(
    `/wp/v2/career?lang=${lang}&per_page=100&_embed&acf_format=standard`
  );

  return Array.isArray(careers) ? careers : [];
}

export async function getTestimonialsByIds(ids = [], lang = DEFAULT_LANG) {
  const cleanIds = [...new Set(ids.map((id) => Number(id)).filter(Boolean))];

  if (!cleanIds.length) return [];

  return await fetchWP(
    `/wp/v2/testimonial?include=${cleanIds.join(",")}&per_page=${cleanIds.length}&orderby=include&lang=${lang}&_embed`
  );
}

export async function getAllPosts(lang) {
  return fetchWP(`/wp/v2/posts?lang=${lang}&per_page=3&orderby=date&order=desc&_embed`);
}

export async function getArticleArchivePosts(lang = DEFAULT_LANG) {
  const posts = [];

  for (let page = 1; page <= 100; page += 1) {
    const pagePosts = await fetchWP(
      `/wp/v2/posts?lang=${lang}&per_page=50&page=${page}&orderby=date&order=desc&_embed`
    );

    if (!Array.isArray(pagePosts) || pagePosts.length === 0) break;
    posts.push(...pagePosts);
    if (pagePosts.length < 50) break;
  }

  return posts;
}

export async function getPostCategories(lang = DEFAULT_LANG) {
  const categories = [];

  for (let page = 1; page <= 100; page += 1) {
    const pageCategories = await fetchWP(
      `/wp/v2/categories?lang=${lang}&per_page=100&page=${page}&hide_empty=true&orderby=name&order=asc`
    );

    if (!Array.isArray(pageCategories) || pageCategories.length === 0) break;
    categories.push(...pageCategories);
    if (pageCategories.length < 100) break;
  }

  return categories;
}

export async function getAllProducts(lang = DEFAULT_LANG) {
  const mergeStoreImages = async (products = []) => {
    const storeProducts = await fetchWP(`/wc/store/v1/products?per_page=100`);
    if (!Array.isArray(storeProducts) || storeProducts.length === 0) {
      return products;
    }

    const storeBySlug = new Map(
      storeProducts
        .filter((product) => product?.slug)
        .map((product) => [product.slug, product])
    );

    return products.map((product) => {
      const storeProduct = storeBySlug.get(product.slug);
      return storeProduct
        ? {
            ...product,
            woo: storeProduct,
          }
        : product;
    });
  };

  const products = await fetchAllWP(
    `/wp/v2/product?lang=${lang}&_embed&acf_format=standard`
  );
  if (products.length > 0) return mergeStoreImages(products);

  const fallbackProducts = await fetchAllWP(
    `/wp/v2/products?lang=${lang}&_embed&acf_format=standard`
  );
  return fallbackProducts.length > 0
    ? mergeStoreImages(fallbackProducts)
    : [];
}

export async function getProductSlugs(lang = DEFAULT_LANG) {
  return await fetchAllWP(
    `/wp/v2/product?lang=${lang}&_fields=slug`,
    { perPage: 100 }
  );
}

export async function getProductCategories(lang = DEFAULT_LANG, options = {}) {
  const { includeChildren = false } = options;
  const parentQuery = includeChildren ? "" : "&parent=0";
  const categories = await fetchWP(
    `/wp/v2/product_cat?lang=${lang}&per_page=100${parentQuery}&acf_format=standard`
  );
  if (Array.isArray(categories)) return categories;

  const storeCategories = await fetchWP(
    `/wc/store/v1/products/categories?per_page=100`
  );
  if (!Array.isArray(storeCategories)) return [];

  return includeChildren
    ? storeCategories
    : storeCategories.filter((category) => !category.parent);
}

async function hydrateProductCategoryAcf(acf = {}) {
  const hydrateLogoRows = async (rows) => {
    if (!Array.isArray(rows)) return rows;

    return Promise.all(
      rows.map(async (row) => {
        const logo = row?.logo;

        if (!Number.isInteger(Number(logo))) {
          return row;
        }

        const media = await getMediaById(Number(logo));
        if (!media) return row;

        return { ...row, logo: media };
      })
    );
  };

  const group = acf.product_category_information;

  return {
    ...acf,
    client_logos: await hydrateLogoRows(acf.client_logos),
    product_category_information:
      group && typeof group === "object"
        ? {
            ...group,
            client_logos: await hydrateLogoRows(group.client_logos),
          }
        : group,
  };
}

export async function getProductCategoryBySlug(slug, lang = DEFAULT_LANG) {
  if (!slug) return null;

  const categories = await fetchWP(
    `/wp/v2/product_cat?slug=${encodeURIComponent(slug)}&lang=${lang}&per_page=1&acf_format=standard`
  );
  const category = Array.isArray(categories) ? categories[0] : null;

  if (!category) return null;

  return {
    ...category,
    acf: await hydrateProductCategoryAcf(category.acf || {}),
  };
}

export async function getProductCategoryAcf(categoryId) {
  if (!categoryId) return {};

  const endpoints = [
    `/acf/v3/product_cat/${categoryId}`,
    `/acf/v3/product_cat/product_cat_${categoryId}`,
    `/acf/v3/terms/product_cat/${categoryId}`,
    `/acf/v3/terms/product_cat/product_cat_${categoryId}`,
    `/acf/v3/term/product_cat/${categoryId}`,
    `/acf/v3/term/product_cat_${categoryId}`,
  ];

  for (const endpoint of endpoints) {
    const data = await fetchWP(endpoint);
    const first = Array.isArray(data) ? data[0] : data;
    const acf = first?.acf || first;

    if (acf && typeof acf === "object" && !acf.code && Object.keys(acf).length > 0) {
      return hydrateProductCategoryAcf(acf);
    }
  }

  return {};
}

export async function getProductBrands(lang = DEFAULT_LANG) {
  const endpoints = [
    `/wp/v2/product_brand?lang=${lang}&per_page=100`,
    `/wp/v2/pwb-brand?lang=${lang}&per_page=100`,
    `/wp/v2/pa_brand?lang=${lang}&per_page=100`,
  ];

  for (const endpoint of endpoints) {
    const brands = await fetchWP(endpoint);
    if (Array.isArray(brands)) return brands;
  }

  return [];
}

function getProductCategoryIds(product) {
  const ids = new Set();

  [
    product?.product_cat,
    product?.product_categories,
    product?.categories,
  ].forEach((value) => {
    if (!Array.isArray(value)) return;
    value.forEach((id) => {
      if (Number.isInteger(Number(id))) ids.add(Number(id));
    });
  });

  const embeddedTerms = product?._embedded?.["wp:term"] || [];
  embeddedTerms.flat().forEach((term) => {
    if (term?.taxonomy === "product_cat" && term?.id) {
      ids.add(Number(term.id));
    }
  });

  return [...ids];
}

export async function getRelatedProducts(product, lang = DEFAULT_LANG, limit = 8) {
  if (!product?.id) return [];

  const categoryIds = getProductCategoryIds(product);
  const endpoints = ["product", "products"];

  for (const endpoint of endpoints) {
    const categoryQuery = categoryIds.length > 0
      ? `&product_cat=${categoryIds.join(",")}`
      : "";
    const related = await fetchWP(
      `/wp/v2/${endpoint}?lang=${lang}&per_page=${limit + 1}&exclude=${product.id}&_embed&acf_format=standard${categoryQuery}`
    );

    if (Array.isArray(related) && related.length > 0) {
      return related.slice(0, limit);
    }
  }

  const products = await getAllProducts(lang);
  if (!Array.isArray(products) || products.length === 0) return [];

  return products
    .filter((item) => item?.id !== product.id)
    .filter((item) => {
      if (categoryIds.length === 0) return true;
      const itemCategoryIds = getProductCategoryIds(item);
      return itemCategoryIds.some((id) => categoryIds.includes(id));
    })
    .slice(0, limit);
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
    solution: "solutions",
    solutions: "solutions",
    business_area: "business_areas",
    business_areas: "business_areas",
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
    if (Array.isArray(v)) {
      v.forEach((vv) => fd.append(k, vv instanceof Blob ? vv : String(vv)));
    } else {
      fd.append(k, v instanceof Blob ? v : String(v));
    }
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
