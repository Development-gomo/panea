"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import QuoteImage from "../../../../public/quote-image.svg";

function postId(item) {
  return typeof item === "object" ? item?.ID || item?.id : item;
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
  return decodeHtml(
    stripHtml(item?.post_title || item?.title?.rendered || item?.title || "")
  );
}

function getContent(item) {
  return item?.post_content || item?.content?.rendered || item?.content || "";
}

function getDesignation(item) {
  return item?.acf?.designation || item?.designation || "";
}

function getImage(item) {
  const media = item?._embedded?.["wp:featuredmedia"]?.[0];

  return (
    media?.source_url ||
    item?.featured_image?.url ||
    item?.acf?.featured_image?.url ||
    item?.image?.url ||
    ""
  );
}

function resolveTestimonial(selected, fetched) {
  const item = Array.isArray(selected) ? selected[0] : selected;
  if (!item) return null;

  const fetchedItem = (fetched || []).find(
    (testimonial) => Number(testimonial.id) === Number(postId(item))
  );

  return fetchedItem || (typeof item === "object" ? item : null);
}

export default function CaseStudyTestimonialSlider({
  data,
  prefetchedTestimonials = [],
}) {
  const { text_above_title, title } = data || {};
  const testimonial = resolveTestimonial(
    data?.clients_testimonial,
    prefetchedTestimonials
  );
  const titleText = getTitle(testimonial);
  const content = getContent(testimonial);
  const designation = getDesignation(testimonial);
  const image = getImage(testimonial);

  if (!testimonial) return null;

  return (
    <section className="w-full overflow-hidden py-[40px] md:py-[60px]">
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

      <motion.div
        className="web-width mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
      >
        <article className="mx-auto grid max-w-[1280px] overflow-hidden rounded-[6px] bg-[#A68AA4] md:grid-cols-[minmax(260px,460px)_minmax(0,820px)] xl:h-[420px]">
          <div className="relative min-h-[240px] bg-[#1E2E31]/10 sm:min-h-[300px] md:h-[420px] md:min-h-0">
            {image ? (
              <Image
                src={image}
                alt={titleText || "Testimonial author"}
                fill
                sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1279px) 38vw, 460px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#d8c5b5_0%,#9e8177_50%,#31464a_100%)]" />
            )}
          </div>

          <div className="relative flex min-w-0 flex-col justify-between overflow-hidden px-6 py-8 text-white sm:px-8 sm:py-10 md:min-h-[420px] md:px-10 md:py-11 xl:h-[420px]">
            <div className="pointer-events-none absolute right-0 top-0 z-0 flex h-[250px] gap-5 opacity-[0.08]">
              <Image
                src={QuoteImage}
                alt=""
                width={163}
                height={250}
                className="h-[250px] w-auto"
              />
              <Image
                src={QuoteImage}
                alt=""
                width={163}
                height={250}
                className="h-[250px] w-auto"
              />
            </div>

            {content && (
              <div
                className="ff-larken relative z-10 max-w-[725px] break-words text-[23px] font-extralight leading-[1.35] text-white sm:text-[27px] lg:text-[32px] [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-4 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}

            <div className="relative z-10 mt-10">
              {titleText && (
                <p className="text-[20px] font-normal leading-tight text-white">
                  {titleText}
                </p>
              )}
              {designation && (
                <p className="mt-1 text-[14px] font-light leading-normal text-white">
                  {designation}
                </p>
              )}
            </div>
          </div>
        </article>
      </motion.div>
    </section>
  );
}
