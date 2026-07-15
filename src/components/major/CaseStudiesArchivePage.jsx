import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import PageBuilder from "@/components/major/PageBuilder";
import CaseHero from "@/components/sections/case-study/CaseHero";
import CaseStudyImageCtaBanner from "@/components/sections/case-study/ImageCtaBanner";
import CaseStudyArchiveCases from "@/components/sections/case-study/CaseStudyArchiveCases";
import { DEFAULT_LANG } from "@/config";
import {
  getCaseStudies,
  getCaseStudiesByType,
  getCaseStudyTypes,
  getMenu,
  getPageBySlug,
  getThemeOptions,
} from "@/lib/api";
import { notFound } from "next/navigation";

export const CASES_PAGE_SLUG = "cases";

export async function getCaseStudiesArchivePage(lang = DEFAULT_LANG) {
  return getPageBySlug(CASES_PAGE_SLUG, lang);
}

function findHeroBanner(value) {
  if (!value) return null;

  if (Array.isArray(value)) {
    const exactLayout = value.find(
      (item) => item?.acf_fc_layout === "hero_banner"
    );

    if (exactLayout) return exactLayout;

    for (const item of value) {
      const nestedHero = findHeroBanner(item);
      if (nestedHero) return nestedHero;
    }

    return null;
  }

  if (typeof value !== "object") return null;

  if (
    value.acf_fc_layout === "hero_banner" ||
    (value.background_image && value.cta_text)
  ) {
    return value;
  }

  const directHero = value.hero_banner;
  if (directHero && typeof directHero === "object") {
    return Array.isArray(directHero) ? directHero[0] || null : directHero;
  }

  for (const nestedValue of Object.values(value)) {
    const nestedHero = findHeroBanner(nestedValue);
    if (nestedHero) return nestedHero;
  }

  return null;
}

function findLayoutBlock(value, layoutName) {
  if (!value) return null;

  if (Array.isArray(value)) {
    const matchingBlock = value.find(
      (item) => item?.acf_fc_layout === layoutName
    );

    if (matchingBlock) return matchingBlock;

    for (const item of value) {
      const nestedBlock = findLayoutBlock(item, layoutName);
      if (nestedBlock) return nestedBlock;
    }

    return null;
  }

  if (typeof value !== "object") return null;
  if (value.acf_fc_layout === layoutName) return value;

  const directBlock = value[layoutName];
  if (directBlock && typeof directBlock === "object") {
    return Array.isArray(directBlock) ? directBlock[0] || null : directBlock;
  }

  for (const nestedValue of Object.values(value)) {
    const nestedBlock = findLayoutBlock(nestedValue, layoutName);
    if (nestedBlock) return nestedBlock;
  }

  return null;
}

export default async function CaseStudiesArchivePage({
  lang = DEFAULT_LANG,
}) {
  const [page, menu, themeOptions, caseStudies, caseStudyTypes] =
    await Promise.all([
    getCaseStudiesArchivePage(lang),
    getMenu(lang),
    getThemeOptions(lang),
    getCaseStudies(lang),
    getCaseStudyTypes(lang),
  ]);

  if (!page) notFound();

  const categoryCaseEntries = await Promise.all(
    (caseStudyTypes || []).map(async (category) => [
      String(category.id),
      await getCaseStudiesByType(category.id, lang),
    ])
  );
  const casesByType = Object.fromEntries(categoryCaseEntries);

  const sections =
    page?.acf?.case_study_builder ||
    page?.acf?.case_studies_page_builder ||
    page?.acf?.page_builder ||
    [];
  const heroData = findHeroBanner(page?.acf);
  const imageCtaData = findLayoutBlock(page?.acf, "image_cta_banner");
  const contentSections = sections.filter(
    (block) =>
      ![
        "hero_banner",
        "case_study_listing",
        "case_studies_section",
        "news_section",
        "image_cta_banner",
      ].includes(block?.acf_fc_layout)
  );

  return (
    <>
      <Header
        lang={lang}
        currentSlug={CASES_PAGE_SLUG}
        entryType="pages"
        entryId={page?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main id="case-studies-archive" className="overflow-x-clip">
        <CaseHero
          data={heroData}
          lang={lang}
          pageTitle={lang === "sv" ? "Fallstudier" : "Case studies"}
          scrollTargetId="case-archive-grid"
          showCurrentTitleInBreadcrumb={false}
          showBreadcrumb={false}
          showEyebrow={false}
        />
        <PageBuilder sections={contentSections} lang={lang} />
        <CaseStudyArchiveCases
          lang={lang}
          prefetchedCases={caseStudies}
          caseStudyTypes={caseStudyTypes}
          casesByType={casesByType}
        />
        <CaseStudyImageCtaBanner
          data={imageCtaData}
          lang={lang}
          containerWidthClass="web-width"
        />
      </main>
      <Footer lang={lang} currentSlug={CASES_PAGE_SLUG} />
    </>
  );
}
