// src/components/sections/home/HomeCaseStudies.jsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

import ArrowSvg from "../../../../public/right-arrow.svg";

import { DEFAULT_LANG } from "@/config";
import CaseStudiesSlider from "./CaseStudiesSlider";

export default function HomeCaseStudies({
  data,
  lang = DEFAULT_LANG,
  prefetchedCases,
}) {
  const cases = (prefetchedCases || []).slice(0, 8);

  const {
    text_above_title,
    sub_heading,
    title,
    heading,
    cta_text,
    cta_url_copy,
    cta_url,
  } = data || {};

  const label = text_above_title || sub_heading;
  const sectionTitle = title || heading;
  const ctaUrl = cta_url_copy || cta_url;

  if (!cases.length) return null;

  return (
    <>
      <div id="next"></div>
      <section
        id="case-section"
        className="w-full overflow-hidden pt-[60px] pb-0 md:pt-[120px]"
      >
        <div className="web-width-sm mx-auto px-6">
          <div className="mb-10 flex flex-col items-center text-center md:mb-16">
            {label && (
              <motion.p
                className="ff-larken mb-4 text-[16px] font-light leading-normal text-(--color-body)"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {label}
              </motion.p>
            )}

            {sectionTitle && (
              <motion.div
                className="section-heading h2 max-w-[920px] text-2xl font-regular leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px]"
                dangerouslySetInnerHTML={{ __html: sectionTitle }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              />
            )}

            {cta_text && ctaUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="mt-6"
              >
                <Link
                  href={ctaUrl}
                  className="group inline-flex items-center text-xs font-normal text-(--color-body) transition-all"
                >
                  <span className="relative pb-[2px]">
                    {cta_text}
                    <span className="absolute bottom-0 left-0 h-[1px] w-full bg-(--color-dark) transition-all duration-300 ease-out group-hover:w-[calc(100%+22px)]" />
                  </span>
                  <span className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                    <Image src={ArrowSvg} alt="arrow" width={13} height={15} />
                  </span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <CaseStudiesSlider cases={cases} lang={lang} />
        </motion.div>
      </section>
    </>
  );
}
