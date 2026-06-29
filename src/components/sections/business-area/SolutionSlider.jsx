"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import PExplore from "../../../../public/p-explore.svg";
import PExploreHover from "../../../../public/p-explore-hover.svg";
import { DEFAULT_LANG, langHref } from "@/config";

import "swiper/css";
import "swiper/css/pagination";

const EXPLORE_LABELS = {
  en: "Explore solution",
  sv: "Utforska lösningar",
};

function useSliderSideOffset() {
  const [offset, setOffset] = useState(24);

  useEffect(() => {
    function updateOffset() {
      const viewportWidth = window.innerWidth;
      const containerWidth = Math.min(1328, viewportWidth);
      setOffset(Math.max(24, (viewportWidth - containerWidth) / 2 + 24));
    }

    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  return offset;
}

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

function getFeaturedImage(item) {
  return (
    item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    item?.featured_image?.url ||
    item?.acf?.featured_image?.url ||
    item?.acf?.image?.url ||
    ""
  );
}

function getImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image?.url || image?.sizes?.large || image?.sizes?.medium_large || "";
}

function getButtons(rows) {
  const items = Array.isArray(rows) ? rows : rows ? [rows] : [];

  return items
    .map((row) => ({
      text: row?.cta_text || row?.text || row?.title || "",
      url: row?.cta_url || row?.url || row?.link || "",
    }))
    .filter((button) => button.text && button.url);
}

function getSliderDetails(solution) {
  return (
    solution?.acf?.slider_details ||
    solution?.acf?.solution_area_details?.slider_details ||
    solution?.slider_details ||
    {}
  );
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

function SolutionSlideCard({ solution, lang }) {
  const details = getSliderDetails(solution);
  const title = getTitle(solution);
  const backgroundImage =
    getImageUrl(details.background_image) || getImageUrl(details.backgroundImage) || getFeaturedImage(solution);
  const shortDescription = details.short_description || solution?.acf?.short_description || "";
  const hoverText = details.hover_text || "";
  const buttons = getButtons(details.button_row);
  const fallbackHref = solution?.slug ? langHref(`/solution/${solution.slug}`, lang) : "";
  const exploreLabel = EXPLORE_LABELS[lang] || EXPLORE_LABELS.en;
  const allButtons = [
    ...buttons,
    ...(fallbackHref ? [{ text: exploreLabel, url: fallbackHref, isMain: true }] : []),
  ];

  return (
    <article className="group relative h-[500px] overflow-hidden rounded-[7px] bg-[#1E2E31] text-white">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt={title}
          fill
          sizes="(max-width: 767px) calc(100vw - 48px), 31vw"
          className="object-cover transition-opacity duration-0 group-hover:duration-500 group-hover:opacity-0"
        />
      )}

      <div className="absolute inset-0 bg-[#1E2E31] opacity-0 transition-opacity duration-0 group-hover:duration-500 group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-[51px] text-white transition-opacity duration-0 group-hover:duration-300 group-hover:opacity-0">
        <div className="bg-black/25 px-5 py-5 shadow-[0_-12px_36px_rgba(0,0,0,0.3)] backdrop-blur-md md:px-6 md:py-6">
          {title && (
            <h3 className="mb-3 text-[18px] font-normal leading-tight md:text-[24px]">
              {title}
            </h3>
          )}

          {shortDescription && (
            <div
              className="max-w-[420px] text-[14px] font-light leading-[1.45] text-white/90 md:text-[16px] [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: shortDescription }}
            />
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 top-0 bottom-[51px] overflow-auto px-5 py-7 text-white opacity-0 transition-opacity duration-0 group-hover:duration-300 group-hover:opacity-100 md:px-7 md:py-8">
        {title && (
          <h3 className="mb-5 text-[22px] font-normal leading-tight text-white md:text-[26px]">
            {title}
          </h3>
        )}

        {hoverText && (
          <div
            className="text-[15px] font-light leading-[1.5] text-white md:text-[16px] [&_li]:border-b [&_li]:border-white/15 [&_li]:py-3 [&_p]:mb-7 [&_ul]:mt-6"
            dangerouslySetInnerHTML={{ __html: hoverText }}
          />
        )}
      </div>

      {allButtons.length > 0 && (
        <div
          className="absolute inset-x-0 bottom-0 z-10 grid grid-cols-2 border-t border-white/15 bg-black/25 backdrop-blur-md transition-colors duration-0 group-hover:duration-300 group-hover:bg-[#1E2E31] group-hover:backdrop-blur-0"
        >
          {allButtons.length === 1 && <span aria-hidden="true" />}
          {allButtons.map((button, index) => (
            <Link
              key={`${button.text}-${index}`}
              href={button.url}
              className={`group/cta inline-flex min-h-[50px] items-center justify-center gap-2 border-white/15 px-5 py-4 text-[14px] leading-none text-white/85 transition-colors duration-300 hover:bg-[#F2EBE2] hover:text-[#1E2E31] sm:px-6 sm:text-[16px] ${
                index > 0 || button.isMain ? "border-l" : ""
              }`}
            >
              {button.text}
              <ExploreIcon />
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

export default function BusinessAreaSolutionSlider({
  data,
  lang = DEFAULT_LANG,
  solutions = [],
}) {
  const { text_above_title, title } = data || {};
  const sliderSideOffset = useSliderSideOffset();

  if (!data) return null;

  return (
    <section className="w-full overflow-hidden pt-[60px] pb-0 md:pt-[120px]">
      <div className="web-width mx-auto px-6">
        <div className="mb-10 flex flex-col items-center text-center md:mb-16">
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
      </div>

      {solutions.length > 0 && (
        <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Swiper
            modules={[Pagination]}
            className="panea-testimonial-slider"
            slidesPerView="auto"
            slidesOffsetBefore={sliderSideOffset}
            slidesOffsetAfter={sliderSideOffset}
            spaceBetween={12}
            pagination={{ clickable: true }}
            breakpoints={{
              768: {
                spaceBetween: 14,
              },
              1024: {
                spaceBetween: 16,
              },
            }}
          >
            {solutions.map((solution, index) => (
              <SwiperSlide
                key={solution.id || solution.slug || index}
                className="!h-auto"
                style={{ width: "min(416px, calc(100vw - 48px))" }}
              >
                <SolutionSlideCard solution={solution} lang={lang} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      )}
    </section>
  );
}
