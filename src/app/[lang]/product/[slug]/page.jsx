import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { ProductPage } from "@/components/product";
import { resolveParams } from "@/lib/params";
import {
  getProductBySlug,
  getAllProducts,
  getMenu,
  getRelatedProducts,
  getThemeOptions,
} from "@/lib/api";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

export const revalidate = 3600;

export async function generateStaticParams() {
  const results = await Promise.all(
    SUPPORTED_LANGS.map((lang) => getAllProducts(lang))
  );

  return SUPPORTED_LANGS.flatMap((lang, i) =>
    (Array.isArray(results[i]) ? results[i] : []).map((product) => ({
      lang,
      slug: product.slug,
    }))
  );
}

export default async function ProductSinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) notFound();

  const [product, menu, themeOptions] = await Promise.all([
    getProductBySlug(slug, lang),
    getMenu(lang),
    getThemeOptions(lang),
  ]);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product, lang);

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType="product"
        pathPrefix="product"
        entryId={product?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        <ProductPage product={product} lang={lang} relatedProducts={relatedProducts} />
      </main>
      <Footer lang={lang} currentSlug={slug} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);
  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) {
    return {
      title: "Product | panea",
    };
  }

  const product = await getProductBySlug(slug, lang);

  return buildMetadataFromYoast(product, {
    fallbackTitle: `${slug} | panea`,
    lang,
  });
}
