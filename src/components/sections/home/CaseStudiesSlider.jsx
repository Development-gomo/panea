"use client";

import Image from "next/image";
import Link from "next/link";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import PExplore from "../../../../public/p-explore.svg";
import PExploreHover from "../../../../public/p-explore-hover.svg";
import { DEFAULT_LANG, langHref } from "@/config";
import useSliderSideOffset from "@/lib/useSliderSideOffset";

import "swiper/css";
import "swiper/css/pagination";
import { decodeHtml, stripHtml } from "@/lib/htmlText";

const READ_CASE_LABELS = {
  en: "Read case",
  sv: "Läs kundcaset",
};

function getCaseImage(item) {
  const media = item?._embedded?.["wp:featuredmedia"]?.[0];

  return (
    media?.media_details?.sizes?.large?.source_url ||
    media?.media_details?.sizes?.medium_large?.source_url ||
    media?.source_url ||
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

// Swiper only loops when there are more slides than fit on screen, so short
// lists are repeated until they reach this count.
const MIN_LOOP_SLIDES = 8;

// Matches the business area solution slider: up to this many cases sit
// side by side, more than this become an autoplaying loop.
const MAX_STATIC_SLIDES = 3;

function ExploreIcon() {
  return (
    <span className="relative h-[12px] w-[13px] shrink-0 transition-transform duration-300 group-hover/cta:translate-x-1">
      <Image
        src={PExplore}
        alt=""
        width={13}
        height={12}
        className="absolute inset-0 transition-opacity duration-300 group-hover/cta:opacity-0"
      />
      <Image
        src={PExploreHover}
        alt=""
        width={13}
        height={12}
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/cta:opacity-100"
      />
    </span>
  );
}

function CaseCard({ item, lang, readCaseLabel }) {
  const title = getCaseTitle(item);
  const excerpt = getCaseExcerpt(item);
  const image = getCaseImage(item);
  const href = langHref(`/${item.slug}/`, lang);

  return (
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
          unoptimized
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

          <span className="group/cta inline-flex items-center gap-2 border border-transparent border-l-white/15 px-6 py-4 text-[16px] leading-none text-white/85 transition-colors duration-300 hover:border-[#1E2E31]/30 hover:bg-[#F2EBE2] hover:text-[#1E2E31]">
            {readCaseLabel}
            <ExploreIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CaseStudiesSlider({
  cases = [],
  lang = DEFAULT_LANG,
  className = "",
  excludeSlug = "",
  sortByDate = true,
  loop = false,
}) {
  const sliderSideOffset = useSliderSideOffset();

  const filteredCases = cases.filter(
    (item) => !excludeSlug || item?.slug !== excludeSlug
  );
  const visibleCases = (
    sortByDate
      ? filteredCases.sort((a, b) => {
          const aDate = Date.parse(a?.date || "") || 0;
          const bDate = Date.parse(b?.date || "") || 0;

          return bDate - aDate;
        })
      : filteredCases
  ).slice(0, 8);

  if (!visibleCases.length) return null;

  const readCaseLabel = READ_CASE_LABELS[lang] || READ_CASE_LABELS.en;

  if (loop) {
    return (
      <LoopingCaseSlider
        cases={visibleCases}
        lang={lang}
        readCaseLabel={readCaseLabel}
        sideOffset={sliderSideOffset}
        className={className}
      />
    );
  }

  return (
    <div className={`panea-case-slider-shell w-full ${className}`}>
      <Swiper
        modules={[Pagination, Autoplay]}
        className="panea-case-study-slider"
        slidesPerView="auto"
        spaceBetween={12}
        pagination={{ clickable: true }}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        breakpoints={{
          768: { spaceBetween: 14 },
          1024: { spaceBetween: 16 },
        }}
      >
        {visibleCases.map((item) => (
          <SwiperSlide
            key={item.id || item.slug}
            style={{ width: "min(440px, calc(100vw - 48px))" }}
          >
            <CaseCard item={item} lang={lang} readCaseLabel={readCaseLabel} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

// Same container and slide structure as the business area solution slider:
// full-bleed Swiper offset to line up with .web-width, 416px slides.
function LoopingCaseSlider({ cases, lang, readCaseLabel, sideOffset, className }) {
  const caseCount = cases.length;
  const shouldLoop = caseCount > MAX_STATIC_SLIDES;
  const loopCases = [];
  while (shouldLoop && loopCases.length < MIN_LOOP_SLIDES) {
    loopCases.push(...cases);
  }
  const renderedCases = shouldLoop ? loopCases : cases;

  function syncBullets(swiper) {
    swiper.pagination?.bullets?.forEach((bullet, index) => {
      bullet.classList.toggle(
        "swiper-pagination-bullet-active",
        index === swiper.realIndex % caseCount
      );
    });
  }

  return (
    <div className={`w-full ${className}`}>
      <Swiper
        modules={[Pagination, Autoplay]}
        loop={shouldLoop}
        autoplay={
          shouldLoop ? { delay: 2000, disableOnInteraction: false } : false
        }
        onPaginationUpdate={syncBullets}
        onSlideChange={syncBullets}
        className="panea-case-study-slider"
        slidesPerView="auto"
        slidesOffsetBefore={sideOffset}
        slidesOffsetAfter={sideOffset}
        spaceBetween={12}
        pagination={{
          clickable: true,
          enabled: true,
          renderBullet: (index, bulletClass) =>
            `<span class="${bulletClass}"${
              index >= caseCount ? ' style="display:none"' : ""
            }></span>`,
        }}
        breakpoints={{
          768: {
            spaceBetween: 14,
            allowTouchMove: true,
            pagination: { enabled: true },
          },
          1024: {
            spaceBetween: 16,
            allowTouchMove: true,
            pagination: { enabled: true },
          },
          // From this width three 416px slides fit (3 × 416 + 2 × 16 + 2 × 24),
          // so there is nothing to slide unless there are more than three.
          1328: {
            spaceBetween: 16,
            allowTouchMove: shouldLoop,
            pagination: { enabled: shouldLoop },
          },
        }}
      >
        {renderedCases.map((item, index) => (
          <SwiperSlide
            key={`${item.id || item.slug}-${index}`}
            style={{ width: "min(416px, calc(100vw - 48px))" }}
          >
            <CaseCard item={item} lang={lang} readCaseLabel={readCaseLabel} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
