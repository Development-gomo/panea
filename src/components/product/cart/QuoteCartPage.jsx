"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_LANG, langHome, langHref } from "@/config";
import RelatedProducts from "@/components/product/RelatedProducts";
import WebshopHighlightBanner from "@/components/product/webshop/HighlightBanner";

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

function saveQuoteCartItems(items) {
  window.localStorage.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(
    new CustomEvent(QUOTE_CART_UPDATED_EVENT, { detail: { items } })
  );
}

function updateItemQuantity(items, itemId, quantity) {
  const nextQuantity = Math.max(1, Number(quantity) || 1);

  return items.map((item) =>
    item.id === itemId ? { ...item, quantity: nextQuantity } : item
  );
}

function getCartHighlightBanner(page) {
  const acf = page?.acf || page?.acf_fields || {};

  function findBannerData(value) {
    if (!value || typeof value !== "object") return null;

    const hasBannerFields =
      value.background_image !== undefined &&
      (value.title !== undefined ||
        value.description !== undefined ||
        value.cta_text !== undefined);

    if (hasBannerFields) return value;

    for (const nestedValue of Object.values(value)) {
      const match = findBannerData(nestedValue);
      if (match) return match;
    }

    return null;
  }

  const data =
    acf.highlight_banner ||
    acf.cart_highlight_banner ||
    findBannerData(acf);

  if (!data) return null;

  return {
    background_image: data.background_image,
    logo: data.logo,
    title: data.title,
    description: data.description,
    button_row:
      data.button_row ||
      (data.cta_text && data.cta_url
        ? [{ cta_text: data.cta_text, cta_url: data.cta_url }]
        : []),
  };
}

function Field({ label, name, type = "text", required = false, textarea = false }) {
  const inputClass =
    "mt-2 w-full border-0 border-b border-white/20 bg-transparent px-0 py-2 text-[14px] text-white outline-none transition focus:border-white";

  return (
    <label className="block text-[12px] font-normal leading-none text-white/60">
      {label}
      {required ? " *" : ""}
      {textarea ? (
        <textarea
          name={name}
          required={required}
          className={`${inputClass} min-h-[92px] resize-y`}
        />
      ) : (
        <input name={name} type={type} required={required} className={inputClass} />
      )}
    </label>
  );
}

