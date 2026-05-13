// src/components/sections/About.jsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ArrowSvg from "../../../../public/right-arrow.svg";

export default function AboutUs({ data }) {
  if (!data) return null;

  const bgImage = data?.bg_image?.url || "";
  const {
    sub_heading,
    heading,
    content_heading,
    short_text,
    cta_text,
    cta_url,
  } = data;
  const sectionImageUrl = data?.section_image?.url || "";

  return (
    <section id="next" className="about-section relative overflow-hidden">
      {bgImage ? (
        <div className="absolute inset-0 -z-2" style={{ backgroundImage: `url(${bgImage})`, backgroundPosition: '100% -60%', backgroundRepeat: 'no-repeat' }} suppressHydrationWarning />
      ) : null}
      <div className="py-15 md:py-30 web-width px-6">
        {/* SUB HEADING WITH DOT */}
        <motion.div
          className="flex items-center gap-2 mb-2 md:mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}>
          <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
          <span className="subheading-label">{sub_heading}</span>
        </motion.div>

        <motion.div
          className="section-heading mb-6 md:mb-14"
          dangerouslySetInnerHTML={{ __html: heading }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}/>

        {/* MAIN HEADING + 2 COLUMN LAYOUT */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-21">
          {/* LEFT COLUMN — MAIN H2 + ONELINER */}
          <div className="md:w-[600px]">
            {sectionImageUrl && (
              <Image
                src={sectionImageUrl}
                alt="section image"
                width={500}
                height={500}
                className="md:mt-1"
              />
            )}
          </div>

          {/* RIGHT COLUMN — CONTENT HEADING + BODY + CTA */}
          <div className="md:w-[70%]">
            {/* Content heading */}
            {content_heading && (
              <h3 className="content-heading mb-4 max-w-[500px]">
                {content_heading}
              </h3>
            )}

            {/* Paragraph */}
            {short_text && (
              <div className="body-text max-w-[500px] mb-6" dangerouslySetInnerHTML={{ __html: short_text }} />
            )}

            {/* CTA BUTTON */}
            {cta_text && cta_url && (
              <Link
                href={cta_url}
                className="
                    gap-3 group relative inline-flex items-center select-none
                    rounded-sm bg-(--color-brand) px-6 py-4 text-white
                    transition-all duration-300 hover:bg-(--color-brand)
                    w-[130px] overflow-hidden
                  "
              >
                {/* LEFT SLOT (dot area, fixed width) */}
                <span className="relative w-2 h-2 flex items-center justify-center">
                  <span
                    className="absolute h-2 w-2 rounded-full bg-[#27E0C0]
                        transition-all duration-300 ease-out
                        group-hover:opacity-0 group-hover:-translate-x-1"
                  ></span>
                </span>

                {/* TEXT (slides left on hover) */}
                <span
                  className="
                      flex-1 text-[16px] leading-none
                      transition-all duration-300 ease-out
                      group-hover:-translate-x-4
                      whitespace-nowrap"
                >
                  {cta_text}
                </span>

                {/* RIGHT SLOT (arrow area, fixed width) */}
                <span className="relative w-4 flex items-center justify-center">
                  <span
                    className="
                        w-4 absolute text-[16px]
                        opacity-0 -translate-x-4
                        transition-all duration-300 ease-out
                        group-hover:opacity-100 group-hover:-translate-x-2
                      "
                  >
                    <Image src={ArrowSvg} alt="arrow" width={13} height={13} />
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
