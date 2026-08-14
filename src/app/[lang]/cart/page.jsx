import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import GenericPageBuilder from "@/components/major/GenericPageBuilder";
import QuoteCartPage from "@/components/product/cart/QuoteCartPage";
import { getAllProducts, getMenu, getPageBySlug, getThemeOptions } from "@/lib/api";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";
import { resolveParams } from "@/lib/params";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Request a quote | panea",
};

export function generateStaticParams() {
  return SUPPORTED_LANGS.filter((lang) => lang !== DEFAULT_LANG).map((lang) => ({
    lang,
  }));
}

export default async function LangCartRoute({ params }) {
  const resolved = resolveParams(await params);
  const lang = resolved?.lang || DEFAULT_LANG;

  // Default language is served by the root /cart page (see src/app/cart/page.jsx).
  // Without this guard, /sv/cart would duplicate /cart as a second live URL.
  if (!SUPPORTED_LANGS.includes(lang) || lang === DEFAULT_LANG) notFound();

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
