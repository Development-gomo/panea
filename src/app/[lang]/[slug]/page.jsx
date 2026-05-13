// src/app/[lang]/[slug]/page.jsx

import { getPageBySlug, fetchWP, getMenu, getThemeOptions } from "@/lib/api";
import { resolveParams } from "@/lib/params";
import PageBuilder from "@/components/major/PageBuilder";
import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

export const revalidate = 3600;

export async function generateStaticParams() {
  const results = await Promise.all(
    SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/pages?per_page=100&lang=${lang}`))
  );
  return SUPPORTED_LANGS.flatMap((lang, i) =>
    (Array.isArray(results[i]) ? results[i] : []).map((p) => ({ lang, slug: p.slug }))
  );
}

export default async function SinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) notFound();

  const [data, menu, themeOptions] = await Promise.all([
    getPageBySlug(slug, lang),
    getMenu(lang),
    getThemeOptions(lang),
  ]);

  if (!data) notFound();
  const acf = data?.acf || {};

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType="pages"
        entryId={data?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        <PageBuilder sections={acf.page_builder} lang={lang} />
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
  return buildMetadataFromYoast(data, {
    fallbackTitle: slug ? `${slug} | panea` : "panea",
    lang,
  });
}