// src/components/sections/Overview.jsx

"use client";

import Link from "next/link";
import Image from "next/image";
import ArrowSvg from "../../../../public/right-arrow.svg";

export default function ServiceOverview({ data }) {
  if (!data) return null;

  const {
    sub_heading,
    heading,
    content_heading,
    short_text,
    cta_text,
    cta_url,
  } = data;

  return (
    <>
      <section
        id="next"
        className="about-section py-15 md:py-30 web-width px-6"
      >
        {/* SUB HEADING WITH DOT */}
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
          <span className="subheading-label uppercase">{sub_heading}</span>
        </div>
        <div
          className="section-heading mb-8 md:mb-14"
          dangerouslySetInnerHTML={{ __html: heading }}
        />

        {/* MAIN HEADING + 2 COLUMN LAYOUT */}
        <div className="flex md:gap-4 md:gap-12">
          {/* LEFT COLUMN — MAIN H2 + ONELINER */}
          <div className="lg:w-[45%]"></div>

          {/* RIGHT COLUMN — CONTENT HEADING + BODY + CTA */}
          <div  className="lg:w-[55%]">
            {/* Content heading */}
            {content_heading && (
              <h3 className="content-heading  max-w-[480px] mb-6">{content_heading}</h3>
            )}

            {/* Paragraph */}
            {short_text && (
              <div
                className="body-text max-w-[480px] mb-6"
                dangerouslySetInnerHTML={{ __html: short_text }}
              />
            )}

            {/* CTA BUTTON */}
            {cta_text && cta_url && (
              <Link
                href={cta_url}
                className="
                    gap-3 group relative inline-flex items-center select-none 
                    rounded-sm bg-(--color-brand) px-6 py-4 text-white 
                    transition-all duration-300 hover:bg-(--color-brand) 
                    w-[140px] overflow-hidden
                  ">
                {/* LEFT SLOT (dot area, fixed width) */}
                <span className="relative w-6 flex items-center justify-center">
                  <span
                    className="
                        absolute h-2 w-2 rounded-full bg-[#27E0C0]
                        transition-all duration-300 ease-out
                        group-hover:opacity-0 group-hover:-translate-x-1
                      "
                  ></span>
                </span>

                {/* TEXT (slides left on hover) */}
                <span
                  className="
                      flex-1 text-[16px] leading-none
                      transition-all duration-300 ease-out 
                      group-hover:-translate-x-4
                      whitespace-nowrap
                    "
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
      </section>
    </>
  );
}
