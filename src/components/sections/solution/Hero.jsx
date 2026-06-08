"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SolutionHero({ data }) {
  const backgroundImage = data?.background_image?.url || "";
  const backgroundAlt = data?.background_image?.alt || "";
  const title = data?.title || "";
  const ctaText = data?.cta_text || "";
  const ctaUrl = data?.cta_url || "";

  return (
    <div className="web-width mx-auto px-6">
      <section className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-[11px] bg-(--color-body) text-white md:h-[400px]">
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt={backgroundAlt}
            fill
            priority
            sizes="(min-width: 1440px) 1408px, calc(100vw - 48px)"
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
          {title && (
            <motion.div
              className="text-[32px] leading-[1.2] md:text-[40px]"
              dangerouslySetInnerHTML={{ __html: title }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            />
          )}

          {ctaText && ctaUrl && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Link
                href={ctaUrl}
                className="inline-flex rounded-[50px] bg-(--color-brand) px-9 py-3.5 text-[16px] leading-none text-(--color-body) transition-colors duration-300 hover:bg-white"
              >
                {ctaText}
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
