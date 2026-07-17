"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import PExplore from "../../../../public/p-explore.svg";
import PExploreHover from "../../../../public/p-explore-hover.svg";
import { DEFAULT_LANG } from "@/config";

const POSTS_PER_PAGE = 12;

const LABELS = {
  en: {
    all: "All",
    article: "Article",
    readMore: "Read more",
    previous: "Previous page",
    next: "Next page",
    pagination: "Article pagination",
  },
  sv: {
    all: "Alla",
    article: "Artikel",
    readMore: "Läs mer",
    previous: "Föregående sida",
    next: "Nästa sida",
    pagination: "Artikelpaginering",
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

function getPostImage(post) {
  return post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
}

function getPostCategory(post, categories, fallback) {
  const categoryId = Array.isArray(post?.categories) ? post.categories[0] : null;
  return categories.find((category) => category.id === categoryId)?.name || fallback;
}

function getPostPath(slug, lang) {
  return lang === DEFAULT_LANG ? `/${slug}` : `/${lang}/${slug}`;
}

function formatPostDate(date, lang) {
  if (!date) return "";

  return new Intl.DateTimeFormat(lang === "sv" ? "sv-SE" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
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

export default function ArticleArchivePosts({
  lang = DEFAULT_LANG,
  posts = [],
  categories = [],
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const labels = LABELS[lang] || LABELS.en;
  const sortedCategories = [...categories].sort((a, b) =>
    decodeHtml(a.name).localeCompare(decodeHtml(b.name), lang)
  );
  const filteredPosts = [...posts]
    .filter((post) =>
      selectedCategory === "all"
        ? true
        : post?.categories?.includes(Number(selectedCategory))
    )
    .sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (safeCurrentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === safeCurrentPage) return;

    setCurrentPage(page);
    window.requestAnimationFrame(() => {
      document.getElementById("article-archive-grid")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  if (!posts.length) return null;

  return (
    <section
      id="article-archive-grid"
      tabIndex={-1}
      className="w-full scroll-mt-24 py-[40px] outline-none md:py-[60px]"
    >
      <div className="web-width mx-auto px-6">
        {sortedCategories.length > 0 && (
          <div className="mb-10 md:mb-12">
            <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5">
              <button
                type="button"
                onClick={() => selectCategory("all")}
                aria-pressed={selectedCategory === "all"}
                className={`min-h-10 min-w-[130px] shrink-0 cursor-pointer rounded-[6px] border px-4 py-2 text-[15px] leading-tight transition-colors sm:min-w-0 sm:text-[16px] ${
                  selectedCategory === "all"
                    ? "border-(--color-body) bg-(--color-brand) text-(--color-body)"
                    : "border-(--color-body) bg-(--color-body) text-white hover:bg-(--color-brand) hover:text-(--color-body)"
                }`}
              >
                {labels.all}
              </button>

              {sortedCategories.map((category) => {
                const categoryId = String(category.id);
                const isSelected = selectedCategory === categoryId;

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
          {visiblePosts.map((post, index) => {
            const title = decodeHtml(stripHtml(post?.title?.rendered || ""));
            const image = getPostImage(post);
            const category = getPostCategory(post, sortedCategories, labels.article);
            const date = formatPostDate(post?.date, lang);
            const href = getPostPath(post.slug, lang);

            return (
              <motion.article
                key={post.id || post.slug}
                className="w-full max-w-[442px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: (index % 3) * 0.08 }}
                viewport={{ once: true }}
              >
                <Link
                  href={href}
                  className="group relative block aspect-square w-full overflow-hidden rounded-[6px] bg-(--color-body) text-white"
                  aria-label={`${labels.readMore}: ${title}`}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={title}
                      fill
                      sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) 50vw, 442px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#6d5c49_0%,#c5ad89_44%,#26383a_100%)]" />
                  )}

                  <span className="absolute top-4 left-4 max-w-[calc(100%_-_32px)] truncate rounded-full border border-white/15 px-3 py-2 text-[11px] leading-none text-white shadow-sm backdrop-blur-md sm:top-5 sm:left-5 sm:px-4 sm:text-[12px]">
                    {decodeHtml(category)}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-black/35 text-white shadow-[0_-12px_36px_rgba(0,0,0,0.3)] backdrop-blur-md">
                    <div className="px-4 pt-4 pb-5 sm:min-h-[100px] sm:px-6 sm:pt-6 sm:pb-8">
                      <h3 className="break-words text-[17px] leading-[1.3] sm:min-h-[54px] sm:text-[18px] xl:text-[20px]">
                        {title}
                      </h3>
                    </div>

                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] border-t border-white/15">
                      <span className="min-w-0 truncate px-4 py-3 text-[12px] leading-none text-white/90 sm:px-5 sm:py-4 sm:text-[13px] xl:px-6 xl:text-[14px]">
                        {date}
                      </span>
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
            aria-label={labels.pagination}
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
