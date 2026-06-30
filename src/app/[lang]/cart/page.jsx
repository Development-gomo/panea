import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import QuoteCartPage from "@/components/product/cart/QuoteCartPage";
import { getMenu, getThemeOptions } from "@/lib/api";
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

  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const [menu, themeOptions] = await Promise.all([
    getMenu(lang),
    getThemeOptions(lang),
  ]);

  return (
    <>
      <Header
        lang={lang}
        currentSlug="cart"
        entryType="page"
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <QuoteCartPage lang={lang} />
      <Footer lang={lang} currentSlug="cart" />
    </>
  );
}
