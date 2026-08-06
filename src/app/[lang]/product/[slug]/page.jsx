import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { ProductPage } from "@/components/product";
import { resolveParams } from "@/lib/params";
import {
  getProductBySlug,
  getProductSlugs,
  getMenu,
  getRelatedProducts,
  getTeamMembersByIds,
  getTestimonialsByIds,
  getThemeOptions,
} from "@/lib/api";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

export const revalidate = 3600;

function getProductAcf(product) {
  return {
    ...(product?.acf || {}),
    ...(product?.acf_fields || {}),
    ...(product?.advanced_custom_fields || {}),
    ...(product?.meta?.acf || {}),
  };
}

function normalizeSelectedPosts(selected) {
  if (!selected) return [];
  return Array.isArray(selected) ? selected : [selected];
}

function collectProductTestimonialIds(product) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return [];

  return acf.product_page_builder
    .filter((block) =>
      ["testimonial", "testimonials", "testimonial_slider"].includes(
        block?.acf_fc_layout
      )
    )
    .flatMap((block) => normalizeSelectedPosts(block.clients_testimonial))
    .map((item) => (typeof item === "object" ? item?.ID || item?.id : item))
    .filter(Boolean);
}

function collectProductTeamMemberIds(product) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return [];

  return acf.product_page_builder
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

export async function generateStaticParams() {
  const results = await Promise.all(
    SUPPORTED_LANGS.map((lang) => getProductSlugs(lang))
  );

  return SUPPORTED_LANGS.flatMap((lang, i) =>
    (Array.isArray(results[i]) ? results[i] : []).map((product) => ({
      lang,
      slug: product.slug,
    }))
  );
}

export default async function ProductSinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) notFound();

  const [product, menu, themeOptions] = await Promise.all([
    getProductBySlug(slug, lang),
    getMenu(lang),
    getThemeOptions(lang),
  ]);

  if (!product) notFound();

  const testimonialIds = collectProductTestimonialIds(product);
  const teamMemberIds = collectProductTeamMemberIds(product);
  const [
    relatedProducts,
    prefetchedTestimonials,
    prefetchedTeamMembers,
  ] = await Promise.all([
    getRelatedProducts(product, lang),
    testimonialIds.length ? getTestimonialsByIds(testimonialIds, lang) : [],
    teamMemberIds.length ? getTeamMembersByIds(teamMemberIds, lang) : [],
  ]);

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType="product"
        pathPrefix="product"
        entryId={product?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        <ProductPage
          product={product}
          lang={lang}
          relatedProducts={relatedProducts}
          prefetchedTestimonials={prefetchedTestimonials}
          prefetchedTeamMembers={prefetchedTeamMembers}
        />
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
      title: "Product | panea",
    };
  }

  const product = await getProductBySlug(slug, lang);

  return buildMetadataFromYoast(product, {
    fallbackTitle: `${slug} | panea`,
    lang,
  });
}
