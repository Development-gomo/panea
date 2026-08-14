// src/components/major/Header.jsx

"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ArrowSvg from "../../../public/right-arrow.svg";
import DownSvg from "../../../public/down-arrow.svg";
import ArrowSvgB from "../../../public/right-arrow-black.png";
import CartSvg from "../../../public/cart-icon.svg";
import MegaMenu from "./MegaMenu";
import { getMenu, getThemeOptions, getEntryTranslations } from "@/lib/api";
import { DEFAULT_LANG, SUPPORTED_LANGS, langHref, langHome } from "@/config";
import {
  QUOTE_CART_UPDATED_EVENT,
  getQuoteCartItems,
  saveQuoteCartItems,
} from "@/lib/quoteCart";

function getMenuItemKey(item) {
  const rawUrl = typeof item?.url === "string" ? item.url.trim() : "";
  const titleKey = String(item?.title || "").trim().toLocaleLowerCase();

  // WordPress menu headings commonly share a non-navigable placeholder URL.
  // They are distinct items and must be compared by title instead.
  if (!rawUrl || rawUrl === "#" || /^javascript:/i.test(rawUrl)) {
    return `title:${titleKey}`;
  }

  try {
    const url = new URL(rawUrl, "https://panea.local");
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return `url:${pathname}${url.search}${url.hash}`;
  } catch {
    return `url:${rawUrl.replace(/\/+$/, "")}`;
  }
}

function mergeMenuItems(...sources) {
  const merged = [];
  const indexByKey = new Map();

  sources.flat().forEach((item) => {
    if (!item) return;

    const key = getMenuItemKey(item);
    const existingIndex = indexByKey.get(key);

    if (existingIndex === undefined) {
      indexByKey.set(key, merged.length);
      merged.push({
        ...item,
        children: mergeMenuItems(item.children || []),
      });
      return;
    }

    const existing = merged[existingIndex];
    merged[existingIndex] = {
      ...existing,
      children: mergeMenuItems(existing.children || [], item.children || []),
    };
  });

  return merged;
}

function getFixedLocalizedRoute(slug, lang) {
  if (slug === "cart") return langHref("/cart", lang);
  if (slug === "cases") return langHref("/cases", lang);
  if (["artiklar", "article"].includes(slug)) {
    return lang === DEFAULT_LANG ? "/artiklar" : `/${lang}/article`;
  }
  if (["karriar", "career"].includes(slug)) {
    return lang === DEFAULT_LANG ? "/karriar" : `/${lang}/career`;
  }
  if (["webbshop", "webshop"].includes(slug)) {
    return lang === DEFAULT_LANG ? "/webbshop" : `/${lang}/webshop`;
  }

  return "";
}

function CartIcon() {
  return (
    <Image
      src={CartSvg}
      alt=""
      width="25"
      height="25"
      aria-hidden="true"
      className="block shrink-0"
    />
  );
}

function HamburgerIcon() {
  return (
    <svg
      width="28"
      height="18"
      viewBox="0 0 28 18"
      fill="none"
      aria-hidden="true"
      className="block max-w-none shrink-0"
    >
      <rect x="0" y="1" width="18" height="2" rx="1" fill="#1E2E31" />
      <rect x="0" y="8" width="28" height="2" rx="1" fill="#1E2E31" />
      <rect x="0" y="15" width="18" height="2" rx="1" fill="#1E2E31" />
    </svg>
  );
}

