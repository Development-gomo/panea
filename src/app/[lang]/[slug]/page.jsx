// src/app/[lang]/[slug]/page.jsx

import { getPageBySlug, getBusinessAreaBySlug, fetchWP, getMenu, getThemeOptions, getAllBusinessAreas } from "@/lib/api";
import { resolveParams } from "@/lib/params";
import PageBuilder from "@/components/major/PageBuilder";
import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

export const revalidate = 3600;

export async function generateStaticParams() {
  const [pageResults, businessAreaResults] = await Promise.all([
    Promise.all(
      SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/pages?per_page=100&lang=${lang}`))
    ),
    Promise.all(SUPPORTED_LANGS.map((lang) => getAllBusinessAreas(lang))),
  ]);

  const params = SUPPORTED_LANGS.flatMap((lang, i) =>
    [
      ...(Array.isArray(pageResults[i]) ? pageResults[i] : []),
      ...(Array.isArray(businessAreaResults[i]) ? businessAreaResults[i] : []),
    ].map((entry) => ({ lang, slug: entry.slug }))
  );

  const seen = new Set();
  return params.filter((param) => {
    const key = `${param.lang}/${param.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getBusinessAreaSections(acf = {}) {
  return (
    acf.business_areas_page_builder ||
    acf.business_area_page_builder ||
    acf.services_page_builder ||
    acf.page_builder ||
    null
  );
}

export default async function SinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) notFound();

  const [data, businessArea, menu, themeOptions] = await Promise.all([
    getPageBySlug(slug, lang),
    getBusinessAreaBySlug(slug, lang),
    getMenu(lang),
    getThemeOptions(lang),
  ]);

  const entry = data || businessArea;
  if (!entry) notFound();

  const isBusinessArea = !data && !!businessArea;
  const acf = entry?.acf || {};
  const businessAreaSections = isBusinessArea ? getBusinessAreaSections(acf) : null;

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType={isBusinessArea ? "business_areas" : "pages"}
        entryId={entry?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        <PageBuilder sections={isBusinessArea ? businessAreaSections : acf.page_builder} lang={lang} />
      </main>
      <Footer lang={lang} currentSlug={slug} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);
  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;
  const data = await getPageBySlug(slug, lang);
  const businessArea = data ? null : await getBusinessAreaBySlug(slug, lang);

  return buildMetadataFromYoast(data || businessArea, {
    fallbackTitle: slug ? `${slug} | panea` : "panea",
    lang,
  });
}
