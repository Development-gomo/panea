"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_LANG, langHome } from "@/config";

function getImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;

  return (
    image.url ||
    image.source_url ||
    image.src ||
    image.sizes?.full ||
    image.sizes?.large ||
    image.sizes?.medium_large ||
    image.media_details?.sizes?.full?.source_url ||
    image.media_details?.sizes?.large?.source_url ||
    ""
  );
}

export default function CaseHero({
  data,
  lang = DEFAULT_LANG,
  pageTitle = "",
  eyebrow = "",
  scrollTargetId = "about-the-project",
  showCurrentTitleInBreadcrumb = true,
  showBreadcrumb = true,
  showEyebrow = true,
}) {
  if (!data) return null;

  const backgroundImage = data.background_image;
  const backgroundUrl = getImageUrl(backgroundImage);
  const ctaText = data.cta_text || "";
  const caseStudyLabel =
    eyebrow || (lang === "sv" ? "Fallstudie" : "Case study");
  const homeLabel = lang === "sv" ? "Hem" : "Home";
  const archiveLabel = lang === "sv" ? "Fallstudier" : "Case studies";
  const scrollToAboutProject = () => {
    const target = document.getElementById(scrollTargetId);
    if (!target) return;

    const startPosition = window.scrollY;
    const targetPosition =
      target.getBoundingClientRect().top + startPosition - 80;
    const distance = targetPosition - startPosition;
    const duration = 900;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        window.requestAnimationFrame(animateScroll);
      }
    };

    window.requestAnimationFrame(animateScroll);
  };

  if (!backgroundUrl && !pageTitle && !ctaText) {
    return null;
  }

  return (
    <section className="bg-[#F2EBE2]">
      <div className="web-width mx-auto px-6">
        <motion.section
          id="inner-hero"
          className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[11px] bg-(--color-body) py-10 text-white md:h-[400px] md:py-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {backgroundUrl && (
            <Image
              src={backgroundUrl}
              alt={backgroundImage?.alt || ""}
              fill
              sizes="(min-width: 1440px) 1408px, calc(100vw - 48px)"
              className="object-cover"
              priority
            />
          )}

          <div className="absolute inset-0 bg-black/35" />

          <div className="relative z-10 flex w-full min-w-0 flex-col items-center justify-center px-5 text-center sm:px-6">
            {showEyebrow && (
              <p className="mb-4 text-[16px] font-light leading-none text-white md:text-[18px]">
                {caseStudyLabel}
              </p>
            )}

            {pageTitle && (
              <h1
                className="w-full max-w-[920px] break-words text-[30px] font-[300] leading-[1.15] text-white sm:text-[34px] md:text-[42px] lg:text-[48px]"
                dangerouslySetInnerHTML={{ __html: pageTitle }}
              />
            )}

            {ctaText && (
              <button
                type="button"
                onClick={scrollToAboutProject}
                className="mt-6 inline-flex max-w-full cursor-pointer items-center justify-center rounded-[50px] bg-(--color-brand) px-7 py-4 text-center text-[16px] leading-tight text-(--color-body) transition-colors duration-300 hover:bg-white sm:px-9"
              >
                {ctaText}
              </button>
            )}
          </div>
        </motion.section>

        {showBreadcrumb && (
          <nav
            aria-label={lang === "sv" ? "Brödsmulor" : "Breadcrumb"}
            className="text-[#1E2E31]"
          >
            <ol className="web-width mx-auto flex min-h-11 flex-wrap items-center gap-x-2 gap-y-1 py-3 text-[12px] leading-normal font-normal text-[#1E2E31] not-italic">
              <li>
                <Link
                  href={langHome(lang)}
                  className="transition-colors hover:text-(--color-body)"
                >
                  {homeLabel}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>{archiveLabel}</li>
              {pageTitle && showCurrentTitleInBreadcrumb && (
                <>
                  <li aria-hidden="true">/</li>
                  <li
                    aria-current="page"
                    className="min-w-0 break-words text-(--color-body)"
                    dangerouslySetInnerHTML={{ __html: pageTitle }}
                  />
                </>
              )}
            </ol>
          </nav>
        )}
      </div>
    </section>
  );
}
