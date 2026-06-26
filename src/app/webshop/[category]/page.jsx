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
import { DEFAULT_LANG } from "@/config";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getProductCategories(DEFAULT_LANG);

  return (Array.isArray(categories) ? categories : [])
    .filter((category) => !category.parent && category.slug)
    .map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const categories = await getProductCategories(DEFAULT_LANG);
  const category = categories.find((item) => item.slug === resolved.category);

  return {
    title: `${category?.name || "Webshop"} | panea`,
  };
}

export default async function WebshopCategoryRoute({ params }) {
  const resolved = await params;
  const lang = DEFAULT_LANG;
  const [menu, themeOptions, products, categories, brands] = await Promise.all([
    getMenu(lang),
    getThemeOptions(lang),
    getAllProducts(lang),
    getProductCategories(lang),
    getProductBrands(lang),
  ]);

  const categoryExists = categories.some(
    (category) => !category.parent && category.slug === resolved.category
  );

  if (!categoryExists) notFound();

  return (
    <>
      <Header
        lang={lang}
        currentSlug={`webshop/${resolved.category}`}
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
          initialCategory={resolved.category}
        />
      </main>
      <Footer lang={lang} currentSlug={`webshop/${resolved.category}`} />
    </>
  );
}
