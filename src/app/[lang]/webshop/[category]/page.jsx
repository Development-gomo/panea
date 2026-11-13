import { permanentRedirect } from "next/navigation";
import { resolveParams } from "@/lib/params";
import { DEFAULT_LANG, langHref } from "@/config";

export const revalidate = 3600;

export default async function LangWebshopCategoryRoute({ params }) {
  const resolved = resolveParams(await params);
  const lang = resolved?.lang || DEFAULT_LANG;
  const categorySlug = resolved?.category;
  permanentRedirect(langHref(`/product-category/${categorySlug}/`, lang));
}
