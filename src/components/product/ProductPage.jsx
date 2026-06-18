import ProductBreadcrumbs from "./ProductBreadcrumbs";
import ProductDetails from "./ProductDetails";
import ProductGallery from "./ProductGallery";
import RelatedProducts from "./RelatedProducts";
import ProductTabs from "./ProductTabs";

export default function ProductPage({ product, lang, relatedProducts = [] }) {
  return (
    <>
      <ProductBreadcrumbs product={product} lang={lang} />

      <article className="bg-[#F2EBE2]">
        <div className="web-width mx-auto grid min-w-0 gap-8 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-20">
          <section aria-label="Product media" className="min-w-0">
            <ProductGallery product={product} />
          </section>
          <section className="min-w-0">
            <ProductDetails product={product} />
          </section>
        </div>
      </article>

      <ProductTabs product={product} />
      <RelatedProducts product={product} products={relatedProducts} lang={lang} />
    </>
  );
}
