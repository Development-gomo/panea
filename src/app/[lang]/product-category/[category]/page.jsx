import ProductCategoryPage from "@/components/product/productcategory/ProductCategoryPage";
import { getAllProducts, getProductCategories } from "@/lib/api";
import {
  buildMetadataFromYoast,
  buildSchemaFromYoast,
  categoryProductCount,
  categoryShareImage,
} from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { resolveParams } from "@/lib/params";
import { DEFAULT_LANG, SUPPORTED_LANGS, langHref } from "@/config";
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

  // Product categories carry Yoast data on the term; map it to the shape the helper expects.
  const entry = category
    ? {
        ...category,
        title: { rendered: category.name },
        excerpt: { rendered: category.description || "" },
      }
    : null;

  const allCategories = await getProductCategories(lang, { includeChildren: true });
  const metadata = buildMetadataFromYoast(entry, {
    fallbackTitle: `${category?.name || "Product category"} | Panea`,
    lang: lang,
    path: category ? langHref(`/product-category/${category.slug}`, lang) : null,
    isArchiveTerm: true,
    fallbackImage: category
      ? categoryShareImage(
          category,
          await getAllProducts(lang),
          allCategories
        )
      : null,
  });

  // Empty categories are thin pages: keep them out of the index until they have products.
  if (category && categoryProductCount(category, allCategories) === 0) {
    metadata.robots = { index: false, follow: true };
  }
  return metadata;
}

export default async function LangProductCategoryRoute({ params }) {
  const resolved = resolveParams(await params);
  const lang = resolved?.lang || DEFAULT_LANG;
  const categorySlug = resolved?.category;

  if (!categorySlug) notFound();
  const categories = await getProductCategories(lang);
  const category = categories.find((item) => item.slug === categorySlug);
  const path = langHref(`/product-category/${categorySlug}`, lang);

  return (
    <>
      {category && <JsonLd data={buildSchemaFromYoast(category, { path })} />}
      <ProductCategoryPage categorySlug={categorySlug} lang={lang} />
    </>
  );
}
