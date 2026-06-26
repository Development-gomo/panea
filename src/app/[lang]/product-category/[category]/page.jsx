import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import WebshopPage from "@/components/product/webshop/WebshopPage";
import {
  getAllProducts,
  getMenu,
  getProductBrands,
  getProductCategories,
  getThemeOptions,
} from "@/lib/api";
import { resolveParams } from "@/lib/params";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateStaticParams() {
  const results = await Promise.all(
    SUPPORTED_LANGS.map((lang) => getProductCategories(lang))
  );

  return SUPPORTED_LANGS.flatMap((lang, index) =>
    (Array.isArray(results[index]) ? results[index] : [])
      .filter((category) => !category.parent && category.slug)
      .map((category) => ({ lang, category: category.slug }))
  );
}

export async function generateMetadata({ params }) {
  const resolved = resolveParams(await params);
  const lang = resolved?.lang || DEFAULT_LANG;
  const categories = await getProductCategories(lang);
  const category = categories.find((item) => item.slug === resolved.category);

  return {
    title: `${category?.name || "Product category"} | panea`,
  };
}

export default async function LangProductCategoryRoute({ params }) {
  const resolved = resolveParams(await params);
  const lang = resolved?.lang || DEFAULT_LANG;
  const categorySlug = resolved?.category;

  if (!categorySlug) notFound();

  const [menu, themeOptions, products, categories, brands] = await Promise.all([
    getMenu(lang),
    getThemeOptions(lang),
    getAllProducts(lang),
    getProductCategories(lang),
    getProductBrands(lang),
  ]);

  const categoryExists = categories.some(
    (category) => !category.parent && category.slug === categorySlug
  );

  if (!categoryExists) notFound();

  return (
    <>
      <Header
        lang={lang}
        currentSlug={`product-category/${categorySlug}`}
        entryType="page"
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        <WebshopPage
          products={products}
          categories={categories}
          brands={brands}
          lang={lang}
          initialCategory={categorySlug}
        />
      </main>
      <Footer lang={lang} currentSlug={`product-category/${categorySlug}`} />
    </>
  );
}