function CartItem({ item, items }) {
  const quantity = Number(item.quantity || 1);

  const setQuantity = (nextQuantity) => {
    saveQuoteCartItems(updateItemQuantity(items, item.id, nextQuantity));
  };

  const removeItem = () => {
    saveQuoteCartItems(items.filter((cartItem) => cartItem.id !== item.id));
  };

  return (
    <article className="grid gap-4 border-b border-[#DED8CF] bg-white p-4 sm:grid-cols-[104px_minmax(0,1fr)] sm:p-5">
      <div className="relative h-[104px] w-[104px] overflow-hidden rounded-[8px] bg-[#F1EFEB]">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.productName || "Product image"}
            fill
            sizes="104px"
            className="object-contain p-3"
          />
        )}
      </div>

      <div className="min-w-0">
        <h3 className="mb-1 text-[18px] font-normal leading-tight text-(--color-body)">
          {item.productName || "Product"}
        </h3>

        {item.model && (
          <p className="mb-1 text-[12px] leading-4 text-[#596366]">
            Module: {item.model}
          </p>
        )}

        {item.articleNumber && (
          <p className="mb-4 text-[12px] leading-4 text-[#596366]">
            Article number: {item.articleNumber}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 items-center rounded-full border border-[#C7C0B6] bg-white">
          <button
            type="button"
            onClick={() => setQuantity(quantity - 1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-[16px] text-(--color-body)"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="h-9 w-8 border-0 bg-transparent p-0 text-center text-[13px] text-(--color-body) outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-[16px] text-(--color-body)"
            aria-label="Increase quantity"
          >
            +
          </button>
          </div>
          <button
            type="button"
            onClick={removeItem}
            className="cursor-pointer text-[12px] leading-none text-[#596366] transition hover:text-(--color-body)"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

export default function QuoteCartPage({
  lang = DEFAULT_LANG,
  page,
  relatedProducts = [],
}) {
  const quoteCartSnapshot = useSyncExternalStore(
    subscribeQuoteCart,
    getQuoteCartSnapshot,
    getServerQuoteCartSnapshot
  );
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const items = useMemo(
    () => parseQuoteCartItems(quoteCartSnapshot),
    [quoteCartSnapshot]
  );
  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );
  const highlightBanner = getCartHighlightBanner(page);

  const submitRequest = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitMessage("");
    setSubmitError("");

    if (items.length === 0) {
      setSubmitError("Please add at least one product before submitting.");
      return;
    }

    const formData = new FormData(formElement);
    const payload = {
      form: {
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        company: String(formData.get("company") || ""),
        message: String(formData.get("message") || ""),
      },
      items,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/quote-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to submit your quote request. Please try again."
        );
      }

      saveQuoteCartItems([]);
      formElement.reset();
      setSubmitMessage(
        data?.orderId
          ? `Thank you. Your quote request has been submitted. Order #${data.orderId}.`
          : "Thank you. Your quote request has been submitted."
      );
      if (data?.warning) {
        setSubmitError(data.warning);
      }
    } catch (error) {
      setSubmitError(error?.message || "Unable to submit your quote request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[#F3EDE5]">
      <nav
        aria-label="Breadcrumb"
        className="border-t border-[#D6CEC2] bg-[#F2EBE2]"
      >
        <ol className="web-width mx-auto flex min-h-11 items-center gap-2 px-6 text-[12px] leading-none text-[#596366]">
          <li>
            <Link
              href={langHome(lang)}
              className="transition hover:text-(--color-body)"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={langHref("/webshop", lang)}
              className="transition hover:text-(--color-body)"
            >
              Webshop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-(--color-body)" aria-current="page">
            Cart
          </li>
        </ol>
      </nav>

      <section className="web-width mx-auto px-6 py-12 md:py-16">
        <section className="mb-6 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
          <div className="flex items-center justify-between gap-4">
            <h1 className="ff-larken text-[32px] font-normal leading-tight text-(--color-body) md:text-[40px]">
              Items in cart
            </h1>
            {items.length > 0 && (
              <p className="shrink-0 text-right text-[12px] text-[#596366]">
                {items.length} {items.length === 1 ? "item" : "items"} / Total
                quantity {totalQuantity}
              </p>
            )}
          </div>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
          <section>
            {items.length > 0 ? (
              <div className="overflow-hidden rounded-[5px] border border-[#DED8CF]">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} items={items} />
                ))}
              </div>
            ) : (
              <div className="rounded-[4px] border border-dashed border-[#C7C0B6] bg-white p-8 text-center">
                <p className="text-[16px] text-(--color-body)">
                  Your quotation cart is empty.
                </p>
                <Link
                  href={langHref("/webshop", lang)}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-(--color-body) bg-(--color-body) px-8 text-[13px] text-white transition hover:bg-black"
                >
                  Continue shopping
                </Link>
              </div>
            )}
            {items.length > 0 && (
              <Link
                href={langHref("/webshop", lang)}
                className="group mt-5 ml-auto flex w-fit items-center gap-1.5 whitespace-nowrap text-[12px] text-[#596366]"
              >
                <span className="border-b border-[#596366] leading-5">
                  Continue shopping
                </span>
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            )}
          </section>

          <section className="rounded-[5px] bg-[#183034] p-7 md:p-10 lg:mt-0">
            <h2 className="ff-larken mb-10 text-[28px] font-normal leading-tight text-white">
              Contact us at Panea
            </h2>

            <form className="space-y-5" onSubmit={submitRequest}>
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" required />
              <Field label="Company" name="company" />
              <Field label="Message" name="message" textarea />

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 min-h-11 cursor-pointer rounded-full bg-white px-8 text-[13px] text-[#183034] transition hover:bg-[#F3EDE5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Request a quote"}
              </button>

              {submitMessage && (
                <p className="text-[13px] leading-5 text-white">
                  {submitMessage}
                </p>
              )}
              {submitError && (
                <p className="text-[13px] leading-5 text-red-700">
                  {submitError}
                </p>
              )}
            </form>
          </section>
        </div>
      </section>
      <RelatedProducts
        product={page}
        products={relatedProducts}
        lang={lang}
        randomLimit={12}
      />
      <WebshopHighlightBanner
        data={highlightBanner}
        paddingTopClass="pt-[60px] pb-[120px]"
      />  
    </main>
  );
}
