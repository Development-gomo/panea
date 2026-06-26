"use client";

import Image from "next/image";
import Link from "next/link";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { DEFAULT_LANG, langHref } from "@/config";
import "swiper/css";
import "swiper/css/pagination";

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

function getProductAcf(product) {
  return {
    ...(product?.acf || {}),
    ...(product?.acf_fields || {}),
    ...(product?.advanced_custom_fields || {}),
    ...(product?.meta?.acf || {}),
  };
}

function toText(value) {
  if (value === undefined || value === null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") return stripHtml(value);
  if (typeof value === "object") {
    return (
      toText(value.rendered) ||
      toText(value.title) ||
      toText(value.label) ||
      toText(value.name) ||
      toText(value.value) ||
      toText(value.text)
    );
  }

  return "";
}

function getField(source, keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== "") {
      return source[key];
    }
  }

  return "";
}

function getImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;

  return (
    image.source_url ||
    image.url ||
    image.src ||
    image.full_src ||
    image.sizes?.woocommerce_thumbnail ||
    image.sizes?.medium ||
    image.sizes?.large ||
    image.media_details?.sizes?.medium?.source_url ||
    image.media_details?.sizes?.large?.source_url ||
    ""
  );
}

function getProductImage(product) {
  return (
    getImageUrl(product?._embedded?.["wp:featuredmedia"]?.[0]) ||
    getImageUrl(product?.featured_image) ||
    getImageUrl(product?.featured_image_url) ||
    getImageUrl(product?.woo?.images?.[0]) ||
    getImageUrl(product?.images?.[0]) ||
    getImageUrl(product?.acf?.featured_image) ||
    getImageUrl(product?.acf?.product_image) ||
    ""
  );
}

function getRelatedProductsGroup(acf) {
  const group = getField(acf, ["related_products"]);
  return group && typeof group === "object" && !Array.isArray(group) ? group : {};
}

function ProductCard({ product, lang }) {
  const acf = getProductAcf(product);
  const title = toText(product?.title);
  const image = getProductImage(product);
  const description = toText(
    getField(acf, ["short_information", "short_description", "description"])
  );
  const quoteLabel = toText(getField(acf, ["request_a_quote_button_label"])) || "Request a quote";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-sm border border-[#C7C0B6] bg-white p-4">
      <Link
        href={langHref(`/product/${product.slug}`, lang)}
        className="relative mb-5 block aspect-[4/3] w-full"
      >
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1200px) 260px, (min-width: 768px) 33vw, 80vw"
            className="object-contain"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-2 text-[18px] font-medium leading-snug text-[#1E2E31] sm:text-[20px] sm:leading-normal">
          {title}
        </h3>
        {description && (
          <p className="mb-5 truncate text-[12px] leading-5 text-[#1E2E31]">
            {description}
          </p>
        )}

        <div className="mt-auto space-y-3">
          <button
            type="button"
            className="min-h-11 w-full cursor-pointer rounded-full bg-[#B8D9DB] px-4 text-[12px] text-[#1E2E31] transition hover:bg-black hover:text-white sm:px-6"
          >
            {quoteLabel}
          </button>
          <Link
            href={langHref(`/product/${product.slug}`, lang)}
            className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-[#1E2E31] px-4 text-[12px] text-white transition hover:bg-black sm:px-6"
          >
            Read more
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function RelatedProducts({
  product,
  products = [],
  lang = DEFAULT_LANG,
}) {
  const acf = getProductAcf(product);
  const relatedProducts = getRelatedProductsGroup(acf);
  const smallHeading = toText(getField(relatedProducts, ["small_heading"]));
  const largeHeading = toText(getField(relatedProducts, ["large_heading"]));
  const webshopLinkText = toText(getField(relatedProducts, ["webshop_link_text"]));
  const webshopLink =
    toText(getField(relatedProducts, ["webshop_link_url", "webshop_link", "link", "url"])) ||
    "/webshop";

  if (!products.length) return null;

  return (
    <section className="overflow-hidden bg-[#F2EBE2]">
      <div className="web-width mx-auto px-4 pt-14 pb-14 sm:px-6 pt-[60px] pb-[60px]">
        <div className="mx-auto mb-8 max-w-4xl text-center md:mb-10">
          {smallHeading && (
            <p className="mb-3 text-[12px] leading-5 text-[#1E2E31]">{smallHeading}</p>
          )}
          {largeHeading && (
            <h2 className="text-[26px] font-normal leading-tight text-[#1E2E31] sm:text-[32px] md:text-[40px]">
              {largeHeading}
            </h2>
          )}
          {webshopLinkText && (
            <Link
              href={langHref(webshopLink, lang)}
              className="mt-4 inline-flex cursor-pointer items-center text-[12px] leading-5 text-[#1E2E31] underline underline-offset-4"
            >
              {webshopLinkText}
              <span aria-hidden="true" className="ml-1">
                -&gt;
              </span>
            </Link>
          )}
        </div>

        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={16}
          slidesPerView={1.05}
          breakpoints={{
            480: { slidesPerView: 1.25, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            900: { slidesPerView: 3, spaceBetween: 20 },
            1200: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="related-products-swiper !overflow-visible [&_.swiper-pagination]:!relative [&_.swiper-pagination]:!bottom-auto [&_.swiper-pagination]:!mt-10 [&_.swiper-pagination]:!flex [&_.swiper-pagination]:!items-center [&_.swiper-pagination]:!justify-center [&_.swiper-pagination-bullet]:!mx-1 [&_.swiper-pagination-bullet]:!h-2 [&_.swiper-pagination-bullet]:!w-2 [&_.swiper-pagination-bullet]:!bg-[#1E2E31] [&_.swiper-pagination-bullet]:!opacity-100 [&_.swiper-pagination-bullet-active]:!h-4 [&_.swiper-pagination-bullet-active]:!w-4"
        >
          {products.map((relatedProduct) => (
            <SwiperSlide key={relatedProduct.id} className="h-auto">
              <ProductCard product={relatedProduct} lang={lang} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
