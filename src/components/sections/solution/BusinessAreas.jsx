"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import PRightArrow from "../../../../public/p-right-arrow.svg";
import PExplore from "../../../../public/p-explore.svg";
import PExploreHover from "../../../../public/p-explore-hover.svg";
import LogoWhite from "../../../../public/logowhite.png";

const AUTO_ROTATE_DELAY = 5000;

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

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, "").trim();
}

function getTitle(item) {
  return decodeHtml(
    stripHtml(item?.title?.rendered || item?.title || item?.post_title || "")
  );
}

function getImage(item) {
  return (
    item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    item?.acf?.featured_image?.url ||
    item?.acf?.image?.url ||
    item?.acf?.card_image?.url ||
    ""
  );
}

function getDescription(item) {
  return (
    item?.acf?.short_description ||
    item?.acf?.description ||
    item?.excerpt?.rendered ||
    ""
  );
}

function getExpert(item) {
  const expert =
    item?.acf?.expert ||
    item?.acf?.expert_name ||
    item?.acf?.contact_person ||
    null;

  if (!expert) return "";
  if (typeof expert === "string") return decodeHtml(stripHtml(expert));

  return decodeHtml(
    stripHtml(
      expert?.title?.rendered ||
        expert?.name ||
        expert?.post_title ||
        expert?.label ||
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

export default function SolutionBusinessAreas({
  data,
  businessAreas = [],
  contactButton,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const {
    text_above_title,
    title,
    cta_text,
    cta_url,
  } = data || {};
  const activeItem = businessAreas[activeIndex] || businessAreas[0] || {};
  const activeTitle = getTitle(activeItem);
  const activeImage = getImage(activeItem);
  const activeDescription = getDescription(activeItem);
  const activeExpert = getExpert(activeItem);
  const buttonText = contactButton?.cta_text || "";
  const buttonUrl = contactButton?.cta_url || "";

  useEffect(() => {
    if (businessAreas.length <= 1 || isPaused) return undefined;

    const timer = setTimeout(() => {
      setActiveIndex((current) => (current + 1) % businessAreas.length);
    }, AUTO_ROTATE_DELAY);

    return () => clearTimeout(timer);
  }, [activeIndex, businessAreas.length, isPaused]);

  if (!data || !businessAreas.length) return null;

  return (
    <section className="w-full pt-[60px] pb-0 md:pt-[120px]">
      <div className="web-width-sm mx-auto px-6">
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

          {cta_text && cta_url && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link
                href={cta_url}
                className="group inline-flex items-center text-xs font-normal text-(--color-body)"
              >
                <span className="relative pb-[2px]">
                  {cta_text}
                  <span className="absolute bottom-0 left-0 h-px w-full bg-(--color-dark) transition-all duration-300 group-hover:w-[calc(100%+22px)]" />
                </span>
                <Image
                  src={PExploreHover}
                  alt=""
                  width={13}
                  height={13}
                  className="ml-1 transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </Link>
            </motion.div>
          )}
        </div>

        <motion.div
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
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
              {businessAreas.map((item, index) => {
                const isActive = index === activeIndex;
                const itemTitle = getTitle(item);

                return (
                  <li key={`${item.id || itemTitle}-${index}`}>
                    <button
                      type="button"
                      className="group flex w-full cursor-pointer items-center justify-between gap-4 text-left focus-visible:outline-none"
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => setActiveIndex(index)}
                      aria-pressed={isActive}
                    >
                      <span
                        className={`ff-larken text-[25px] font-normal leading-[1.3] transition-colors duration-300 md:text-[31px] lg:text-[42px] ${
                          isActive
                            ? "text-white"
                            : "text-white/45 group-hover:text-white/75"
                        }`}
                      >
                        {itemTitle}
                      </span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "translate-x-0 scale-100 opacity-100"
                            : "-translate-x-3 scale-90 opacity-0 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100"
                        }`}
                      >
                        <Image src={PRightArrow} alt="" width={20} height={20} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative min-h-[340px] overflow-hidden rounded-[10px] bg-(--color-body) md:min-h-[407px]">
            {activeImage && (
              <Image
                key={activeImage}
                src={activeImage}
                alt={activeTitle}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-opacity duration-500"
              />
            )}

            <div className="absolute right-5 top-5 h-8 w-8">
              <Image src={LogoWhite} alt="" fill sizes="32px" className="object-contain" />
            </div>

            <div className="absolute inset-x-0 bottom-0 text-white">
              <div className="backdrop-blur-md">
                <div className="p-6">
                  <h3 className="text-[20px] leading-tight md:text-[24px]">
                    {activeTitle}
                  </h3>
                  {activeExpert && (
                    <p className="mt-3 text-[12px] text-white/75">
                      {activeExpert}
                    </p>
                  )}
                  {activeDescription && (
                    <div
                      className="mt-3 max-w-[460px] text-[16px] font-light leading-[1.5] text-white [&_p]:mb-0"
                      dangerouslySetInnerHTML={{ __html: activeDescription }}
                    />
                  )}
                </div>

                {buttonText && buttonUrl && (
                  <div className="flex justify-end border-t border-white/15">
                    <Link
                      href={buttonUrl}
                      className="group/cta inline-flex items-center gap-2 border-l border-white/15 px-6 py-4 text-[16px] leading-none text-white/85 transition-colors duration-300 hover:bg-[#F2EBE2] hover:text-[#1E2E31]"
                    >
                      {buttonText}
                      <ExploreIcon />
                    </Link>
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
