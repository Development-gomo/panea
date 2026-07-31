"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import ProductTitle from "./ProductTitle";
import { DEFAULT_LANG, langHref } from "@/config";

const QUOTE_CART_STORAGE_KEY = "panea_quote_cart";
const QUOTE_CART_UPDATED_EVENT = "panea:quote-cart-updated";

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
  if (typeof value === "string" || typeof value === "number") {
    return stripHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join(", ");
  }
  if (typeof value === "object") {
    return (
      toText(value.rendered) ||
      toText(value.title) ||
      toText(value.label) ||
      toText(value.name) ||
      toText(value.value)
    );
  }

  return "";
}

function toHtml(value) {
  if (value === undefined || value === null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const items = value.map(toText).filter(Boolean);
    return items.length > 0
      ? `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`
      : "";
  }
  if (typeof value === "object") {
    return (
      toHtml(value.rendered) ||
      toHtml(value.value) ||
      toHtml(value.text) ||
      toHtml(value.content)
    );
  }

  return "";
}

function hasHtml(value) {
  return stripHtml(toHtml(value)).length > 0;
}

function getField(acf, keys) {
  for (const key of keys) {
    if (acf[key] !== undefined && acf[key] !== null && acf[key] !== "") {
      return acf[key];
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
    image.thumbnail ||
    image.full_src ||
    image.sizes?.woocommerce_thumbnail ||
    image.sizes?.woocommerce_single ||
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
    getImageUrl(product?.acf?.featured_image) ||
    getImageUrl(product?.acf?.product_image) ||
    getImageUrl(product?.woo?.images?.[0]) ||
    getImageUrl(product?.images?.[0]) ||
    ""
  );
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

function getQuoteCartItems() {
  if (typeof window === "undefined") return [];

  try {
    const items = JSON.parse(
      window.localStorage.getItem(QUOTE_CART_STORAGE_KEY) || "[]"
    );
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

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

function saveQuoteCartItems(items) {
  window.localStorage.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(
    new CustomEvent(QUOTE_CART_UPDATED_EVENT, { detail: { items } })
  );
}

function ProductButton({
  label,
  variant = "primary",
  onClick,
  disabled = false,
  href = "",
  lang = DEFAULT_LANG,
}) {
  if (!label) return null;

  const classes =
    variant === "primary"
      ? "border-[#1E2E31] bg-[#1E2E31] text-white"
      : "border-(--color-body) text-(--color-body)";
  const className = `flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border px-8 text-[16px] transition hover:border-black hover:bg-black hover:text-white sm:w-auto ${classes}`;

  if (href) {
    return (
      <Link href={langHref(href, lang)} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {label}
    </button>
  );
}

export default function ProductDetails({ product, lang = DEFAULT_LANG }) {
  const [activeModelIndex, setActiveModelIndex] = useState(null);
  const [quoteMessage, setQuoteMessage] = useState("");
  const quoteCartSnapshot = useSyncExternalStore(
    subscribeQuoteCart,
    getQuoteCartSnapshot,
    getServerQuoteCartSnapshot
  );
  const acf = getProductAcf(product);
  const productName = product?.title?.rendered;
  const articleNumber = toText(getField(acf, ["article_number"]));
  const shortInformation = toHtml(getField(acf, ["short_information"]));
  const keyFeatures = toHtml(getField(acf, ["key_features"]));
  const quoteButtonLabel =
    lang === "sv" ? "Begär en offert" : "Request a quote";
  const serviceButtonLabel = toText(getField(acf, ["buy_service_agreements"]));
  const productImage = getProductImage(product);
  const availableModels = getRepeaterItems(acf, "available_models");
  const productId = String(product?.id || product?.slug || productName || "");
  const activeModel = activeModelIndex !== null ? availableModels[activeModelIndex] : "";
  const quoteCartItems = parseQuoteCartItems(quoteCartSnapshot);
  const existingProductCartItem = quoteCartItems.find(
    (item) => item.productId === productId
  );
  const effectiveModel = activeModel || existingProductCartItem?.model || "";
  const effectiveModelIndex =
    activeModelIndex !== null
      ? activeModelIndex
      : availableModels.findIndex((model) => model === effectiveModel);
  const currentQuoteItemId = `${productId}:${effectiveModel || "default"}`;
  const isInQuoteCart = quoteCartItems.some(
    (item) => item.id === currentQuoteItemId
  );

  function handleQuoteClick() {
    if (isInQuoteCart) return;

    if (availableModels.length > 0 && !effectiveModel) {
      setQuoteMessage("Please select an available model first.");
      return;
    }

    const items = getQuoteCartItems();
    const itemId = `${productId}:${effectiveModel || "default"}`;
    const nextItems = items.some((item) => item.id === itemId)
      ? items
      : [
          ...items,
          {
            id: itemId,
            productId,
            productName: toText(productName),
            articleNumber,
            model: effectiveModel,
            imageUrl: productImage,
            quantity: 1,
          },
        ];

    saveQuoteCartItems(nextItems);
    setQuoteMessage("");
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <ProductTitle title={productName} />

        {articleNumber && (
          <span className="inline-flex rounded-sm border border-[#C7C0B6] bg-[#F8F4EE] px-3 py-1 text-[11px] leading-none text-[#596366]">
            {lang === "sv" ? "Artikel" : "Article"} - {articleNumber}
          </span>
        )}
      </div>

      {hasHtml(shortInformation) && (
        <div
          className="max-w-[590px] mb-6 font-light [&>p:last-child]:mb-0 "
          dangerouslySetInnerHTML={{ __html: shortInformation }}
        />
      )}

      {availableModels.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[16px] font-medium">Available models</h2>
          <div className="flex flex-wrap gap-2">
            {availableModels.map((model, index) => (
              <button
                type="button"
                key={`${model}-${index}`}
                onClick={() => {
                  setActiveModelIndex(index);
                  setQuoteMessage("");
                }}
                className={`inline-flex min-h-10 cursor-pointer items-center rounded-full px-4 text-[12px] transition hover:bg-[#1E2E31] hover:text-white sm:px-6 ${
                  effectiveModelIndex === index
                    ? "bg-[#1E2E31] text-white"
                    : "bg-[#B8D9DB] text-(--color-body)"
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </section>
      )}

      {hasHtml(keyFeatures) && (
        <section className="space-y-3">
          <div
            className="body-text max-w-[590px] text-[14px] [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-5 [&>p]:mb-3 [&>p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: keyFeatures }}
          />
        </section>
      )}

      {(quoteButtonLabel || serviceButtonLabel) && (
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
          <ProductButton
            label={
              isInQuoteCart
                ? lang === "sv"
                  ? "Visa varukorgen"
                  : "View cart"
                : quoteButtonLabel
            }
            onClick={isInQuoteCart ? undefined : handleQuoteClick}
            href={isInQuoteCart ? "/cart" : ""}
            lang={lang}
          />
          <ProductButton label={serviceButtonLabel} variant="secondary" />
        </div>
      )}
      {quoteMessage && (
        <p className="text-[14px] leading-tight text-red-700">{quoteMessage}</p>
      )}
    </div>
  );
}
