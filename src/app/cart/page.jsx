import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import QuoteCartPage from "@/components/product/cart/QuoteCartPage";
import { getMenu, getThemeOptions } from "@/lib/api";
import { DEFAULT_LANG } from "@/config";

export const metadata = {
  title: "Request a quote | panea",
};

export default async function CartRoute() {
  const lang = DEFAULT_LANG;
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
