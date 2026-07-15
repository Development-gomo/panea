"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PExplore from "../../../../public/p-explore.svg";
import PExploreHover from "../../../../public/p-explore-hover.svg";
import { DEFAULT_LANG, langHref } from "@/config";

const CASES_PER_PAGE = 12;

const LABELS = {
  en: {
    readMore: "View case",
    caseStudy: "Case study",
    previous: "Previous page",
    next: "Next page",
    all: "All",
  },
  sv: {
    readMore: "Läs ärendet",
    caseStudy: "Fallstudie",
    previous: "Föregående sida",
    next: "Nästa sida",
    all: "Alla",
  },
};

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, "").trim();
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

function getCaseImage(caseStudy) {
  return caseStudy?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
}

function getCaseExcerpt(caseStudy) {
  const excerpt = caseStudy?.excerpt;

  return (
    excerpt?.rendered ||
    (typeof excerpt === "string" ? excerpt : "") ||
    caseStudy?.acf?.excerpt ||
    ""
  );
}

function truncateHtmlWords(html, wordLimit = 5) {
  if (!html) return "";

  const totalWords = stripHtml(html).split(/\s+/).filter(Boolean).length;
  if (totalWords <= wordLimit) return html;

  const voidTags = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);
  const tokens = html.match(/<[^>]+>|[^<]+/g) || [];
  const openTags = [];
  let result = "";
  let wordCount = 0;

  for (const token of tokens) {
    if (token.startsWith("<")) {
      const closingTag = token.match(/^<\/\s*([a-z0-9-]+)/i);
      const openingTag = token.match(/^<\s*([a-z0-9-]+)/i);

      result += token;

      if (closingTag) {
        const tagName = closingTag[1].toLowerCase();
        const tagIndex = openTags.lastIndexOf(tagName);
        if (tagIndex !== -1) openTags.splice(tagIndex, 1);
      } else if (openingTag) {
        const tagName = openingTag[1].toLowerCase();
        if (!voidTags.has(tagName) && !token.endsWith("/>")) {
          openTags.push(tagName);
        }
      }

      continue;
    }

    const textParts = token.match(/\S+|\s+/g) || [];
    for (const part of textParts) {
      if (/^\s+$/.test(part)) {
        if (wordCount > 0 && wordCount < wordLimit) result += part;
        continue;
      }

      if (wordCount >= wordLimit) break;
      result += part;
      wordCount += 1;
    }

    if (wordCount >= wordLimit) break;
  }

  result = `${result.trimEnd()}…`;
  for (const tagName of openTags.reverse()) {
    result += `</${tagName}>`;
  }

  return result;
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

