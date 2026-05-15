// src/components/sections/home/ImageCtaBanner.jsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_LANG, langHref } from "@/config";

export default function ImageCtaBanner({ data, lang = DEFAULT_LANG }) {
  if (!data) return null;

  const {
    background_image,
    background_overlay,
    logo,
    title,
    cta_text_copy,
    cta_url_copy,
  } = data;

  return (
    <section className="w-full py-[60px] md:py-[120px]">
      <div className="web-width-sm mx-auto px-6">
        <div className="relative rounded-[10px] overflow-hidden min-h-[480px] md:min-h-[600px] flex items-center justify-center">

          {/* Background Image */}
          {background_image?.url && (
            <Image
              src={background_image.url}
              alt={background_image.alt || ""}
              fill
              className="object-cover object-center"
              priority
            />
          )}

          {/* Overlay — RGBA color from ACF color picker */}
          {background_overlay && (
            <div
              className="absolute inset-0 z-[1]"
              style={{ backgroundColor: background_overlay }}
            />
          )}

          {/* Content */}
          <motion.div
            className="relative z-[2] flex flex-col items-center text-center px-6 py-16 max-w-[630px] mx-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            {/* Logo */}
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
                  className="w-[80px] h-auto object-contain"
                />
              </motion.div>
            )}

            {/* Title */}
            {title && (
              <motion.h2
                className="ff-larken font-light text-[40px] md:text-[48px] leading-normal text-white mb-8"
                dangerouslySetInnerHTML={{ __html: title }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                viewport={{ once: true }}
              />
            )}

            {/* CTA */}
            {cta_text_copy && cta_url_copy && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Link
                  href={langHref(cta_url_copy, lang)}
                  className="inline-flex items-center justify-center rounded-[50px] bg-(--color-white)  px-[36px] py-[14px] text-(--color-body) transition-colors duration-300"
                >
                  {cta_text_copy}
                </Link>
              </motion.div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
