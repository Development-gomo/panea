"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import RightArrow from "../../../../public/right-arrow.svg";
import { DEFAULT_LANG } from "@/config";

const ABOUT_LABELS = {
  en: "About the Project",
  sv: "Om projektet",
};

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

export default function AboutTheProject({ data, lang = DEFAULT_LANG }) {
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

  if (
    !text_above_title &&
    !title &&
    !cta_text &&
    !imageUrl &&
    !content
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
          {/* The title is hidden; the text above it is shown in the title style. */}
          {text_above_title && (
            <motion.div
              className="section-heading h2 max-w-[920px] text-2xl leading-[1.3] font-regular text-(--color-body) md:text-3xl lg:text-[36px]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {ABOUT_LABELS[lang] || ABOUT_LABELS.en}
            </motion.div>
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
                className="body-text w-full min-w-0 break-words space-y-6 text-(--color-body) md:flex-1 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
