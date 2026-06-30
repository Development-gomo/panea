"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_LANG, langHref } from "@/config";

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

function Field({ label, name, type = "text", required = false, textarea = false }) {
  const inputClass =
    "mt-2 w-full rounded-[4px] border border-[#C7C0B6] bg-white px-4 py-3 text-[14px] text-(--color-body) outline-none transition focus:border-(--color-body)";

  return (
    <label className="block text-[12px] font-semibold leading-none text-(--color-body)">
      {label}
      {required ? " *" : ""}
      {textarea ? (
        <textarea name={name} className={`${inputClass} min-h-[122px] resize-y`} />
      ) : (
        <input name={name} type={type} className={inputClass} />
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
    <article className="grid gap-4 rounded-[4px] border border-[#C7C0B6] bg-white p-4 sm:grid-cols-[74px_minmax(0,1fr)_auto]">
      <div className="relative h-[74px] w-[74px] overflow-hidden rounded-[4px] border border-[#C7C0B6] bg-[#F8F4EE]">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.productName || "Product image"}
            fill
            sizes="74px"
            className="object-contain p-2"
          />
        )}
      </div>

      <div className="min-w-0">
        <h3 className="mb-2 text-[18px] font-normal leading-tight text-(--color-body)">
          {item.productName || "Product"}
        </h3>

        {item.model && (
          <p className="mb-2 text-[12px] leading-none text-(--color-body)">
            Model: {item.model}
          </p>
        )}

        {item.articleNumber && (
          <p className="mb-4 text-[12px] leading-none text-[#596366]">
            Article: {item.articleNumber}
          </p>
        )}

        <div className="flex items-center gap-3">
          <span className="text-[12px] leading-none text-[#596366]">Quantity</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity - 1)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#C7C0B6] bg-[#F8F4EE] text-[16px] text-(--color-body) transition hover:border-(--color-body) hover:bg-(--color-body) hover:text-white"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="h-8 w-[66px] rounded-[4px] border border-[#C7C0B6] bg-white px-3 text-[13px] text-(--color-body) outline-none focus:border-(--color-body)"
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#C7C0B6] bg-[#F8F4EE] text-[16px] text-(--color-body) transition hover:border-(--color-body) hover:bg-(--color-body) hover:text-white"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={removeItem}
        className="cursor-pointer self-start justify-self-start border-b border-[#596366] text-[12px] leading-none text-[#596366] transition hover:border-(--color-body) hover:text-(--color-body) sm:justify-self-end"
      >
        Remove
      </button>
    </article>
  );
}

export default function QuoteCartPage({ lang = DEFAULT_LANG }) {
  const quoteCartSnapshot = useSyncExternalStore(
    subscribeQuoteCart,
    getQuoteCartSnapshot,
    getServerQuoteCartSnapshot
  );
  const [submitMessage, setSubmitMessage] = useState("");
  const items = useMemo(
    () => parseQuoteCartItems(quoteCartSnapshot),
    [quoteCartSnapshot]
  );
  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  const clearCart = () => {
    saveQuoteCartItems([]);
  };

  const submitRequest = (event) => {
    event.preventDefault();
    setSubmitMessage(
      items.length
        ? "Thank you. Your quote request has been prepared."
        : "Please add at least one product before submitting."
    );
  };

  return (
    <main className="bg-(--color-brand)">
      <section className="web-width mx-auto px-6 py-12 md:py-16">
        <h1 className="ff-larken mb-8 text-[44px] font-normal leading-none tracking-normal text-(--color-body) md:text-[54px]">
          Request a <span className="text-(--color-body)">quote</span>
        </h1>

        <div className="grid overflow-hidden rounded-[4px] border border-[#C7C0B6] bg-white lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
          <section className="min-h-[560px] bg-[#F8F4EE] p-7 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[24px] font-normal leading-tight text-(--color-body)">
                  Quotation cart
                </h2>
                {items.length > 0 && (
                  <p className="mt-2 text-[12px] text-[#596366]">
                    {items.length} {items.length === 1 ? "item" : "items"} /{" "}
                    {totalQuantity} total
                  </p>
                )}
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="cursor-pointer border-b border-[#596366] text-[12px] leading-none text-[#596366] transition hover:border-(--color-body) hover:text-(--color-body)"
                >
                  Clear cart
                </button>
              )}
            </div>

            {items.length > 0 ? (
              <div className="space-y-4">
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
          </section>

          <section className="border-t border-[#C7C0B6] bg-[#B8D9DB] p-7 md:border-l md:border-t-0 md:p-8">
            <h2 className="text-(--color-body) mb-3 text-[24px] font-normal leading-tight">
              Contact details
            </h2>
            <p className="mb-7 max-w-[390px] text-[12px] leading-5 text-(--color-body)">
              Send us your selected products and contact details. We will review
              the request and get back to you.
            </p>

            <form className="space-y-5" onSubmit={submitRequest}>
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" required />
              <Field label="Company" name="company" />
              <Field label="Message" name="message" textarea />

              <button
                type="submit"
                className="mt-1 min-h-11 cursor-pointer rounded-full border border-(--color-body) bg-(--color-body) px-8 text-[13px] text-white transition hover:bg-black"
              >
                Submit quote request
              </button>

              {submitMessage && (
                <p className="text-[13px] leading-5 text-(--color-body)">
                  {submitMessage}
                </p>
              )}
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