function MiniCart({ items, lang, onRemove }) {
  const totalQuantity = items.reduce(
    (total, item) => total + Number(item?.quantity || 1),
    0
  );

  if (!items.length) return null;

  return (
    <div className="absolute right-[-18px] top-[calc(100%+10px)] z-[70] w-[calc(100vw-32px)] max-w-[460px] overflow-hidden rounded-[4px] border border-[#C7C0B6] bg-white text-(--color-body) shadow-[0_8px_28px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between bg-[#D2C4B2] px-6 py-3">
        <h2 className="ff-larken text-[22px] font-normal leading-none">
          {lang === "sv" ? "Din varukorg" : "Your Cart"}
        </h2>
        <span className="text-[14px] leading-none">
          (
          {totalQuantity}{" "}
          {lang === "sv"
            ? totalQuantity === 1
              ? "Objekt valt"
              : "Objekt valda"
            : totalQuantity === 1
              ? "Item selected"
              : "Items selected"}
          )
        </span>
      </div>

      <div className="px-6 pb-5 pt-5">
        <div className="max-h-[250px] overflow-y-auto pr-1">
          {items.map((item, index) => (
            <article
              key={item.id || `${item.productName}-${index}`}
              className={`grid grid-cols-[74px_minmax(0,1fr)_28px] gap-4 py-4 ${
                index > 0 ? "border-t border-dashed border-[#C7C0B6]" : "pt-0"
              }`}
            >
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
                <h3 className="truncate text-[18px] font-normal leading-tight text-(--color-body)">
                  {item.productName || "Product"}
                </h3>
                {item.model && (
                  <p className="mt-1 text-[12px] leading-5 text-[#596366]">
                    {lang === "sv" ? "Modell" : "Model"}: {item.model}
                  </p>
                )}
                {item.articleNumber && (
                  <p className="text-[12px] leading-5 text-[#596366]">
                    {lang === "sv" ? "Artikel" : "Article"}:{" "}
                    {item.articleNumber}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#C7C0B6] bg-[#F8F4EE] text-[18px] leading-none text-(--color-body) transition hover:border-(--color-body) hover:bg-(--color-body) hover:text-white"
                aria-label={`${lang === "sv" ? "Ta bort" : "Remove"} ${
                  item.productName || (lang === "sv" ? "produkt" : "product")
                }`}
              >
                &times;
              </button>
            </article>
          ))}
        </div>

        <Link
          href={langHref("/cart", lang)}
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-full border border-(--color-body) bg-(--color-body) px-8 text-[13px] leading-none text-white transition hover:bg-black"
        >
          {lang === "sv"
            ? "Visa varukorgen för att fortsätta"
            : "View cart to proceed"}
        </Link>
      </div>
    </div>
  );
}

export default function Header({
  lang = DEFAULT_LANG,
  currentSlug = "",
  entryType = "page",
  pathPrefix = "",
  entryId = null,
  prefetchedMenu = null,
  prefetchedOptions = null,
  logoUrl = "",
}) {
  const [menu, setMenu] = useState(prefetchedMenu);
  const [options, setOptions] = useState(prefetchedOptions);
  const [socialMedia, setSocialMedia] = useState([]);
  const [altLangUrl, setAltLangUrl] = useState(langHome(SUPPORTED_LANGS.filter((l) => l !== lang)[0]));
  const [scrolled, setScrolled] = useState(false);
  const [quoteCartCount, setQuoteCartCount] = useState(0);
  const [quoteCartItems, setQuoteCartItems] = useState([]);
  const [quoteCartHydrated, setQuoteCartHydrated] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [emptyCartMessageOpen, setEmptyCartMessageOpen] = useState(false);
  const miniCartTimerRef = useRef(null);
  const previousQuoteCartCountRef = useRef(0);
  const hasLoadedQuoteCartRef = useRef(false);
  const isLoading = !menu;
  const mainMenu = useMemo(
    () => (Array.isArray(menu?.main) ? menu.main : []),
    [menu]
  );
  const megaMenu = useMemo(
    () => (Array.isArray(menu?.mega_menu) ? menu.mega_menu : []),
    [menu]
  );
  const mobileMenu = useMemo(
    () => mergeMenuItems(mainMenu, megaMenu),
    [mainMenu, megaMenu]
  );

  // Only fetch client-side if no prefetched data was provided
  useEffect(() => {
    if (prefetchedMenu) return;
    let cancelled = false;

    async function loadData() {
      try {
        const [menuData, themeOptions] = await Promise.all([
          getMenu(lang),
          getThemeOptions(lang),
        ]);
        if (cancelled) return;
        setMenu(menuData);
        setOptions(themeOptions?.header || {});
      } catch {
        if (cancelled) return;
        setMenu({ main: [] });
        setOptions({});
      }
    }
    loadData();

    return () => {
      cancelled = true;
    };
  }, [lang, prefetchedMenu]);

  useEffect(() => {
    let cancelled = false;

    async function loadSocialMedia() {
      try {
        const themeOptions = await getThemeOptions(lang);
        const rows = themeOptions?.footer?.footer_column_5?.social_media;

        if (!cancelled) {
          setSocialMedia(Array.isArray(rows) ? rows : []);
        }
      } catch {
        if (!cancelled) setSocialMedia([]);
      }
    }

    loadSocialMedia();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  // scroll listener for sticky animation
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const showMiniCart = () => {
      window.clearTimeout(miniCartTimerRef.current);
      setMiniCartOpen(true);
      setEmptyCartMessageOpen(false);
      miniCartTimerRef.current = window.setTimeout(() => {
        setMiniCartOpen(false);
      }, 5000);
    };

    const updateQuoteCart = () => {
      const items = getQuoteCartItems();
      const nextCount = items.reduce(
        (total, item) => total + Number(item?.quantity || 1),
        0
      );

      setQuoteCartItems(items);
      setQuoteCartCount(nextCount);
      setQuoteCartHydrated(true);

      if (hasLoadedQuoteCartRef.current && nextCount > previousQuoteCartCountRef.current) {
        showMiniCart();
      }

      if (nextCount === 0) {
        setMiniCartOpen(false);
      }

      previousQuoteCartCountRef.current = nextCount;
      hasLoadedQuoteCartRef.current = true;
    };

    updateQuoteCart();
    window.addEventListener(QUOTE_CART_UPDATED_EVENT, updateQuoteCart);
    window.addEventListener("storage", updateQuoteCart);

    return () => {
      window.clearTimeout(miniCartTimerRef.current);
      window.removeEventListener(QUOTE_CART_UPDATED_EVENT, updateQuoteCart);
      window.removeEventListener("storage", updateQuoteCart);
    };
  }, []);

  const showEmptyCartMessage = () => {
    setMiniCartOpen(false);
    setEmptyCartMessageOpen(true);
  };

  const showMiniCartOnHover = () => {
    if (!quoteCartHydrated || quoteCartCount <= 0) return;
    window.clearTimeout(miniCartTimerRef.current);
    setEmptyCartMessageOpen(false);
    setMiniCartOpen(true);
  };

  const handleCartIconClick = () => {
    if (quoteCartHydrated && quoteCartCount > 0) {
      window.location.href = langHref("/cart", lang);
      return;
    }

    showEmptyCartMessage();
  };

  const removeMiniCartItem = (itemId) => {
    if (!itemId) return;
    saveQuoteCartItems(quoteCartItems.filter((item) => item.id !== itemId));
  };

  // Sticky header classes
 const headerClasses = scrolled
  ? "sticky top-0 w-full z-50 text-(--color-body) transition-all duration-300 py-4 bg-[#F2EBE2] shadow-sm"
  : "sticky top-0 w-full z-50 text-(--color-body) transition-all duration-300 py-4 ";

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const closeMegaMenu = useCallback(() => setMegaMenuOpen(false), []);

  const [langOpen, setLangOpen] = useState(false);
  const langRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAltLangUrl() {
      try {
        const altLang = SUPPORTED_LANGS.filter((l) => l !== lang)[0];
        const fixedRoute = getFixedLocalizedRoute(currentSlug, altLang);
        const fallbackUrl = fixedRoute
          ? fixedRoute
          : langHome(altLang);

        // Use entryId for dynamic translation lookup if available
        if (entryId && !fixedRoute) {
          const translations = await getEntryTranslations(entryId, entryType, lang);
          if (cancelled) return;

          if (translations && translations[altLang]?.slug) {
            const translatedSlug = translations[altLang].slug;
            // "frontpage" is the WP homepage slug — map it to the lang root
            if (translatedSlug === "frontpage") {
              setAltLangUrl(langHome(altLang));
              return;
            }
            const resolvedPathPrefix =
              typeof pathPrefix === "object"
                ? pathPrefix?.[altLang] || ""
                : pathPrefix;
            const prefix = resolvedPathPrefix ? `/${resolvedPathPrefix}` : "";
            const langPrefix = altLang === DEFAULT_LANG ? "" : `/${altLang}`;
            setAltLangUrl(`${langPrefix}${prefix}/${translatedSlug}`);
            return;
          }
        }

        // Fallback: keep known utility routes on the same route, otherwise go home.
        setAltLangUrl(fallbackUrl);

      } catch (error) {
        if (cancelled) return;
        const altLang = SUPPORTED_LANGS.filter((l) => l !== lang)[0];
        const fixedRoute = getFixedLocalizedRoute(currentSlug, altLang);
        setAltLangUrl(fixedRoute || langHome(altLang));
      }
    }

    if (entryId || (currentSlug && currentSlug !== "/")) {
      fetchAltLangUrl();
    }

    return () => {
      cancelled = true;
    };
  }, [lang, currentSlug, entryType, pathPrefix, entryId]);

  return (
    <header className={headerClasses}>
      <div className="web-width mx-auto px-6 flex items-center justify-between relative">
        {/* LOGO */}
        <Link
          href={langHome(lang)}
          className="flex relative h-12 md:h-12"
        >
          {(() => {
            const lightLogo = logoUrl || options?.logo_light?.url;
            const darkLogo = options?.logo_dark?.url;
            const activeLogo = scrolled ? (darkLogo || lightLogo) : (lightLogo || darkLogo);

            if (!activeLogo) return null;

            return (
              <Image
                src={activeLogo}
                alt="panea Logo"
                width={37}
                height={48}
                className="object-contain"
                priority
              />
            );
          })()}
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden lg:flex items-center gap-4 ">
          {/* Centered glass menu wrapper */}
          <div
            className="px-10 py-4 flex items-center gap-8 lg:absolute lg:left-[62px]
            "
          >
            <ul className="flex items-center gap-6 relative">
              {isLoading ? (
                // SKELETON MENU (no jump)
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li
                      key={"sk-" + i}
                      className="w-20 h-[18px] rounded-full bg-white/30 animate-pulse"
                    />
                  ))}
                </>
              ) : (
                // REAL MENU
                <>
                  {mainMenu.map((item) => (
                    <li key={item.id} className="relative group">
                      <Link
                        href={langHref(item.url, lang)}
                        prefetch={true}
                        className={`
                              ${scrolled ? "text-(--color-body) hover:text-(--color-body)" : "text-(--color-body) hover:text-(--color-body)"} relative z-9 text-[15px] transition leading-[18px] flex items-center gap-2`}
                      >
                        {item.title}

                        {item.children?.length > 0 && (
                          <span className="transition-transform duration-300 group-hover:rotate-180">
                            <Image
                              src={DownSvg}
                              alt="arrow"
                              width={22}
                              height={22}
                              className={scrolled ? "brightness-0" : ""}
                            />
                          </span>
                        )}
                      </Link>

                      {/* SUBMENU */}
                      {item.children?.length > 0 && (
                        <div
                          className={`
                              ${scrolled ? "top-[15px]" : "top-0" }
                              absolute left-1/2  mt-1
                              -translate-x-1/2 min-w-[180px]
                              pt-8
                              pointer-events-none
                              group-hover:pointer-events-auto
                           z-2
                            `}
                        >
                          <ul className="
                              opacity-0 translate-x-4
                              group-hover:opacity-100 group-hover:translate-x-0
                              transition-all duration-300 ease-out bg-white text-(--color-body) rounded-sm shadow-lg overflow-hidden
                            "
                          >
                            {item.children.map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  href={langHref(sub.url, lang)}
                                  prefetch={true}
                                  className="
                                      block px-4 py-3 text-(--color-body) text-sm
                                      hover:text-(--color-body) transition
                                    "
                                >
                                  {sub.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* Language Switcher */}
          <div ref={langRef} className="relative">
            {/* Trigger */}
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className={`
                            ${scrolled ? " text-(--color-body) hover:text-(--color-body)/95 " : ""} flex items-center gap-2 cursor-pointer px-0 py-4 rounded-sm text-sm leading-3.5
            transition`}>
              <span>{lang.toUpperCase()}</span>

              {/* Arrow */}
              <span
                className={`transition-transform duration-300 ${
                  langOpen ? "rotate-180" : ""
                }`}
              >
                <Image
                  src={DownSvg}
                  alt="arrow"
                  width={22}
                  height={22}
                  className={scrolled ? "brightness-0" : ""}
                />
              </span>
            </button>

            {/* Dropdown */}
            {langOpen && (
              <div
                className="absolute right-0 mt-2 min-w-full rounded-sm border border-[#FFFFFF33] shadow-lg overflow-hidden z-50"
              >
                <Link
                  href={altLangUrl}
                  onClick={() => setLangOpen(false)}
                  className="block px-4 py-3 text-sm text-(--color-body) bg-white  hover:text-(--color-body)/95 transition"
                >
                  {SUPPORTED_LANGS.filter((l) => l !== lang)[0].toUpperCase()}
                </Link>
              </div>
            )}
          </div>

          {/* CTA BUTTON */}
          {!options?.button_text || !options?.button_url ? (
            // SKELETON PLACEHOLDER (prevents jump)
            <div className="w-[135px] h-[42px] rounded-sm bg-white/20 animate-pulse"></div>
          ) : (
            <>
              <Link
                href={langHref(options.button_url, lang)}
                className="inline-flex items-center justify-center
                      rounded-[50px] px-8 py-4 text-(--color-white)
                      bg-(--color-body)"
              >
                <span className="text-[16px] leading-none text-(--color-white) whitespace-nowrap">
                  {options.button_text}
                </span>
              </Link>

              <div
                className="relative"
                onMouseLeave={() => {
                  setMiniCartOpen(false);
                  setEmptyCartMessageOpen(false);
                }}
              >
                <button
                  type="button"
                  onClick={handleCartIconClick}
                  onMouseEnter={
                    quoteCartHydrated && quoteCartCount > 0
                      ? showMiniCartOnHover
                      : showEmptyCartMessage
                  }
                  className="relative inline-flex h-[27px] w-[25px] cursor-pointer items-start justify-center pt-[2px] text-(--color-body)"
                  aria-label="Cart"
                >
                  <CartIcon />
                  {quoteCartHydrated && quoteCartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1E2E31] px-1 text-[10px] leading-none text-white">
                      {quoteCartCount}
                    </span>
                  )}
                </button>

                {quoteCartHydrated && miniCartOpen && quoteCartItems.length > 0 && (
                  <MiniCart
                    items={quoteCartItems}
                    lang={lang}
                    onRemove={removeMiniCartItem}
                  />
                )}

                {emptyCartMessageOpen && (
                  <div className="absolute right-0 top-[calc(100%+18px)] z-[70] w-[260px] rounded-[12px] bg-[#F7F7F7] px-5 py-4 text-center text-[14px] font-semibold text-[#111] shadow-[0_8px_28px_rgba(0,0,0,0.18)]">
                    {lang === "sv"
                      ? "Ingen produkt tillgänglig"
                      : "No product available"}
                  </div>
                )}
              </div>

              {/* Desktop hamburger matching other icons */}
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={megaMenuOpen}
                disabled={megaMenu.length === 0}
                onClick={() => {
                  if (megaMenu.length > 0) setMegaMenuOpen(true);
                }}
                className="inline-flex h-[25px] w-[25px] cursor-pointer items-center justify-center text-(--color-body)"
              >
                <HamburgerIcon />
              </button>
            </>
          )}
        </nav>

        {/* MOBILE ACTIONS */}
        <div className="flex items-center gap-5 lg:hidden">
          <div className="relative">
            <button
              type="button"
              onClick={handleCartIconClick}
              className="relative inline-flex h-[27px] w-[25px] cursor-pointer items-start justify-center pt-[2px] text-(--color-body)"
              aria-label={lang === "sv" ? "Varukorg" : "Cart"}
            >
              <CartIcon />
              {quoteCartHydrated && quoteCartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1E2E31] px-1 text-[10px] leading-none text-white">
                  {quoteCartCount}
                </span>
              )}
            </button>

            {emptyCartMessageOpen && (
              <div className="absolute right-0 top-[calc(100%+18px)] z-[70] w-[260px] rounded-[12px] bg-[#F7F7F7] px-5 py-4 text-center text-[14px] font-semibold text-[#111] shadow-[0_8px_28px_rgba(0,0,0,0.18)]">
                {lang === "sv"
                  ? "Ingen produkt tillgänglig"
                  : "No product available"}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className={`cursor-pointer text-3xl transition-colors ${
              scrolled ? "text-(--color-body)" : "text-(--color-body)"
            }`}
            onClick={() => {
              setEmptyCartMessageOpen(false);
              setMobileOpen(true);
            }}
          >
            <HamburgerIcon />
          </button>
        </div>
        {/* MOBILE SLIDE-IN MENU */}
        {mobileOpen && (
          <div className="fixed h-[100vh] inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => { setMobileOpen(false); setOpenSubmenu(null); }}>
            <div className="absolute right-0 top-0 h-full w-72 bg-(--color-brand) shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* HEADER */}
              <div className="p-6 flex items-center justify-between">
                <span className="text-(--color-body) font-semibold">Menu</span>
                <button
                  className="text-(--color-body) text-3xl"
                  onClick={() => {
                    setMobileOpen(false);
                    setOpenSubmenu(null);
                  }}
                >
                  ✕
                </button>
              </div>

              {/* CONTENT (SLIDING PANELS) */}
              <div className="relative flex-1 overflow-hidden px-6">
                {/* MAIN MENU PANEL */}
                <div
                  className={`absolute inset-0 flex flex-col gap-5 overflow-y-auto pb-6 transition-transform duration-300 ${
                    openSubmenu ? "-translate-x-full" : "translate-x-0"
                  }`}
                >
                  {mobileMenu.map((item) => {
                    const hasChildren = item.children?.length > 0;

                    const parentHref = langHref(item.url, lang);

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        {/* Parent link */}
                        <Link
                          href={parentHref}
                          prefetch={true}
                          className="text-(--color-body) text-lg px-6"
                          onClick={() => {
                            setMobileOpen(false);
                            setOpenSubmenu(null);
                          }}
                        >
                          {item.title}
                        </Link>

                        {/* Arrow → open submenu */}
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => setOpenSubmenu(item.id)}
                            className="mr-6"
                          >
                            <Image
                              src={DownSvg}
                              alt="arrow"
                              width={16}
                              height={16}
                              className="-rotate-90"
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* SUBMENU PANEL */}
                {mobileMenu.map((item) => {
                  if (openSubmenu !== item.id) return null;

                  return (
                    <div
                      key={`submenu-${item.id}`}
                      className="absolute inset-0 flex flex-col gap-5 overflow-y-auto pb-6 transition-transform duration-300 translate-x-0 px-6"
                    >
                      {/* Back */}
                      <button
                        className="text-(--color-body)/80 text-sm flex items-center gap-2"
                        onClick={() => setOpenSubmenu(null)}
                      >
                        <Image
                          src={DownSvg}
                          alt="arrow"
                          width={16}
                          height={16}
                          className="rotate-90"
                        />{" "}
                        Back
                      </button>

                      {/* Parent title */}
                      <Link
                        href={langHref(item.url, lang)}
                        className="text-(--color-body) text-lg font-semibold"
                        onClick={() => {
                          setMobileOpen(false);
                          setOpenSubmenu(null);
                        }}
                      >
                        {item.title}
                      </Link>

                      {/* Children */}
                      <div className="mt-2 flex flex-col gap-4">
                        {item.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={langHref(sub.url, lang)}
                            prefetch={true}
                            className="text-(--color-body)/80 text-base hover:text-(--color-body) transition"
                            onClick={() => {
                              setMobileOpen(false);
                              setOpenSubmenu(null);
                            }}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FOOTER (STATIC) */}
              <div className="p-6 border-t border-white/10 flex flex-col gap-4">
                {/* Language Switcher */}
                <Link
                  href={altLangUrl}
                  className="text-(--color-body)/80 mb-4"
                  onClick={() => {
                    setMobileOpen(false);
                    setOpenSubmenu(null);
                  }}
                >
                  {SUPPORTED_LANGS.filter((l) => l !== lang)[0].toUpperCase()}
                </Link>

                {/* CTA */}
                {options?.button_text && (
                  <Link
                    href={langHref(options.button_url, lang)}
                    className="gap-3 group relative inline-flex items-center
                      rounded-sm bg-(--color-accent) px-6 py-4 text-(--color-body)
                      transition-all duration-300 hover:bg-(--color-accent)
                      w-[154px] overflow-hidden select-none"
                    onClick={() => {
                      setMobileOpen(false);
                      setOpenSubmenu(null);
                    }}
                  >
                    <span className="relative w-6 flex items-center justify-center">
                      <span
                        className="
                            absolute h-2 w-2 rounded-full bg-[#191F68]
                            transition-all duration-300 ease-out
                            group-hover:opacity-0 group-hover:-translate-x-1
                          "
                      ></span>
                    </span>
                    <span
                      className="text-(--color-body)
                            flex-1 text-[16px] leading-none
                            transition-all duration-300 ease-out
                            group-hover:-translate-x-4
                            whitespace-nowrap"
                    >
                      {options.button_text}
                    </span>

                    <span className="relative w-4 flex items-center justify-center">
                      <span
                        className="
                              w-4 absolute opacity-0 -translate-x-4
                              transition-all duration-300 ease-out
                              group-hover:opacity-100 group-hover:-translate-x-2
                            "
                      >
                        <Image
                          src={ArrowSvgB}
                          width={13}
                          height={13}
                          alt="arrow"
                        />
                      </span>
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {megaMenu.length > 0 && (
        <MegaMenu
          items={megaMenu}
          socialMedia={socialMedia}
          lang={lang}
          open={megaMenuOpen}
          onClose={closeMegaMenu}
        />
      )}
    </header>
  );
}
