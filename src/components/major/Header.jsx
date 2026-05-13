// src/components/major/Header.jsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ArrowSvg from "../../../public/right-arrow.svg";
import DownSvg from "../../../public/down-arrow.svg";
import ArrowSvgB from "../../../public/right-arrow-black.png";
import { getMenu, getThemeOptions, getEntryTranslations } from "@/lib/api";
import { DEFAULT_LANG, SUPPORTED_LANGS, langHref, langHome } from "@/config";

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
  const [altLangUrl, setAltLangUrl] = useState(langHome(SUPPORTED_LANGS.filter((l) => l !== lang)[0]));
  const [scrolled, setScrolled] = useState(false);
  const isLoading = !menu;

  // Only fetch client-side if no prefetched data was provided
  useEffect(() => {
    if (prefetchedMenu) return;
    async function loadData() {
      try {
        const [menuData, themeOptions] = await Promise.all([
          getMenu(lang),
          getThemeOptions(lang),
        ]);
        setMenu(menuData);
        setOptions(themeOptions?.header || {});
      } catch {
        setMenu([]);
        setOptions({});
      }
    }
    loadData();
  }, [lang, prefetchedMenu]);

  // scroll listener for sticky animation
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Sticky header classes
 const headerClasses = scrolled
  ? "sticky top-0 w-full z-50 text-black transition-all duration-300 py-4 bg-white shadow-sm"
  : "sticky top-0 w-full z-50 text-white transition-all duration-300 py-4 ";

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

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
    async function fetchAltLangUrl() {
      try {
        const altLang = SUPPORTED_LANGS.filter((l) => l !== lang)[0];

        // Use entryId for dynamic translation lookup if available
        if (entryId) {
          const translations = await getEntryTranslations(entryId, entryType, lang);

          if (translations && translations[altLang]?.slug) {
            const translatedSlug = translations[altLang].slug;
            // "frontpage" is the WP homepage slug — map it to the lang root
            if (translatedSlug === "frontpage") {
              setAltLangUrl(langHome(altLang));
              return;
            }
            const prefix = pathPrefix ? `/${pathPrefix}` : "";
            const langPrefix = altLang === DEFAULT_LANG ? "" : `/${altLang}`;
            setAltLangUrl(`${langPrefix}${prefix}/${translatedSlug}`);
            return;
          }
        }

        // Fallback: if no entryId or translation not found, go to homepage
        setAltLangUrl(langHome(altLang));

      } catch (error) {
        setAltLangUrl(langHome(SUPPORTED_LANGS.filter((l) => l !== lang)[0]));
      }
    }

    if (entryId || (currentSlug && currentSlug !== "/")) {
      fetchAltLangUrl();
    }
  }, [lang, currentSlug, entryType, pathPrefix, entryId]);

  return (
    <header className={headerClasses}>
      <div className="web-width mx-auto px-6 flex items-center justify-between relative">
        {/* LOGO */}
        <Link
          href={langHome(lang)}
          className="flex relative h-8 w-[100px] md:h-10 md:w-[100px]"
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
                height={16}
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
            className="px-8 py-4 flex items-center gap-8 lg:absolute lg:left-[100px]
            "
          >
            <ul className="flex items-center gap-9 relative">
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
                menu.main.map((item) => (
                  <li key={item.id} className="relative group">
                    <Link
                      href={langHref(item.url, lang)}
                      prefetch={true}
                      className={`
                            ${scrolled ? "text-[#1E2E31] hover:text-black" : "text-[#1E2E31] hover:text-[#1E2E31]"} relative z-9 text-[15px] transition leading-[18px] flex items-center gap-2`}
                    >
                      {item.title}

                      {item.children?.length > 0 && (
                        <span className="transition-transform duration-300 group-hover:rotate-180">
                          <Image
                            src={DownSvg}
                            alt="arrow"
                            width={10}
                            height={10}
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
                            transition-all duration-300 ease-out bg-white text-black rounded-sm shadow-lg overflow-hidden
                          "
                        >
                          {item.children.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={langHref(sub.url, lang)}
                                prefetch={true}
                                className="
                                    block px-4 py-3 text-black text-sm
                                    hover:text-black transition
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
                ))
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
                            ${scrolled ? " text-black hover:text-black/95 " : ""} flex items-center gap-2 cursor-pointer px-4 py-4 rounded-sm text-sm leading-3.5
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
                  width={10}
                  height={10}
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
                  className="block px-4 py-3 text-sm text-black bg-white  hover:text-black/95 transition"
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
            <Link
              href={
                langHref(options.button_url, lang)
              }
              className="gap-3 group relative inline-flex items-center select-none
                    rounded-[50px] px-6 py-4 text-white
                    transition-all duration-300
                    w-[150px] overflow-hidden
                    bg-(--color-brand)"
            >

              {/* TEXT (slides left on hover) */}
              <span
                className="
                      flex-1 text-[16px] leading-none text-white
                      transition-all duration-300 ease-out
                      group-hover:-translate-x-4
                      whitespace-nowrap"
              >
                {options.button_text}
              </span>

              {/* RIGHT SLOT (arrow area, fixed width) */}
              <span className="relative w-4 flex items-center justify-center">
                <span
                  className="
                        w-4 absolute text-[16px]
                        opacity-0 -translate-x-4
                        transition-all duration-300 ease-out
                        group-hover:opacity-100 group-hover:-translate-x-2
                      "
                >
                  <Image src={ArrowSvg} alt="arrow" width={13} height={13} />
                </span>
              </span>
            </Link>
          )}
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          className={`lg:hidden text-3xl transition-colors ${
            scrolled ? "text-black" : "text-white"
          }`}
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
        {/* MOBILE SLIDE-IN MENU */}
        {mobileOpen && (
          <div className="fixed h-[100vh] inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => { setMobileOpen(false); setOpenSubmenu(null); }}>
            <div className="absolute right-0 top-0 h-full w-72 bg-(--color-brand) shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* HEADER */}
              <div className="p-6 flex items-center justify-between">
                <span className="text-white font-semibold">Menu</span>
                <button
                  className="text-white text-3xl"
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
                  className={`absolute inset-0 flex flex-col gap-5 transition-transform duration-300 ${
                    openSubmenu ? "-translate-x-full" : "translate-x-0"
                  }`}
                >
                  {menu?.main?.map((item) => {
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
                          className="text-white text-lg px-6"
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
                {menu?.main?.map((item) => {
                  if (openSubmenu !== item.id) return null;

                  return (
                    <div
                      key={`submenu-${item.id}`}
                      className="absolute inset-0 flex flex-col gap-5 transition-transform duration-300 translate-x-0 px-6"
                    >
                      {/* Back */}
                      <button
                        className="text-white/80 text-sm flex items-center gap-2"
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
                        className="text-white text-lg font-semibold"
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
                            className="text-white/80 text-base hover:text-white transition"
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
                  className="text-white/80 mb-4"
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
                      rounded-sm bg-(--color-accent) px-6 py-4 text-white
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
                      className="text-black
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
    </header>
  );
}
