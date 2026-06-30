import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import ProductBreadcrumbs from "./ProductBreadcrumbs";
import ProductCategoryHero from "./ProductCategoryHero";
import ProductCategoryProductsSectionNoSsr from "./ProductCategoryProductsSectionNoSsr";
import WebshopHighlightBanner from "@/components/product/webshop/HighlightBanner";
import WebshopContactFormSection from "@/components/product/webshop/ContactFormSection";
import {
  getAllProducts,
  getMenu,
  getPageBySlug,
  getProductCategoryAcf,
  getProductCategoryBySlug,
  getProductBrands,
  getProductCategories,
  getTeamMembersByIds,
  getThemeOptions,
} from "@/lib/api";
import { DEFAULT_LANG } from "@/config";
import { notFound } from "next/navigation";

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

function getWebshopContactForm(page) {
  const builder = page?.acf?.webshop_page_builder;
  if (!Array.isArray(builder)) return null;

  return (
    builder.find((block) =>
      ["contact_form_section", "contact_form"].includes(block?.acf_fc_layout)
    ) || null
  );
}

function getWebshopHighlightBanner(page) {
  const builder = page?.acf?.webshop_page_builder;
  if (!Array.isArray(builder)) return null;

  return (
    builder.find((block) =>
      ["highlight_banner", "highlight"].includes(block?.acf_fc_layout)
    ) || null
  );
}

function getWebshopTeamData(page) {
  const builder = page?.acf?.webshop_page_builder;
  if (!Array.isArray(builder)) return null;

  return builder.find((block) => block?.acf_fc_layout === "team_member_section") || null;
}

export default async function ProductCategoryPage({
  categorySlug,
  lang = DEFAULT_LANG,
}) {
  if (!categorySlug) notFound();

  const [page, menu, themeOptions, products, categories, brands] = await Promise.all([
    getPageBySlug("webshop", lang),
    getMenu(lang),
    getThemeOptions(lang),
    getAllProducts(lang),
    getProductCategories(lang, { includeChildren: true }),
    getProductBrands(lang),
  ]);

  const activeCategory = categories.find((category) => category.slug === categorySlug);

  if (!activeCategory) notFound();

  const categoryDetails = await getProductCategoryBySlug(categorySlug, lang);
  const categoryAcf = await getProductCategoryAcf(
    categoryDetails?.id || activeCategory.id
  );
  const categoryWithAcf = {
    ...(categoryDetails || {}),
    ...activeCategory,
    acf: {
      ...(activeCategory?.acf || {}),
      ...(categoryDetails?.acf || {}),
      ...categoryAcf,
    },
  };

  const teamMemberIds = collectWebshopTeamMemberIds(page);
  const prefetchedTeamMembers = teamMemberIds.length
    ? await getTeamMembersByIds(teamMemberIds, lang)
    : [];
  const contactForm = getWebshopContactForm(page);
  const highlightBanner = getWebshopHighlightBanner(page);
  const teamData = getWebshopTeamData(page);
  const currentSlug = `product-category/${categorySlug}`;

  return (
    <>
      <Header
        lang={lang}
        currentSlug={currentSlug}
        entryType="page"
        entryId={page?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <ProductBreadcrumbs
        category={categoryWithAcf}
        webshopPage={page}
        lang={lang}
      />
      <main>
        <ProductCategoryHero category={categoryWithAcf} lang={lang} />
        <div className="border-t border-[#D5CDC1] bg-[#F2EBE2]" />
        <ProductCategoryProductsSectionNoSsr
          products={products}
          categories={categories}
          brands={brands}
          categorySlug={categorySlug}
          lang={lang}
        />
        <WebshopHighlightBanner data={highlightBanner} />
        <WebshopContactFormSection
          data={contactForm}
          teamData={teamData}
          lang={lang}
          prefetchedTeamMembers={prefetchedTeamMembers}
        />
      </main>
      <Footer lang={lang} currentSlug={currentSlug} />
    </>
  );
}
