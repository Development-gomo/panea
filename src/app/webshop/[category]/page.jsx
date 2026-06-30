import { getProductCategories } from "@/lib/api";
import { DEFAULT_LANG } from "@/config";
import { permanentRedirect } from "next/navigation";

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
  permanentRedirect(`/product-category/${resolved.category}/`);
}
