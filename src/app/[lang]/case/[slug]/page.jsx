// src/app/[lang]/case/[slug]/page.jsx

import Header from "@/components/major/Header";
import CaseStudyBuilder from "@/components/major/CasestudyBuilder";
import Footer from "@/components/major/Footer";
import { resolveParams } from "@/lib/params";
import { getCaseStudyBySlug, getCaseStudies, getMenu, getThemeOptions } from "@/lib/api";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

export const revalidate = 3600;

export async function generateStaticParams() {
  const results = await Promise.all(
    SUPPORTED_LANGS.map((lang) => getCaseStudies(lang))
  );
  return SUPPORTED_LANGS.flatMap((lang, i) =>
    (Array.isArray(results[i]) ? results[i] : []).map((c) => ({ lang, slug: c.slug }))
  );
}

export default async function CaseStudySinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) notFound();

  const [caseStudy, menu, themeOptions] = await Promise.all([
    getCaseStudyBySlug(slug, lang),
    getMenu(lang),
    getThemeOptions(lang),
  ]);

  if (!caseStudy) notFound();

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType="case_study"
        pathPrefix="case"
        entryId={caseStudy?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        <CaseStudyBuilder sections={caseStudy?.acf?.case_study_builder} lang={lang} />
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

  if (!slug) {
    return {
      title: "Case Study | panea",
    };
  }

  const caseStudy = await getCaseStudyBySlug(slug, lang);
  return buildMetadataFromYoast(caseStudy, {
    fallbackTitle: `${slug} | panea`,
    lang,
  });
}
