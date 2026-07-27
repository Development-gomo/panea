import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import WebshopPage from "@/components/product/webshop/WebshopPage";
import {
  getAllProducts,
  getMenu,
  getPageBySlug,
  getProductBrands,
  getProductCategories,
  getTeamMembersByIds,
  getThemeOptions,
} from "@/lib/api";
import { DEFAULT_LANG } from "@/config";
import { buildMetadataFromYoast } from "@/lib/seo";

export const revalidate = 3600;

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

async function getWebshopPage(lang) {
  const localizedSlug = lang === "sv" ? "webbshop" : "webshop";
  return getPageBySlug(localizedSlug, lang);
}

export default async function WebshopRoute() {
  const lang = DEFAULT_LANG;
  const [page, menu, themeOptions, products, categories, brands] = await Promise.all([
    getWebshopPage(lang),
    getMenu(lang),
    getThemeOptions(lang),
    getAllProducts(lang),
    getProductCategories(lang),
    getProductBrands(lang),
  ]);
  const teamMemberIds = collectWebshopTeamMemberIds(page);
  const prefetchedTeamMembers = teamMemberIds.length
    ? await getTeamMembersByIds(teamMemberIds, lang)
    : [];

  return (
    <>
      <Header
        lang={lang}
        currentSlug="webshop"
        entryType="pages"
        entryId={page?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        <WebshopPage
          page={page}
          products={products}
          categories={categories}
          brands={brands}
          lang={lang}
          prefetchedTeamMembers={prefetchedTeamMembers}
        />
      </main>
      <Footer lang={lang} currentSlug="webshop" />
    </>
  );
}

export async function generateMetadata() {
  const page = await getWebshopPage(DEFAULT_LANG);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Webshop | panea",
    lang: DEFAULT_LANG,
  });
}
