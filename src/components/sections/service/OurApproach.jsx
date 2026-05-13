"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ArrowSvg from "../../../../public/right-arrow.svg";

export default function OurApproach({ data }) {
  const { sub_heading, heading, section_heading, cta_text, cta_url, analysis_list = [] } = data;

  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = analysis_list[activeIndex];

  return (
    <section className="">
      <div className="web-width px-6 py-15 md:py-30">
        {/* TOP HEADING */}
        {sub_heading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)" />
            <span className="subheading-label uppercase">{sub_heading}</span>
          </div>
        )}

        {heading && (
          <h2
            className="section-heading mb-6 md:mb-14"
            dangerouslySetInnerHTML={{ __html: heading }}
          />
        )}

        {/* CONTENT GRID */}
        <div className="flex md:gap-4 md:gap-12">
          {/* LEFT COLUMN — MAIN H2 + ONELINER */}
          <div className="lg:w-[45%]"></div>

          {/* RIGHT COLUMN — CONTENT HEADING + BODY + CTA */}
          <div className="lg:w-[55%]">
            <h3 className="text-[24px] leading-[32px] md:text-[40px] md:leading-[38px] font-medium mb-8">{section_heading}</h3>
            {/* STEP INDICATOR */}
            <div className="analyser-index relative flex items-center gap-4 mb-8 md:mb-18">
              {analysis_list.map((_, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-[20px] transition cursor-pointer relative transation-all duration-300 font-serif
                      ${
                        isActive
                          ? "bg-(--color-accent) active md:mr-[175px]"
                          : "bg-[#91929F1A] transation-all duration-300"
                      }
                    `}
                  >
                    {["I", "II", "III", "IV"][index]}
                  <span className={`${
                        isActive
                          ? "opacity-100 absolute border border-[#91929f59] md:w-[175px] left-18"
                          : "opacity-0" 
                      }`}></span>
                  </button>
                );
              })}
            </div>

            {/* ACTIVE CONTENT */}
            {activeItem && (
              <>
                {activeItem.heading && (
                  <h4 className="text-lg font-medium mb-4">
                    {activeItem.heading}
                  </h4>
                )}

                {activeItem.short_text && (
                  <p className="text-gray-600 max-w-[480px] leading-relaxed mb-6">
                    {activeItem.short_text}
                  </p>
                )}

                {/* {activeItem.cta_text && activeItem.cta_url && (
                  <Link
                    href={activeItem.cta_url}
                    className="inline-flex items-center gap-2 rounded-md bg-(--color-brand) px-6 py-3 text-white transition hover:opacity-90"
                  >
                    <span className="h-2 w-2 rounded-full bg-(--color-accent)" />
                    {activeItem.cta_text}
                  </Link>
                )} */}
              </>
            )}

            {cta_text && cta_url && (
              <Link
                href={cta_url}
                className="
                    gap-3 group relative inline-flex items-center select-none 
                    rounded-sm bg-(--color-brand) px-6 py-4 text-white 
                    transition-all duration-300 hover:bg-(--color-brand) 
                    max-w-[230px] overflow-hidden
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
      </div>
    </section>
  );
}
