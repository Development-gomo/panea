import ProductCategoryPage from "@/components/product/productcategory/ProductCategoryPage";
import { getProductCategories } from "@/lib/api";
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
  return <ProductCategoryPage categorySlug={categorySlug} lang={lang} />;
}
