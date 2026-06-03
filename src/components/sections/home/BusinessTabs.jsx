// src/components/sections/home/BusinessTabs.jsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_LANG, langHref } from "@/config";
import RightArrow from "../../../../public/right-arrow.svg";
import PRightArrow from "../../../../public/p-right-arrow.svg";
import PExplore from "../../../../public/p-explore.svg";
import PExploreHover from "../../../../public/p-explore-hover.svg";
import LogoWhite from "../../../../public/logowhite.png";

const AUTO_ROTATE_DELAY = 5000;
const CTA_LABELS = {
  en: "Explore solutions",
  sv: "Utforska lösningar",
};

function getImageUrl(item) {
  return (
    item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    item?.acf?.featured_image?.url ||
    item?.acf?.image?.url ||
    item?.acf?.card_image?.url ||
    item?.image?.url ||
    item?.image?.sizes?.large ||
    item?.image_url ||
    null
  );
}

function decodeHtml(value = "") {
  return String(value)
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getTitle(item) {
  return decodeHtml(
    item?.title?.rendered ||
      item?.title ||
      item?.post_title ||
      item?.name ||
      ""
  );
}

function getDescription(item) {
  const description =
    item?.acf?.short_description ||
    item?.acf?.description ||
    item?.acf?.content ||
    item?.description ||
    item?.excerpt?.rendered ||
    item?.content?.rendered ||
    item?.content ||
    "";

  return typeof description === "string" ? description : "";
}

function getTags(item) {
  const tags =
    item?.acf?.select_solutions ||
    item?.acf?.tags ||
    item?.acf?.business_tags ||
    item?.acf?.labels ||
    item?.tags ||
    item?.tags_repeater ||
    [];
  return Array.isArray(tags) ? tags : [];
}

function getWebshopButton(item) {
  const button = item?.acf?.webshop_button || {};
  const text = decodeHtml(button?.cta_text || "");
  const url = button?.cta_url || "";

  return text && url ? { text, url } : null;
}

function getChipLabel(item) {
  return decodeHtml(
    item?.title?.rendered ||
      item?.title ||
      item?.post_title ||
      item?.label ||
      item?.name ||
      ""
  );
}

function normalizeItem(item) {
  return {
    ...item,
    title: getTitle(item),
    description: getDescription(item),
    image_url: getImageUrl(item),
    tags: getTags(item),
  };
}

function getItems(data, prefetchedBusinessAreas) {
  const groups = [prefetchedBusinessAreas, data.items, data.business_items, data.tabs];
  const rawItems =
    groups.find((group) => Array.isArray(group) && group.length > 0) || [];

  return rawItems.map(normalizeItem).filter((item) => item.title);
}

function ExploreIcon() {
  return (
    <span className="relative h-[14px] w-[14px] shrink-0 transition-transform duration-300 group-hover/cta:translate-x-1">
      <Image
        src={PExplore}
        alt=""
        width={14}
        height={14}
        className="absolute inset-0 transition-opacity duration-300 group-hover/cta:opacity-0"
      />
      <Image
        src={PExploreHover}
        alt=""
        width={14}
        height={14}
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/cta:opacity-100"
      />
    </span>
  );
}

export default function BusinessTabs({ data, lang = DEFAULT_LANG, prefetchedBusinessAreas }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const sectionData = data || {};
  const { text_above_title, title } = sectionData;
  const tabItems = getItems(sectionData, prefetchedBusinessAreas);

  const activeItem = tabItems[activeIndex] || tabItems[0] || {};
  const activeImage = activeItem.image_url;
  const activeTags = activeItem.tags || [];
  const activeDescription = activeItem.description;
  const activeHref = activeItem.slug ? langHref(`/${activeItem.slug}`, lang) : "";
  const webshopButton = getWebshopButton(activeItem);
  const ctaLabel = CTA_LABELS[lang] || CTA_LABELS.en;

  useEffect(() => {
    if (!tabItems.length || isPaused || tabItems.length <= 1) return undefined;

    const timer = setTimeout(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % tabItems.length);
    }, AUTO_ROTATE_DELAY);

    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, tabItems.length]);

  if (!data || !tabItems.length) return null;

  return (
    <section className="w-full pt-[60px] md:pt-[120px] pb-0">
      <div className="web-width-sm mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-10 md:mb-16">
          {text_above_title && (
            <motion.p
              className="text-(--color-body) leading-normal mb-4 ff-larken text-[16px] font-light"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {text_above_title}
            </motion.p>
          )}

          {title && (
            <motion.div
              className="section-heading h2 text-(--color-body) max-w-[920px] text-2xl md:text-3xl lg:text-[36px] leading-[1.3] font-regular"
              dangerouslySetInnerHTML={{ __html: title }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}
        </div>

        <motion.div
          className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div
            className="rounded-[10px] bg-(--color-body) p-7 md:p-12"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsPaused(false);
              }
            }}
          >
            <ul className="flex flex-col gap-3 md:gap-4">
              {tabItems.map((item, index) => {
                const isActive = index === activeIndex;

                return (
                  <li key={`${item.title}-${index}`}>
                    <button
                      type="button"
                      className="group flex w-full cursor-pointer items-center justify-between gap-4 text-left focus-visible:outline-none"
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => setActiveIndex(index)}
                      aria-pressed={isActive}
                    >
                      <span
                        className={`ff-larken text-[25px] leading-[1.3] font-normal transition-colors duration-300 md:text-[31px] lg:text-[42px] ${
                          isActive
                            ? "text-white"
                            : "text-white/45 group-hover:text-white/75"
                        }`}
                      >
                        {item.title}
                      </span>

                      <span
                        className={`relative flex h-6 w-6 shrink-0 items-center justify-center transition-all duration-300 ease-out ${
                          isActive
                            ? "translate-x-0 scale-100 opacity-100"
                            : "-translate-x-3 scale-90 opacity-0 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={PRightArrow}
                          alt=""
                          width={20}
                          height={20}
                          className={`transition-transform duration-300 ease-out ${
                            isActive
                              ? "translate-x-0"
                              : "group-hover:translate-x-1"
                          }`}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative min-h-[340px] overflow-hidden rounded-[10px] bg-(--color-body) md:min-h-[407px]">
            {activeImage ? (
              <Image
                key={activeImage}
                src={activeImage}
                alt={activeItem.image?.alt || activeItem.title || ""}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-opacity duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#d9c5a7_0%,#f1ece3_36%,#9aa9a3_67%,#33484a_100%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(255,255,255,0.7),transparent_16%),linear-gradient(90deg,rgba(255,255,255,0.32)_1px,transparent_1px),linear-gradient(0deg,rgba(30,46,49,0.16)_1px,transparent_1px)] bg-[length:auto,82px_82px,82px_82px]" />
              </div>
            )}

            <div className="absolute right-5 top-5 h-8 w-8">
              <Image
                src={LogoWhite}
                alt=""
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 text-white">
              <div className=" backdrop-blur-md">
                <div className="p-6">
                  {activeItem.title && (
                    <h3 className="mb-3 text-[18px] leading-tight md:text-[24px]">
                      {activeItem.title}
                    </h3>
                  )}

                  {activeTags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {activeTags.map((tag, index) => {
                        const label = typeof tag === "string" ? decodeHtml(tag) : getChipLabel(tag);
                        if (!label) return null;

                        return (
                          <span
                            key={`${label}-${index}`}
                            className="rounded-full border border-white/25 bg-[#1E2E31]/35 px-3 py-1.5 text-[12px] leading-none text-white shadow-[inset_0_1px_8px_rgba(255,255,255,0.16)] backdrop-blur-md"
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {activeDescription && (
                    <div
                      className="max-w-[420px] text-[16px] font-light leading-[1.45] text-white [&_p]:mb-0"
                      dangerouslySetInnerHTML={{ __html: activeDescription }}
                    />
                  )}
                </div>

                {(webshopButton || activeHref) && (
                  <div className="flex flex-wrap justify-end border-t border-white/15">
                    {webshopButton && (
                      <Link
                        href={webshopButton.url}
                        className="group/cta inline-flex items-center gap-2 px-6 py-4 text-[16px] leading-none text-white/85 transition-colors duration-300 hover:bg-[#F2EBE2] hover:text-[#1E2E31]"
                      >
                        {webshopButton.text}
                        <ExploreIcon />
                      </Link>
                    )}

                    {activeHref && (
                    <Link
                      href={activeHref}
                      className="group/cta inline-flex items-center gap-2 border-l border-white/15 px-6 py-4 text-[16px] leading-none text-white/85 transition-colors duration-300 hover:bg-[#F2EBE2] hover:text-[#1E2E31]"
                    >
                      {ctaLabel}
                      <ExploreIcon />
                    </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
