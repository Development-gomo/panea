// src/app/[lang]/[slug]/page.jsx

import {
  getPageBySlug,
  getBusinessAreaBySlug,
  getCaseStudyBySlug,
  getCaseStudies,
  getSolutionBySlug,
  getAllSolutions,
  fetchWP,
  getMenu,
  getThemeOptions,
  getAllBusinessAreas,
  getAllProducts,
  getProductBrands,
  getProductCategories,
  getTeamMembersByIds,
} from "@/lib/api";
import { resolveParams } from "@/lib/params";
import PageBuilder from "@/components/major/PageBuilder";
import BusinessAreaBuilder from "@/components/major/BusinessAreaBuilder";
import CaseStudyBuilder from "@/components/major/CasestudyBuilder";
import SolutionBuilder from "@/components/major/SolutionBuilder";
import GenericPageBuilder from "@/components/major/GenericPageBuilder";
import WebshopPage from "@/components/product/webshop/WebshopPage";
import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

export const revalidate = 3600;

export async function generateStaticParams() {
  const [pageResults, businessAreaResults, caseStudyResults, solutionResults] = await Promise.all([
    Promise.all(
      SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/pages?per_page=100&lang=${lang}`))
    ),
    Promise.all(SUPPORTED_LANGS.map((lang) => getAllBusinessAreas(lang))),
    Promise.all(SUPPORTED_LANGS.map((lang) => getCaseStudies(lang))),
    Promise.all(SUPPORTED_LANGS.map((lang) => getAllSolutions(lang))),
  ]);

  const params = SUPPORTED_LANGS.flatMap((lang, i) =>
    [
      ...(Array.isArray(pageResults[i]) ? pageResults[i] : []),
      ...(Array.isArray(businessAreaResults[i]) ? businessAreaResults[i] : []),
      ...(Array.isArray(caseStudyResults[i]) ? caseStudyResults[i] : []),
      ...(Array.isArray(solutionResults[i]) ? solutionResults[i] : []),
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
  const builderFields = [
    acf.business_area_page_builder,
    acf.business_areas_page_builder,
    acf.page_builder,
  ];

  return (
    builderFields.find((sections) => Array.isArray(sections) && sections.length > 0) ||
    builderFields.find((sections) => Array.isArray(sections)) ||
    null
  );
}

function normalizeSelectedPosts(selected) {
  if (!selected) return [];
  return Array.isArray(selected) ? selected : [selected];
}

function collectWebshopTeamMemberIds(page) {
  const builder = page?.acf?.webshop_page_builder;
  if (!Array.isArray(builder)) return [];

  return builder
    .filter(
      (block) =>
        ["contact_form_section", "contact_form"].includes(
          block?.acf_fc_layout
        ) || block?.acf_fc_layout === "team_member_section"
    )
    .flatMap((block) => normalizeSelectedPosts(block.select_team_members))
    .map((item) => (typeof item === "object" ? item?.ID || item?.id : item))
    .filter(Boolean);
}

export default async function SinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) notFound();

  const [data, businessArea, caseStudy, solution, menu, themeOptions, products, productCategories, productBrands] = await Promise.all([
    getPageBySlug(slug, lang),
    getBusinessAreaBySlug(slug, lang),
    getCaseStudyBySlug(slug, lang),
    getSolutionBySlug(slug, lang),
    getMenu(lang),
    getThemeOptions(lang),
    slug === "webshop" ? getAllProducts(lang) : null,
    slug === "webshop" ? getProductCategories(lang) : null,
    slug === "webshop" ? getProductBrands(lang) : null,
  ]);

  const entry = data || businessArea || caseStudy || solution;
  if (!entry) notFound();

  const isBusinessArea = !data && !!businessArea;
  const isCaseStudy = !data && !businessArea && !!caseStudy;
  const isSolution = !data && !businessArea && !caseStudy && !!solution;
  const acf = entry?.acf || {};
  const businessAreaSections = isBusinessArea ? getBusinessAreaSections(acf) : null;
  const genericSections = Array.isArray(acf.generic_page_builder)
    ? acf.generic_page_builder
    : acf.page_builder;
  const webshopTeamMemberIds =
    slug === "webshop" && data ? collectWebshopTeamMemberIds(data) : [];
  const prefetchedWebshopTeamMembers = webshopTeamMemberIds.length
    ? await getTeamMembersByIds(webshopTeamMemberIds, lang)
    : [];

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType={
          isCaseStudy
            ? "case_study"
            : isSolution
              ? "solutions"
              : isBusinessArea
                ? "business_areas"
                : "pages"
        }
        entryId={entry?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        {isCaseStudy ? (
          <CaseStudyBuilder
            sections={caseStudy?.acf?.case_study_builder}
            lang={lang}
            caseStudyTitle={caseStudy?.title?.rendered || caseStudy?.title || ""}
            currentSlug={slug}
          />
        ) : isSolution ? (
          <SolutionBuilder
            sections={solution?.acf?.solution_page_builder || null}
            lang={lang}
            solutionData={solution?.acf || {}}
          />
        ) : slug === "webshop" && data ? (
          <WebshopPage
            page={data}
            products={products || []}
            categories={productCategories || []}
            brands={productBrands || []}
            lang={lang}
            prefetchedTeamMembers={prefetchedWebshopTeamMembers}
          />
        ) : isBusinessArea ? (
          <BusinessAreaBuilder sections={businessAreaSections} lang={lang} businessAreaData={businessArea}/>
        ) : Array.isArray(acf.generic_page_builder) ? (
          <GenericPageBuilder sections={genericSections} lang={lang} />
        ) : (
          <PageBuilder sections={acf.page_builder} lang={lang} />
        )}
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
  const caseStudy = data || businessArea ? null : await getCaseStudyBySlug(slug, lang);
  const solution = data || businessArea || caseStudy
    ? null
    : await getSolutionBySlug(slug, lang);

  return buildMetadataFromYoast(data || businessArea || caseStudy || solution, {
    fallbackTitle: slug ? `${slug} | panea` : "panea",
    lang,
  });
}