export default function CaseStudyArchiveCases({
  lang = DEFAULT_LANG,
  prefetchedCases,
  caseStudyTypes = [],
  casesByType = {},
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState("all");
  const labels = LABELS[lang] || LABELS.en;
  const preferredCategoryOrder = [
    "cafe-restaurang",
    "bageri",
    "hotell",
    "kontor-offentlig-miljo",
  ];
  const categories = [...caseStudyTypes].sort((a, b) => {
    const aIndex = preferredCategoryOrder.indexOf(a.slug);
    const bIndex = preferredCategoryOrder.indexOf(b.slug);

    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  const selectedCases =
    selectedType === "all"
      ? prefetchedCases || []
      : casesByType[selectedType] || [];
  const cases = [...selectedCases].sort(
    (a, b) => new Date(b?.date || 0) - new Date(a?.date || 0)
  );
  const totalPages = Math.ceil(cases.length / CASES_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
  const firstCaseIndex = (safeCurrentPage - 1) * CASES_PER_PAGE;
  const visibleCases = cases.slice(
    firstCaseIndex,
    firstCaseIndex + CASES_PER_PAGE
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const selectCategory = (categoryId) => {
    setSelectedType(categoryId);
    setCurrentPage(1);
  };

  const getCaseCategory = (caseStudy) => {
    const selectedCategory = categories.find(
      (category) => String(category.id) === selectedType
    );
    if (selectedCategory) return selectedCategory.name;

    const matchingCategory = categories.find((category) =>
      (casesByType[String(category.id)] || []).some(
        (item) => item.id === caseStudy.id
      )
    );

    return matchingCategory?.name || labels.caseStudy;
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === safeCurrentPage) return;

    setCurrentPage(page);
    window.requestAnimationFrame(() => {
      document.getElementById("case-archive-grid")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  if (!cases.length) return null;

  return (
    <section
      id="case-archive-grid"
      className="w-full scroll-mt-24 py-[40px] md:py-[60px]"
    >
      <div className="web-width mx-auto px-6">
        {categories.length > 0 && (
          <div className="mb-10 md:mb-12">
            <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5">
              <button
                type="button"
                onClick={() => selectCategory("all")}
                aria-pressed={selectedType === "all"}
                className={`min-h-10 min-w-[130px] shrink-0 cursor-pointer rounded-[6px] border px-4 py-2 text-[15px] leading-tight transition-colors sm:min-w-0 sm:text-[16px] ${
                  selectedType === "all"
                    ? "border-(--color-body) bg-(--color-brand) text-(--color-body)"
                    : "border-(--color-body) bg-(--color-body) text-white hover:bg-(--color-brand) hover:text-(--color-body)"
                }`}
              >
                {labels.all}
              </button>

              {categories.map((category) => {
                const categoryId = String(category.id);
                const isSelected = selectedType === categoryId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(categoryId)}
                    aria-pressed={isSelected}
                    className={`min-h-10 min-w-[180px] shrink-0 cursor-pointer rounded-[6px] border px-4 py-2 text-[15px] leading-tight transition-colors sm:min-w-0 sm:text-[16px] ${
                      isSelected
                        ? "border-(--color-body) bg-(--color-brand) text-(--color-body)"
                        : "border-(--color-body) bg-(--color-body) text-white hover:bg-(--color-brand) hover:text-(--color-body)"
                    }`}
                  >
                    {decodeHtml(category.name)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCases.map((caseStudy, index) => {
            const titleText = decodeHtml(
              stripHtml(caseStudy?.title?.rendered || caseStudy?.title || "")
            );
            const image = getCaseImage(caseStudy);
            const category = getCaseCategory(caseStudy);
            const excerpt = truncateHtmlWords(getCaseExcerpt(caseStudy));
            const href = langHref(`/${caseStudy.slug}`, lang);

            return (
              <motion.article
                key={caseStudy.id || caseStudy.slug}
                className="w-full max-w-[442px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: (index % 3) * 0.08 }}
                viewport={{ once: true }}
              >
                <Link
                  href={href}
                  className="group relative block aspect-square w-full max-w-[442px] overflow-hidden rounded-[6px] bg-(--color-body) text-white"
                  aria-label={`${labels.readMore}: ${titleText}`}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={titleText}
                      fill
                      sizes="(max-width: 767px) calc(100vw - 48px), 416px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#6d5c49_0%,#c5ad89_44%,#26383a_100%)]" />
                  )}

                  <span className="absolute top-4 left-4 max-w-[calc(100%_-_32px)] truncate rounded-full border border-white/15 px-3 py-2 text-[11px] leading-none text-white shadow-sm backdrop-blur-md sm:top-5 sm:left-5 sm:px-4 sm:text-[12px]">
                    {decodeHtml(category)}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-black/35 text-white shadow-[0_-12px_36px_rgba(0,0,0,0.3)] backdrop-blur-md">
                    <div className="px-4 pt-4 pb-5 sm:min-h-[80px] sm:px-6 sm:pt-6 sm:pb-8">
                      <h3 className="break-words text-[17px] leading-[1.3] sm:min-h-[54px] sm:text-[18px] xl:text-[20px]">
                        {titleText}
                      </h3>
                    </div>

                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] border-t border-white/15">
                      <div
                        className="line-clamp-2 min-w-0 break-words px-4 py-3 text-[13px] leading-[1.35] text-white/85 sm:px-5 sm:py-4 sm:text-[14px] xl:px-6 [&_p]:m-0 [&_a]:underline [&_strong]:font-semibold"
                        dangerouslySetInnerHTML={{ __html: excerpt }}
                      />
                      <span className="group/cta inline-flex items-center gap-1.5 whitespace-nowrap border-l border-white/15 px-3 py-3 text-[13px] leading-none text-white/85 transition-colors duration-300 hover:bg-[#F2EBE2] hover:text-[#1E2E31] sm:px-4 sm:py-4 sm:text-[14px] xl:gap-2 xl:px-6 xl:text-[16px]">
                        {labels.readMore}
                        <ExploreIcon />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2 md:mt-12"
            aria-label="Case study pagination"
          >
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              aria-label={labels.previous}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#1E2E31]/25 text-[18px] text-(--color-body) transition-colors hover:bg-(--color-body) hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-(--color-body)"
            >
              ‹
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                aria-label={`Page ${page}`}
                aria-current={page === safeCurrentPage ? "page" : undefined}
                className={`flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full border px-3 text-[14px] transition-colors ${
                  page === safeCurrentPage
                    ? "border-(--color-body) bg-(--color-body) text-white"
                    : "border-[#1E2E31]/25 text-(--color-body) hover:bg-(--color-body) hover:text-white"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              aria-label={labels.next}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#1E2E31]/25 text-[18px] text-(--color-body) transition-colors hover:bg-(--color-body) hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-(--color-body)"
            >
              ›
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
