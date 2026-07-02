"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_LANG } from "@/config";

const SUPPLIERS_PER_PAGE = 16;

const VISIT_LABELS = {
  en: "Visit website",
  sv: "Besök webbplatsen",
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

function getTitle(item) {
  return decodeHtml(stripHtml(item?.title?.rendered || item?.title || item?.post_title || ""));
}

function getContent(item) {
  return item?.content?.rendered || item?.post_content || item?.content || "";
}

function getImage(item) {
  return (
    item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    item?.featured_image?.url ||
    item?.acf?.featured_image?.url ||
    item?.acf?.image?.url ||
    ""
  );
}

function getWebsiteUrl(item) {
  return item?.acf?.supplier_website_url || item?.supplier_website_url || "";
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

function SupplierCard({ supplier, lang = DEFAULT_LANG, index }) {
  const title = getTitle(supplier);
  const content = getContent(supplier);
  const image = getImage(supplier);
  const websiteUrl = getWebsiteUrl(supplier);
  const buttonText = VISIT_LABELS[lang] || VISIT_LABELS.en;

  return (
    <motion.article
      className="flex h-full flex-col overflow-hidden rounded-[10px] border border-[#CFC7BA] bg-white p-6"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.03 }}
      viewport={{ once: true }}
    >
      <div className="relative mb-4 aspect-[1.6/1] overflow-hidden rounded-[4px] bg-white">
        {image ? (
          <Image
            src={image}
            alt={title || "Supplier"}
            fill
            sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) 50vw, 25vw"
            className="object-contain"
          />
        ) : null}
      </div>

      {title && (
        <h3 className="mb-2 text-[18px] font-normal leading-tight text-(--color-body)">
          {title}
        </h3>
      )}

      {content && (
        <div
          className="mb-4 line-clamp-5 text-[13px] font-light leading-[1.5] text-(--color-body) [&_p]:mb-2 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {websiteUrl && (
        <Link
          href={websiteUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex w-full items-center justify-center rounded-[50px] bg-(--color-body) px-6 py-3 text-[13px] leading-none text-white transition-colors duration-300 hover:bg-[#2d4246]"
        >
          {buttonText}
        </Link>
      )}
    </motion.article>
  );
}

export default function GenericSupplierListing({
  data,
  lang = DEFAULT_LANG,
  suppliers = [],
}) {
  const [currentPaginationPage, setCurrentPaginationPage] = useState(1);
  const supplierItems = useMemo(
    () => (Array.isArray(suppliers) ? suppliers : []),
    [suppliers]
  );
  const { text_above_title, title } = data || {};
  const totalPages = Math.max(1, Math.ceil(supplierItems.length / SUPPLIERS_PER_PAGE));
  const currentPage = Math.min(currentPaginationPage, totalPages);
  const pageStart = (currentPage - 1) * SUPPLIERS_PER_PAGE;
  const currentSuppliers = useMemo(
    () => supplierItems.slice(pageStart, pageStart + SUPPLIERS_PER_PAGE),
    [supplierItems, pageStart]
  );

  if (!data || !supplierItems.length) return null;

  return (
    <section className="w-full pt-[60px] pb-0 md:pt-[120px]">
      <div className="web-width-sm mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          {text_above_title && (
            <motion.p
              className="ff-larken mb-4 text-[16px] font-light leading-normal text-(--color-body)"
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
              className="section-heading h2 max-w-[920px] text-2xl font-regular leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px]"
              dangerouslySetInnerHTML={{ __html: title }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentSuppliers.map((supplier, index) => (
            <SupplierCard
              key={supplier?.id || supplier?.slug || index}
              supplier={supplier}
              lang={lang}
              index={index}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <nav
            className="mt-12 flex items-center justify-center gap-2"
            aria-label="Supplier pagination"
          >
            <button
              type="button"
              onClick={() => setCurrentPaginationPage((value) => Math.max(1, value - 1))}
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
              onClick={() => setCurrentPaginationPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#1E2E31]/20 text-[18px] text-[#1E2E31] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <PaginationArrow direction="next" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
