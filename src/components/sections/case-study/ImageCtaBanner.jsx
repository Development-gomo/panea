"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_LANG, langHref } from "@/config";

export default function CaseStudyImageCtaBanner({
  data,
  lang = DEFAULT_LANG,
  containerWidthClass = "web-width-sm",
}) {
  if (!data) return null;

  const {
    background_image,
    background_overlay,
    logo,
    title,
    cta_text,
    cta_url,
    description,
  } = data;

  if (
    !background_image?.url &&
    !logo?.url &&
    !title &&
    !description &&
    !cta_text
  ) {
    return null;
  }

  return (
    <section className="w-full pt-[40px] pb-[60px] md:pt-[60px] md:pb-[120px]">
      <div className={`${containerWidthClass} mx-auto px-6`}>
        <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-[10px] md:min-h-[600px]">
          {background_image?.url && (
            <Image
              src={background_image.url}
              alt={background_image.alt || ""}
              fill
              sizes="(min-width: 1400px) 1328px, calc(100vw - 48px)"
              className="object-cover object-center"
              priority
            />
          )}

          {background_overlay && (
            <div
              className="absolute inset-0 z-[1]"
              style={{ backgroundColor: background_overlay }}
            />
          )}

          <motion.div
            className="relative z-[2] mx-auto flex max-w-[980px] flex-col items-center px-6 py-16 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            {logo?.url && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Image
                  src={logo.url}
                  alt={logo.alt || ""}
                  width={logo.width || 80}
                  height={logo.height || 60}
                  className="h-auto w-[80px] object-contain"
                />
              </motion.div>
            )}

            {title && (
              <motion.h2
                className="ff-larken mb-8 max-w-[630px] break-words text-[30px] font-light leading-[1.2] text-white sm:text-[36px] md:text-[48px] md:leading-normal"
                dangerouslySetInnerHTML={{ __html: title }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                viewport={{ once: true }}
              />
            )}

            {description && (
              <motion.div
                className="mb-8 w-full max-w-[940px] break-words text-[15px] font-light leading-[1.45] text-white sm:text-[16px] [&_img]:h-auto [&_img]:max-w-full [&_p]:mx-auto [&_p]:mb-4 [&_p]:max-w-[720px] [&_p:last-child]:mb-0 [&_ul]:mx-auto [&_ul]:mt-8 [&_ul]:flex [&_ul]:w-full [&_ul]:max-w-[940px] [&_ul]:list-disc [&_ul]:flex-wrap [&_ul]:items-center [&_ul]:justify-center [&_ul]:gap-x-8 [&_ul]:gap-y-2 [&_ul]:pl-5 [&_li]:text-left [&_li]:text-[14px] [&_li]:italic [&_li]:marker:text-white"
                dangerouslySetInnerHTML={{ __html: description }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22 }}
                viewport={{ once: true }}
              />
            )}

            {cta_text && cta_url && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Link
                  href={langHref(cta_url, lang)}
                  className="inline-flex items-center justify-center rounded-[50px] bg-(--color-white) px-[36px] py-[14px] text-(--color-body) transition-colors duration-300"
                >
                  {cta_text}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
