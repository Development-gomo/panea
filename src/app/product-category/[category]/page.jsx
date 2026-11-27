import ProductCategoryPage from "@/components/product/productcategory/ProductCategoryPage";
import { getAllProducts, getProductCategories } from "@/lib/api";
import {
  buildMetadataFromYoast,
  buildSchemaFromYoast,
  categoryProductCount,
  categoryShareImage,
} from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { DEFAULT_LANG, langHref } from "@/config";

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

  // Product categories carry Yoast data on the term; map it to the shape the helper expects.
  const entry = category
    ? {
        ...category,
        title: { rendered: category.name },
        excerpt: { rendered: category.description || "" },
      }
    : null;

  const allCategories = await getProductCategories(DEFAULT_LANG, { includeChildren: true });
  const metadata = buildMetadataFromYoast(entry, {
    fallbackTitle: `${category?.name || "Product category"} | Panea`,
    lang: DEFAULT_LANG,
    path: category ? langHref(`/product-category/${category.slug}`, DEFAULT_LANG) : null,
    isArchiveTerm: true,
    fallbackImage: category
      ? categoryShareImage(
          category,
          await getAllProducts(DEFAULT_LANG),
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

export default async function ProductCategoryRoute({ params }) {
  const resolved = await params;
  const categories = await getProductCategories(DEFAULT_LANG);
  const category = categories.find((item) => item.slug === resolved.category);
  const path = langHref(`/product-category/${resolved.category}`, DEFAULT_LANG);

  return (
    <>
      {category && <JsonLd data={buildSchemaFromYoast(category, { path })} />}
      <ProductCategoryPage categorySlug={resolved.category} lang={DEFAULT_LANG} />
    </>
  );
}
