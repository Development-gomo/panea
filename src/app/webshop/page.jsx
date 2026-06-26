import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import WebshopPage from "@/components/product/webshop/WebshopPage";
import {
  getAllProducts,
  getMenu,
  getPageBySlug,
  getProductBrands,
  getProductCategories,
  getThemeOptions,
} from "@/lib/api";
import { DEFAULT_LANG } from "@/config";
import { buildMetadataFromYoast } from "@/lib/seo";

export const revalidate = 3600;

export default async function WebshopRoute() {
  const lang = DEFAULT_LANG;
  const [page, menu, themeOptions, products, categories, brands] = await Promise.all([
    getPageBySlug("webshop", lang),
    getMenu(lang),
    getThemeOptions(lang),
    getAllProducts(lang),
    getProductCategories(lang),
    getProductBrands(lang),
  ]);

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
        />
      </main>
      <Footer lang={lang} currentSlug="webshop" />
    </>
  );
}

export async function generateMetadata() {
  const page = await getPageBySlug("webshop", DEFAULT_LANG);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Webshop | panea",
    lang: DEFAULT_LANG,
  });
}
