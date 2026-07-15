"use client";

import Image from "next/image";
import Link from "next/link";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import PExplore from "../../../../public/p-explore.svg";
import PExploreHover from "../../../../public/p-explore-hover.svg";
import { DEFAULT_LANG, langHref } from "@/config";

import "swiper/css";
import "swiper/css/pagination";

const READ_CASE_LABELS = {
  en: "Read case",
  sv: "Läs ärendet",
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

function getCaseImage(item) {
  return (
    item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    item?.acf?.featured_image?.url ||
    item?.acf?.image?.url ||
    ""
  );
}

function getCaseTitle(item) {
  return decodeHtml(stripHtml(item?.title?.rendered || item?.title || ""));
}

function getCaseExcerpt(item) {
  return decodeHtml(
    stripHtml(
      item?.excerpt?.rendered ||
        item?.acf?.short_description ||
        item?.acf?.excerpt ||
        item?.acf?.description ||
        ""
    )
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

export default function CaseStudiesSlider({
  cases = [],
  lang = DEFAULT_LANG,
  className = "",
  excludeSlug = "",
}) {
  const visibleCases = excludeSlug
    ? cases.filter((item) => item?.slug !== excludeSlug)
    : cases;

  if (!visibleCases.length) return null;

  const readCaseLabel = READ_CASE_LABELS[lang] || READ_CASE_LABELS.en;

  return (
    <div className={`panea-case-slider-shell w-full ${className}`}>
      <Swiper
        modules={[Pagination]}
        className="panea-case-study-slider"
        slidesPerView="auto"
        spaceBetween={12}
        pagination={{ clickable: true }}
        breakpoints={{
          768: { spaceBetween: 14 },
          1024: { spaceBetween: 16 },
        }}
      >
        {visibleCases.map((item) => {
          const title = getCaseTitle(item);
          const excerpt = getCaseExcerpt(item);
          const image = getCaseImage(item);
          const href = langHref(`/${item.slug}/`, lang);

          return (
            <SwiperSlide
              key={item.id || item.slug}
              style={{ width: "min(440px, calc(100vw - 48px))" }}
            >
              <Link
                href={href}
                className="group relative block h-[420px] overflow-hidden rounded-[6px] bg-(--color-body) text-white md:h-[480px] xl:h-[520px]"
                aria-label={`${readCaseLabel}: ${title}`}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 48px), 440px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#6d5c49_0%,#c5ad89_44%,#26383a_100%)]" />
                )}

                <div className="absolute inset-x-0 bottom-0 bg-black/35 text-white shadow-[0_-12px_36px_rgba(0,0,0,0.3)] backdrop-blur-md">
                  <div className="px-6 py-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-[16px] leading-[1.25] md:text-[24px]">
                        {title}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] border-t border-white/15">
                    {excerpt && (
                      <p className="min-w-0 truncate px-6 py-4 text-[14px] font-light leading-none text-white/85">
                        {excerpt}
                      </p>
                    )}

                    <span className="group/cta inline-flex items-center gap-2 border-l border-white/15 px-6 py-4 text-[16px] leading-none text-white/85 transition-colors duration-300 hover:bg-[#F2EBE2] hover:text-[#1E2E31]">
                      {readCaseLabel}
                      <ExploreIcon />
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
