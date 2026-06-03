"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ArrowSvg from "../../../../public/right-arrow.svg";
import PExplore from "../../../../public/p-explore.svg";
import PExploreHover from "../../../../public/p-explore-hover.svg";
import { DEFAULT_LANG } from "@/config";

const READ_MORE_LABELS = {
  en: "Read more",
  sv: "Läs mer",
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

function getPostPath(slug, lang) {
  const prefix = lang === "en" ? "article" : "artiklar";
  const langPrefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
  return `${langPrefix}/${prefix}/${slug}`;
}

function getCategories(post) {
  const terms = post?._embedded?.["wp:term"]?.[0] || [];
  return terms.filter((term) => term.taxonomy === "category");
}

function getPostImage(post) {
  return post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
}

function formatPostDate(date, lang) {
  if (!date) return "";

  return new Intl.DateTimeFormat(lang === "sv" ? "sv-SE" : "en-US", {
    month: "long",
    day: "numeric",
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

export default function HomeNews({
  data,
  lang = DEFAULT_LANG,
  prefetchedPosts,
}) {
  const posts = [...(prefetchedPosts || [])]
    .sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0))
    .slice(0, 3);

  const {
    text_above_title,
    sub_heading,
    title,
    heading,
    cta_text,
    cta_url_copy,
    cta_url,
  } = data || {};

  const label = text_above_title || sub_heading;
  const sectionTitle = title || heading;
  const ctaUrl = cta_url_copy || cta_url;
  const readMoreLabel = READ_MORE_LABELS[lang] || READ_MORE_LABELS.en;

  if (!posts.length) return null;

  return (
    <section className="w-full pt-[60px] pb-0 md:pt-[120px]">
      <div className="web-width-sm mx-auto px-6">
        <div className="mb-10 flex flex-col items-center text-center md:mb-16">
          {label && (
            <motion.p
              className="ff-larken mb-4 text-[16px] font-light leading-normal text-(--color-body)"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {label}
            </motion.p>
          )}

          {sectionTitle && (
            <motion.div
              className="section-heading h2 max-w-[920px] text-2xl font-regular leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px]"
              dangerouslySetInnerHTML={{ __html: sectionTitle }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}

          {cta_text && ctaUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-6"
            >
              <Link
                href={ctaUrl}
                className="group inline-flex items-center text-xs font-normal text-(--color-body) transition-all"
              >
                <span className="relative pb-[2px]">
                  {cta_text}
                  <span className="absolute bottom-0 left-0 h-[1px] w-full bg-(--color-dark) transition-all duration-300 ease-out group-hover:w-[calc(100%+22px)]" />
                </span>
                <span className="ml-1 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                  <Image src={ArrowSvg} alt="arrow" width={13} height={13} />
                </span>
              </Link>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-3">
          {posts.map((post, index) => {
            const titleText = decodeHtml(stripHtml(post?.title?.rendered || ""));
            const image = getPostImage(post);
            const category = getCategories(post)[0]?.name || "Article";
            const date = formatPostDate(post?.date, lang);
            const href = getPostPath(post.slug, lang);

            return (
              <motion.article
                key={post.id || post.slug}
                className="w-full max-w-[416px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Link
                  href={href}
                  className="group relative block aspect-square w-full max-w-[416px] overflow-hidden rounded-[6px] bg-(--color-body) text-white"
                  aria-label={`${readMoreLabel}: ${titleText}`}
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

                  <span className="absolute left-5 top-5 rounded-full border border-white/15 px-4 py-2 text-[11px] leading-none text-white shadow-sm backdrop-blur-md">
                    {decodeHtml(category)}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-black/35 text-white shadow-[0_-12px_36px_rgba(0,0,0,0.3)] backdrop-blur-md">
                    <div className="pt-6 px-6 pb-10">
                      <h3 className="min-h-[54px] text-[18px] leading-[1.35] md:text-[18px]">
                        {titleText}
                      </h3>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] border-t border-white/15">
                      <span className="px-6 py-4 text-[12px] leading-none text-white/90">
                        {date}
                      </span>
                      <span className="group/cta inline-flex items-center gap-2 border-l border-white/15 px-6 py-4 text-[16px] leading-none text-white/85 transition-colors duration-300 hover:bg-[#F2EBE2] hover:text-[#1E2E31]">
                        {readMoreLabel}
                        <ExploreIcon />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
