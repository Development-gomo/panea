// src/components/product/TestimonialSlider.jsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import QuoteImage from "../../../public/quote-image.svg";

import "swiper/css";
import "swiper/css/pagination";

function selectedPosts(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

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

function mergeTestimonials(selected, fetched) {
  const fetchedById = new Map(
    (fetched || []).map((item) => [Number(item.id), item])
  );

  return selected
    .map((item) => {
      const id = Number(postId(item));
      const fetchedItem = fetchedById.get(id);
      return fetchedItem || (typeof item === "object" ? item : null);
    })
    .filter(Boolean);
}

export default function ProductTestimonialSlider({
  data,
  prefetchedTestimonials = [],
}) {
  const { text_above_title, title } = data || {};
  const testimonials = mergeTestimonials(
    selectedPosts(data?.clients_testimonial),
    prefetchedTestimonials
  );

  if (!testimonials.length) return null;

  return (
    <section className="w-full overflow-hidden pt-[60px] pb-[60px]">
      <div className="web-width mx-auto">
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
        className="panea-testimonial-slider-shell"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
      >
        <Swiper
          modules={[Pagination]}
          className="panea-testimonial-slider"
          slidesPerView="auto"
          spaceBetween={14}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { spaceBetween: 14 },
            1024: { spaceBetween: 16 },
          }}
        >
          {testimonials.map((item, index) => {
            const titleText = getTitle(item);
            const content = getContent(item);
            const designation = getDesignation(item);
            const image = getImage(item);

            return (
              <SwiperSlide
                key={postId(item) || `${titleText}-${index}`}
                className="panea-testimonial-slide !h-auto"
              >
                <article className="grid h-full overflow-hidden rounded-[6px] bg-[#A68AA4] md:min-h-[368px] md:grid-cols-[32%_68%]">
                  <div className="relative min-h-[260px] bg-[#1E2E31]/10 md:min-h-full">
                    {image ? (
                      <Image
                        src={image}
                        alt={titleText || "Testimonial author"}
                        fill
                        sizes="(max-width: 767px) calc(100vw - 48px), 280px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,#d8c5b5_0%,#9e8177_50%,#31464a_100%)]" />
                    )}
                  </div>

                  <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden px-8 py-10 text-white md:px-10 md:py-11">
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
                        className="ff-larken relative z-10 max-w-[510px] text-[24px] font-light leading-[1.35] text-white md:text-[28px] [&_p]:mb-4 [&_p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    )}

                    <div className="relative z-10 mt-10">
                      {titleText && (
                        <p className="text-[18px] font-normal leading-tight text-white">
                          {titleText}
                        </p>
                      )}
                      {designation && (
                        <p className="mt-1 text-[13px] font-light leading-normal text-white">
                          {designation}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </motion.div>
    </section>
  );
}
