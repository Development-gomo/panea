// src/lib/quoteCart.js
//
// Shared "request a quote" cart storage — reads/writes a localStorage list
// and broadcasts changes so every mounted component (header mini-cart,
// product pages, category listings, the cart page itself) stays in sync.
//
// This used to be copy-pasted verbatim into six different components. Kept
// as one module so a future change (key rename, serialization change) only
// has to happen in one place instead of risking the copies drifting apart.

export const QUOTE_CART_STORAGE_KEY = "panea_quote_cart";
export const QUOTE_CART_UPDATED_EVENT = "panea:quote-cart-updated";

export function parseQuoteCartItems(value) {
  try {
    const items = JSON.parse(value || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function subscribeQuoteCart(callback) {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => callback();
  window.addEventListener(QUOTE_CART_UPDATED_EVENT, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(QUOTE_CART_UPDATED_EVENT, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}

export function getQuoteCartSnapshot() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(QUOTE_CART_STORAGE_KEY) || "[]";
}

export function getServerQuoteCartSnapshot() {
  return "[]";
}

export function getQuoteCartItems() {
  return parseQuoteCartItems(getQuoteCartSnapshot());
}

export function saveQuoteCartItems(items) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(
    new CustomEvent(QUOTE_CART_UPDATED_EVENT, { detail: { items } })
  );
}
