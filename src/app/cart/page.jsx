import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import GenericPageBuilder from "@/components/major/GenericPageBuilder";
import QuoteCartPage from "@/components/product/cart/QuoteCartPage";
import { getAllProducts, getMenu, getPageBySlug, getThemeOptions } from "@/lib/api";
import { DEFAULT_LANG } from "@/config";

export const metadata = {
  title: "Begär en offert | panea",
};

export default async function CartRoute() {
  const lang = DEFAULT_LANG;
  const [menu, themeOptions, cartPage, relatedProducts] = await Promise.all([
    getMenu(lang),
    getThemeOptions(lang),
    getPageBySlug("cart", lang),
    getAllProducts(lang),
  ]);
  const genericSections = Array.isArray(cartPage?.acf?.generic_page_builder)
    ? cartPage.acf.generic_page_builder
    : null;

  return (
    <>
      <Header
        lang={lang}
        currentSlug="cart"
        entryType="page"
        entryId={cartPage?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <QuoteCartPage
        lang={lang}
        page={cartPage}
        relatedProducts={relatedProducts}
      />
      {genericSections?.length ? (
        <GenericPageBuilder sections={genericSections} lang={lang} />
      ) : null}
      <Footer lang={lang} currentSlug="cart" />
    </>
  );
}
