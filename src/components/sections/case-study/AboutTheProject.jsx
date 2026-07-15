"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import RightArrow from "../../../../public/right-arrow.svg";

function getImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;

  return (
    image.url ||
    image.source_url ||
    image.src ||
    image.sizes?.large ||
    image.sizes?.medium_large ||
    image.sizes?.medium ||
    ""
  );
}

function getText(value) {
  if (value === undefined || value === null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return getText(value.rendered || value.name || value.label || value.value);
}

export default function AboutTheProject({ data }) {
  if (!data) return null;

  const {
    text_above_title,
    title,
    cta_text,
    cta_url,
    image,
    content,
    image_position,
  } = data;

  const imageUrl = getImageUrl(image);
  const imageLeft = image_position === "left";
  const details = [
    {
      value: getText(data.client_name),
      label: getText(data.client_label),
    },
    {
      value: getText(data.location_name),
      label: getText(data.location_label),
    },
    {
      value: getText(data.industry_name),
      label: getText(data.industry_label),
    },
    {
      value: getText(data.scope_of_work),
      label: getText(data.scope_of_work_label),
    },
  ];
  const hasDetails = details.some((item) => item.value);

  if (
    !text_above_title &&
    !title &&
    !cta_text &&
    !imageUrl &&
    !content &&
    !hasDetails
  ) {
    return null;
  }

  return (
    <section
      id="about-the-project"
      className="w-full scroll-mt-20 bg-[#F2EBE2] pt-[80px] pb-[40px] md:pt-[120px] md:pb-[60px]"
    >
      <div className="web-width-sm mx-auto px-6">
        <div className="mb-10 flex flex-col items-center text-center md:mb-15">
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
              className="section-heading h2 max-w-[920px] text-2xl leading-[1.3] font-regular text-(--color-body) md:text-3xl lg:text-[36px]"
              dangerouslySetInnerHTML={{ __html: title }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}

          {cta_text && cta_url && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-6"
            >
              <Link
                href={cta_url}
                className="group inline-flex items-center text-xs font-normal text-(--color-body) transition-all"
              >
                <span className="relative pb-[2px]">
                  {cta_text}
                  <span className="absolute bottom-0 left-0 h-px w-full bg-(--color-dark) transition-all duration-300 ease-out group-hover:w-[calc(100%+22px)]" />
                </span>
                <span className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                  <Image src={RightArrow} alt="" width={17} height={17} />
                </span>
              </Link>
            </motion.div>
          )}
        </div>

        {(imageUrl || content) && (
          <motion.div
            className={`mb-5 flex flex-col items-start gap-8 md:mb-10 md:gap-12 lg:gap-[80px] ${
              imageLeft ? "md:flex-row" : "md:flex-row-reverse"
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {imageUrl && (
              <div className="w-full min-w-0 md:flex-1">
                <Image
                  src={imageUrl}
                  alt={image?.alt || ""}
                  width={560}
                  height={420}
                  sizes="(min-width: 768px) 50vw, calc(100vw - 48px)"
                  className="h-auto w-full rounded-[10px] object-cover"
                />
              </div>
            )}

            {content && (
              <div
                className="body-text w-full min-w-0 break-words space-y-4 text-(--color-body) md:flex-1 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </motion.div>
        )}

        {hasDetails && (
          <motion.dl
            className="mb-5 grid border-y border-[#1E2E31]/20 sm:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {details.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className={`relative min-w-0 px-[24px] py-[24px] ${
                  index > 0
                    ? "border-t border-[#1E2E31]/15 lg:border-t-0"
                    : ""
                } ${
                  index === 1 ? "sm:border-t-0" : ""
                } ${
                  index % 2 === 1
                    ? "sm:border-l sm:border-[#1E2E31]/15 lg:border-l-0"
                    : ""
                } ${
                  index > 0
                    ? "lg:before:absolute lg:before:left-0 lg:before:top-1/2 lg:before:h-[42px] lg:before:w-px lg:before:-translate-y-1/2 lg:before:bg-[#1E2E31]/20 lg:before:content-['']"
                    : ""
                }`}
              >
                <dd className="break-words text-[20px] font-normal leading-[1.2] text-(--color-body)">
                  {item.value || "—"}
                </dd>
                <dt className="ff-larken mt-[5px] text-[16px] font-light leading-none text-(--color-body)">
                  {item.label}
                </dt>
              </div>
            ))}
          </motion.dl>
        )}
      </div>
    </section>
  );
}
