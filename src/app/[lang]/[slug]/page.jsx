// src/app/[lang]/[slug]/page.jsx

import {
  getPageBySlug,
  getBusinessAreaBySlug,
  getCaseStudyBySlug,
  getPostBySlug,
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
  getProductBySlug,
  getRelatedProducts,
  getTestimonialsByIds,
} from "@/lib/api";
import { resolveParams } from "@/lib/params";
import PageBuilder from "@/components/major/PageBuilder";
import BusinessAreaBuilder from "@/components/major/BusinessAreaBuilder";
import CaseStudyBuilder from "@/components/major/CasestudyBuilder";
import SolutionBuilder from "@/components/major/SolutionBuilder";
import GenericPageBuilder from "@/components/major/GenericPageBuilder";
import WebshopPage from "@/components/product/webshop/WebshopPage";
import { ProductPage } from "@/components/product";
import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

export const revalidate = 3600;

export async function generateStaticParams() {
  const [pageResults, businessAreaResults, caseStudyResults, solutionResults, postResults] = await Promise.all([
    Promise.all(
      SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/pages?per_page=100&lang=${lang}`))
    ),
    Promise.all(SUPPORTED_LANGS.map((lang) => getAllBusinessAreas(lang))),
    Promise.all(SUPPORTED_LANGS.map((lang) => getCaseStudies(lang))),
    Promise.all(SUPPORTED_LANGS.map((lang) => getAllSolutions(lang))),
    Promise.all(
      SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/posts?per_page=100&lang=${lang}`))
    ),
  ]);

  const params = SUPPORTED_LANGS.flatMap((lang, i) =>
    [
      ...(Array.isArray(pageResults[i]) ? pageResults[i] : []),
      ...(Array.isArray(businessAreaResults[i]) ? businessAreaResults[i] : []),
      ...(Array.isArray(caseStudyResults[i]) ? caseStudyResults[i] : []),
      ...(Array.isArray(solutionResults[i]) ? solutionResults[i] : []),
      ...(Array.isArray(postResults[i]) ? postResults[i] : []),
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

function InsightPostBody({ post }) {
  const sections = post?.acf?.insight_page_builder;
  const contentHtml = post?.content?.rendered;

  if (Array.isArray(sections) && sections.length > 0) {
    return sections.map((block, index) => {
      if (block?.acf_fc_layout !== "text_editor" || !block?.body_content) {
        return null;
      }

      return (
        <div
          key={index}
          className="max-w-none [&>p]:mb-6"
          dangerouslySetInnerHTML={{ __html: block.body_content }}
        />
      );
    });
  }

  if (contentHtml) {
    return (
      <div
        className="max-w-none [&>p]:mb-6"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

  return (
    <p className="text-center text-gray-500">Content will be available soon.</p>
  );
}

function InsightPostPage({ post }) {
  return (
    <article className="web-width mx-auto px-6 py-15 md:py-30">
      {post?.title?.rendered && (
        <h1
          className="mb-10 text-center text-4xl font-semibold"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
      )}

      <div className="mx-auto max-w-3xl">
        <InsightPostBody post={post} />
      </div>
    </article>
  );
}

function getProductAcf(product) {
  return {
    ...(product?.acf || {}),
    ...(product?.acf_fields || {}),
    ...(product?.advanced_custom_fields || {}),
    ...(product?.meta?.acf || {}),
  };
}

function collectProductRelationIds(product, layouts, field) {
  const builder = getProductAcf(product).product_page_builder;
  if (!Array.isArray(builder)) return [];

  return builder
    .filter((block) => layouts.includes(block?.acf_fc_layout))
    .flatMap((block) => normalizeSelectedPosts(block[field]))
    .map((item) => (typeof item === "object" ? item?.ID || item?.id : item))
    .filter(Boolean);
}

export default async function SinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;
  const isWebshopSlug =
    slug === "webshop" || (lang === "sv" && slug === "webbshop");

  if (!slug) notFound();

  // Product pages now live at /:slug, so resolve them first. This avoids
  // sending a burst of unrelated content-type requests to WordPress for every
  // product request, which can be rate-limited in production.
  const product = isWebshopSlug ? null : await getProductBySlug(slug, lang);
  const [data, businessArea, caseStudy, solution, post, menu, themeOptions, products, productCategories, productBrands] = await Promise.all([
    product ? null : getPageBySlug(slug, lang),
    product ? null : getBusinessAreaBySlug(slug, lang),
    product ? null : getCaseStudyBySlug(slug, lang),
    product ? null : getSolutionBySlug(slug, lang),
    product ? null : getPostBySlug(slug, lang),
    getMenu(lang),
    getThemeOptions(lang),
    isWebshopSlug ? getAllProducts(lang) : null,
    isWebshopSlug ? getProductCategories(lang) : null,
    isWebshopSlug ? getProductBrands(lang) : null,
  ]);

  const entry = data || businessArea || caseStudy || solution || product || post;
  if (!entry) notFound();

  const isBusinessArea = !data && !!businessArea;
  const isCaseStudy = !data && !businessArea && !!caseStudy;
  const isSolution = !data && !businessArea && !caseStudy && !!solution;
  const isProduct =
    !data && !businessArea && !caseStudy && !solution && !!product;
  const isPost =
    !data && !businessArea && !caseStudy && !solution && !product && !!post;
  const acf = entry?.acf || {};
  const businessAreaSections = isBusinessArea ? getBusinessAreaSections(acf) : null;
  const genericSections = Array.isArray(acf.generic_page_builder)
    ? acf.generic_page_builder
    : acf.page_builder;
  const webshopTeamMemberIds =
    isWebshopSlug && data ? collectWebshopTeamMemberIds(data) : [];
  const prefetchedWebshopTeamMembers = webshopTeamMemberIds.length
    ? await getTeamMembersByIds(webshopTeamMemberIds, lang)
    : [];
  const productTestimonialIds = isProduct
    ? collectProductRelationIds(
        product,
        ["testimonial", "testimonials", "testimonial_slider"],
        "clients_testimonial"
      )
    : [];
  const productTeamMemberIds = isProduct
    ? collectProductRelationIds(
        product,
        ["contact_form_section", "contact_form", "team_member_section"],
        "select_team_members"
      )
    : [];
  const [relatedProducts, prefetchedTestimonials, prefetchedProductTeamMembers] =
    isProduct
      ? await Promise.all([
          getRelatedProducts(product, lang),
          productTestimonialIds.length
            ? getTestimonialsByIds(productTestimonialIds, lang)
            : [],
          productTeamMemberIds.length
            ? getTeamMembersByIds(productTeamMemberIds, lang)
            : [],
        ])
      : [[], [], []];

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType={
          isProduct
            ? "product"
            : isCaseStudy
            ? "case_study"
            : isSolution
              ? "solutions"
              : isPost
                ? "posts"
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
        {isProduct ? (
          <ProductPage
            product={product}
            lang={lang}
            relatedProducts={relatedProducts}
            prefetchedTestimonials={prefetchedTestimonials}
            prefetchedTeamMembers={prefetchedProductTeamMembers}
          />
        ) : isCaseStudy ? (
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
        ) : isPost ? (  
          <InsightPostPage post={post} lang={lang} />
        ) : isWebshopSlug && data ? (
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
  const product = data || businessArea || caseStudy || solution
    ? null
    : await getProductBySlug(slug, lang);
  const post = data || businessArea || caseStudy || solution || product
    ? null
    : await getPostBySlug(slug, lang);

  return buildMetadataFromYoast(data || businessArea || caseStudy || solution || product || post, {
    fallbackTitle: slug ? `${slug} | panea` : "panea",
    lang,
  });
}
