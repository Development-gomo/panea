"use client";

import { Fragment, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_LANG, langHref } from "@/config";
import DownArrow from "../../../../public/down-arrow.svg";

const PRODUCTS_PER_PAGE = 12;
const QUOTE_CART_STORAGE_KEY = "panea_quote_cart";
const QUOTE_CART_UPDATED_EVENT = "panea:quote-cart-updated";

function parseQuoteCartItems(value) {
  try {
    const items = JSON.parse(value || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function subscribeQuoteCart(callback) {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => callback();
  window.addEventListener(QUOTE_CART_UPDATED_EVENT, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(QUOTE_CART_UPDATED_EVENT, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}

function getQuoteCartSnapshot() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(QUOTE_CART_STORAGE_KEY) || "[]";
}

function getServerQuoteCartSnapshot() {
  return "[]";
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

function toText(value) {
  if (value === undefined || value === null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") return stripHtml(value);
  if (typeof value === "object") {
    return (
      toText(value.rendered) ||
      toText(value.title) ||
      toText(value.name) ||
      toText(value.label) ||
      toText(value.value)
    );
  }

  return "";
}

function getProductAcf(product) {
  return {
    ...(product?.acf || {}),
    ...(product?.acf_fields || {}),
    ...(product?.advanced_custom_fields || {}),
    ...(product?.meta?.acf || {}),
  };
}

function getField(source, keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== "") {
      return source[key];
    }
  }

  return "";
}

function getRepeaterLabel(item) {
  if (typeof item === "string" || typeof item === "number") return toText(item);
  if (!item || typeof item !== "object") return "";

  const preferredKeys = [
    "available_model",
    "available_models",
    "model",
    "model_name",
    "model_label",
    "title",
    "label",
    "name",
    "text",
    "litres",
    "liters",
    "liter",
  ];

  for (const key of preferredKeys) {
    const value = toText(item[key]);
    if (value) return value;
  }

  return toText(
    Object.values(item).find(
      (value) => typeof value === "string" || typeof value === "number"
    )
  );
}

function getRepeaterItems(acf, fieldName) {
  const value = acf[fieldName];

  if (Array.isArray(value)) return value.map(getRepeaterLabel).filter(Boolean);

  if (value && typeof value === "object") {
    return Object.values(value).map(getRepeaterLabel).filter(Boolean);
  }

  const rowCount = Number(value);
  if (Number.isInteger(rowCount) && rowCount > 0) {
    return Array.from({ length: rowCount }, (_, index) => {
      const prefix = `${fieldName}_${index}_`;
      const row = Object.fromEntries(
        Object.entries(acf)
          .filter(([key]) => key.startsWith(prefix))
          .map(([key, fieldValue]) => [key.replace(prefix, ""), fieldValue])
      );

      return getRepeaterLabel(row);
    }).filter(Boolean);
  }

  if (typeof value === "string" && value.includes(",")) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return toText(value) ? [toText(value)] : [];
}

function getImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;

  return (
    image.source_url ||
    image.url ||
    image.src ||
    image.thumbnail ||
    image.full_src ||
    image.sizes?.full ||
    image.sizes?.woocommerce_thumbnail ||
    image.sizes?.woocommerce_single ||
    image.sizes?.medium ||
    image.sizes?.large ||
    image.media_details?.sizes?.full?.source_url ||
    image.media_details?.sizes?.medium?.source_url ||
    image.media_details?.sizes?.large?.source_url ||
    ""
  );
}

function getProductImage(product) {
  return (
    getImageUrl(product?._embedded?.["wp:featuredmedia"]?.[0]) ||
    getImageUrl(product?.featured_media) ||
    getImageUrl(product?.featured_image) ||
    getImageUrl(product?.featured_image_url) ||
    getImageUrl(product?.acf?.featured_image) ||
    getImageUrl(product?.acf?.product_image) ||
    getImageUrl(product?.woo?.images?.[0]) ||
    getImageUrl(product?.images?.[0]) ||
    ""
  );
}

function getProductCategoryIds(product) {
  const ids = new Set();

  [
    product?.product_cat,
    product?.product_categories,
    product?.categories,
  ].forEach((value) => {
    if (!Array.isArray(value)) return;
    value.forEach((id) => {
      if (Number.isInteger(Number(id))) ids.add(Number(id));
    });
  });

  const embeddedTerms = product?._embedded?.["wp:term"] || [];
  embeddedTerms.flat().forEach((term) => {
    if (term?.taxonomy === "product_cat" && term?.id) {
      ids.add(Number(term.id));
    }
  });

  return [...ids];
}

function getProductBrandKeys(product) {
  const keys = new Set();

  [
    product?.product_brand,
    product?.product_brands,
    product?.brands,
    product?.pa_brand,
  ].forEach((value) => {
    if (!Array.isArray(value)) return;
    value.forEach((item) => {
      if (typeof item === "object") {
        if (item.id) keys.add(`id:${item.id}`);
        if (item.slug) keys.add(`slug:${item.slug}`);
      } else {
        keys.add(`id:${item}`);
      }
    });
  });

  const embeddedTerms = product?._embedded?.["wp:term"] || [];
  embeddedTerms.flat().forEach((term) => {
    if (
      ["product_brand", "pwb-brand", "pa_brand"].includes(term?.taxonomy)
    ) {
      if (term.id) keys.add(`id:${term.id}`);
      if (term.slug) keys.add(`slug:${term.slug}`);
    }
  });

  if (Array.isArray(product?.woo?.brands)) {
    product.woo.brands.forEach((brand) => {
      if (brand.id) keys.add(`id:${brand.id}`);
      if (brand.slug) keys.add(`slug:${brand.slug}`);
    });
  }

  if (Array.isArray(product?.woo?.attributes)) {
    product.woo.attributes.forEach((attribute) => {
      const attributeName = String(attribute?.name || "").toLowerCase();
      if (!attributeName.includes("brand")) return;

      (attribute.terms || []).forEach((term) => {
        if (term.id) keys.add(`id:${term.id}`);
        if (term.slug) keys.add(`slug:${term.slug}`);
      });
    });
  }

  return [...keys];
}

function getBrandKey(brand) {
  if (brand?.id) return `id:${brand.id}`;
  if (brand?.slug) return `slug:${brand.slug}`;
  return `name:${brand?.name || ""}`;
}

function getCategoryHref(category, lang = DEFAULT_LANG) {
  if (!category?.slug) return langHref("/webshop", lang);
  return langHref(`/product-category/${category.slug}/`, lang);
}

function getCategoryParentId(category) {
  if (!category?.parent) return 0;
  if (typeof category.parent === "object") {
    return Number(category.parent.id || category.parent.ID || 0);
  }

  return Number(category.parent);
}

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage, "...", totalPages];
}

function PaginationArrow({ direction = "prev" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="6"
      height="11"
      viewBox="0 0 6 11"
      fill="none"
      className={direction === "next" ? "rotate-180" : ""}
      aria-hidden="true"
    >
      <path
        d="M5.82426 9.77573C6.05858 10.01 6.05858 10.3899 5.82426 10.6243C5.58995 10.8586 5.21005 10.8586 4.97574 10.6243L0.175736 5.82426C-0.0585785 5.58995 -0.0585785 5.21005 0.175736 4.97573L4.97574 0.175736C5.21005 -0.0585786 5.58995 -0.0585786 5.82426 0.175736C6.05858 0.41005 6.05858 0.789949 5.82426 1.02426L1.44853 5.4L5.82426 9.77573Z"
        fill="#1E2E31"
      />
    </svg>
  );
}

function saveQuoteCartItems(items) {
  window.localStorage.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(
    new CustomEvent(QUOTE_CART_UPDATED_EVENT, { detail: { items } })
  );
}

function ProductCard({ product, lang, quoteCartItems = [] }) {
  const acf = getProductAcf(product);
  const title = toText(product?.title);
  const image = getProductImage(product);
  const articleNumber = toText(getField(acf, ["article_number"]));
  const availableModels = getRepeaterItems(acf, "available_models");
  const firstModel = availableModels[0] || "";
  const description = toText(
    getField(acf, ["short_information", "short_description", "description"])
  );
  const quoteLabel =
    toText(getField(acf, ["request_a_quote_button_label"])) || "Request a quote";
  const productId = String(product?.id || product?.slug || title || "");
  const isInQuoteCart = quoteCartItems.some(
    (item) => item.productId === productId
  );
  const quoteItemId = `${productId}:${firstModel || "default"}`;

  const addToQuoteCart = () => {
    if (quoteCartItems.some((item) => item.id === quoteItemId)) return;

    saveQuoteCartItems([
      ...quoteCartItems,
      {
        id: quoteItemId,
        productId,
        productName: title,
        articleNumber,
        model: firstModel,
        imageUrl: image,
        quantity: 1,
      },
    ]);
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[7px] border border-[#CFC7BA] bg-white p-4">
      <Link
        href={langHref(`/product/${product.slug}`, lang)}
        className="relative mb-8 block aspect-[4/3] w-full"
      >
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1200px) 280px, (min-width: 768px) 30vw, 90vw"
            className="object-contain"
          />
        ) : (
          <div className="absolute inset-0 rounded-[4px] bg-[#F2EBE2]" />
        )}
      </Link>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-1 text-[20px] font-normal leading-snug text-[#1E2E31]">
          {title}
        </h3>
        {description && (
          <p className="mb-5 truncate text-[12px] font-light leading-5 text-[#1E2E31]">
            {description}
          </p>
        )}

        <div className="mt-auto space-y-3">
          {isInQuoteCart ? (
            <Link
              href={langHref("/cart", lang)}
              className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-[#B8D9DB] px-4 text-[14px] text-[#1E2E31] transition hover:bg-black hover:text-white"
            >
              View cart
            </Link>
          ) : (
            <button
              type="button"
              onClick={addToQuoteCart}
              className="min-h-11 w-full cursor-pointer rounded-full bg-[#B8D9DB] px-4 text-[14px] text-[#1E2E31] transition hover:bg-black hover:text-white"
            >
              {quoteLabel}
            </button>
          )}
          <Link
            href={langHref(`/product/${product.slug}`, lang)}
            className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-[#1E2E31] px-4 text-[14px] text-white transition hover:bg-black"
          >
            Read more
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ProductCategoryProductsSection({
  products = [],
  categories = [],
  brands = [],
  categorySlug = "",
  lang = DEFAULT_LANG,
}) {
  const quoteCartSnapshot = useSyncExternalStore(
    subscribeQuoteCart,
    getQuoteCartSnapshot,
    getServerQuoteCartSnapshot
  );
  const [currentPaginationPage, setCurrentPaginationPage] = useState(1);
  const [brandOpen, setBrandOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const parentCategories = useMemo(
    () => categories.filter((category) => !getCategoryParentId(category)),
    [categories]
  );
  const activeCategory = categories.find(
    (category) => category.slug === categorySlug
  );
  const activeParentCategory = activeCategory
    ? parentCategories.find(
        (category) => category.id === getCategoryParentId(activeCategory)
      ) || activeCategory
    : null;
  const activeParentId = activeParentCategory?.id;

  const filteredProducts = useMemo(() => {
    let nextProducts = products;

    if (activeCategory) {
      nextProducts = nextProducts.filter((product) =>
        getProductCategoryIds(product).includes(Number(activeCategory.id))
      );
    }

    if (selectedBrands.length > 0) {
      nextProducts = nextProducts.filter((product) => {
        const productBrands = getProductBrandKeys(product);
        return selectedBrands.some((brandKey) => productBrands.includes(brandKey));
      });
    }

    return nextProducts;
  }, [activeCategory, products, selectedBrands]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );
  const currentPage = Math.min(currentPaginationPage, totalPages);
  const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(
    pageStart,
    pageStart + PRODUCTS_PER_PAGE
  );
  const selectedBrandCount = selectedBrands.length;
  const hasSelectedFilters = selectedBrandCount > 0;
  const quoteCartItems = parseQuoteCartItems(quoteCartSnapshot);

  const toggleBrand = (brandKey) => {
    setSelectedBrands((brands) =>
      brands.includes(brandKey)
        ? brands.filter((item) => item !== brandKey)
        : [...brands, brandKey]
    );
    setCurrentPaginationPage(1);
  };

  const clearBrands = () => {
    setSelectedBrands([]);
    setBrandOpen(false);
    setCurrentPaginationPage(1);
  };

  return (
    <section className="bg-[#F2EBE2] pt-[24px]">
      <div className="web-width mx-auto px-6">
        <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="self-start overflow-hidden rounded-[4px] border border-[#D5CDC1] bg-[#F2EBE2]">
            <Link
              href={langHref("/webshop", lang)}
              className={`flex min-h-[62px] w-full cursor-pointer items-center border-b border-[#D5CDC1] px-6 text-left text-[16px] transition ${
                !activeCategory
                  ? "text-[#1E2E31]"
                  : "text-[#1E2E31] hover:bg-white/55"
              }`}
            >
              All categories
            </Link>

            {parentCategories.map((category) => {
              const isActiveParent = activeParentId === category.id;

              return (
                <Fragment key={category.id}>
                  <Link
                    href={getCategoryHref(category, lang)}
                    className={`flex min-h-[62px] w-full cursor-pointer items-center border-b border-[#D5CDC1] px-6 text-left text-[14px] leading-[1.35] transition last:border-b-0 ${
                      isActiveParent
                        ? "text-[#1E2E31]"
                        : "text-[#1E2E31]/80 hover:bg-white/55 hover:text-[#1E2E31]"
                    }`}
                  >
                    <span>{category.name}</span>
                  </Link>
                </Fragment>
              );
            })}
          </aside>

          <div className="min-w-0">
            <div className="mb-6 flex min-h-10 items-center justify-between gap-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBrandOpen((open) => !open)}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[#1E2E31]/20 bg-[#F2EBE2] px-5 text-[14px] leading-none text-[#1E2E31] transition hover:bg-white"
                >
                  Brands
                  {selectedBrandCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1E2E31] px-1.5 text-[14px] leading-none text-white">
                      {selectedBrandCount}
                    </span>
                  )}
                  <Image
                    src={DownArrow}
                    alt=""
                    width={20}
                    height={20}
                    className={`opacity-70 transition-transform ${
                      brandOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {brandOpen && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[180px] rounded-[7px] border border-[#D5CDC1] bg-white p-3 shadow-sm">
                    <div className="space-y-2">
                      {brands.length > 0 ? (
                        brands.map((brand) => {
                          const brandKey = getBrandKey(brand);

                          return (
                            <label
                              key={brandKey}
                              className="flex cursor-pointer items-center gap-3 rounded-[4px] px-2 py-2 text-[13px] text-[#1E2E31] transition hover:bg-[#F2EBE2]"
                            >
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brandKey)}
                                onChange={() => toggleBrand(brandKey)}
                                className="h-4 w-4 accent-[#1E2E31]"
                              />
                              <span>{brand.name}</span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="px-2 py-2 text-[13px] text-[#1E2E31]/55">
                          No brands found
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {hasSelectedFilters && (
                <button
                  type="button"
                  onClick={clearBrands}
                  className="cursor-pointer text-[14px] text-[#1E2E31]/50 transition hover:text-[#1E2E31]"
                >
                  Clear all
                </button>
              )}
            </div>

            {visibleProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    lang={lang}
                    quoteCartItems={quoteCartItems}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[7px] border border-[#D5CDC1] bg-white p-8 text-center text-[14px] text-[#1E2E31]/70">
                No products found.
              </div>
            )}

            {totalPages > 1 && (
              <nav
                className="mt-14 flex items-center justify-center gap-4"
                aria-label="Product pagination"
              >
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPaginationPage((value) => Math.max(1, value - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#1E2E31]/20 text-[18px] text-[#1E2E31] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <PaginationArrow />
                </button>

                {getPaginationItems(currentPage, totalPages).map((item, index) =>
                  item === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1 text-[13px] text-[#1E2E31]"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setCurrentPaginationPage(item)}
                      className={`h-11 min-w-11 cursor-pointer rounded-full px-3 text-[13px] transition ${
                        currentPage === item
                          ? "bg-[#1E2E31] text-white"
                          : "text-[#1E2E31] hover:bg-white"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPaginationPage((value) =>
                      Math.min(totalPages, value + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#1E2E31]/20 text-[18px] text-[#1E2E31] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <PaginationArrow direction="next" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
