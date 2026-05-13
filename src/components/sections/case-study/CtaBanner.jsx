"use client";

import Link from "next/link";
import Image from "next/image";
import ArrowSvg from "../../../../public/right-arrow-black.png";
import { DEFAULT_LANG, langHref } from "@/config";

export default function CaseCtaBanner({ data, lang = DEFAULT_LANG }) {
  if (!data) return null;
  const { heading, short_text, cta_text, cta_url } = data;
  return (
    <section className="py-15 md:py-30 bg-(--color-brand) text-white">
      <div className="web-width px-6">
        {/* TWO COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row md:gap-27">
          {/* LEFT META COLUMN */}
          <div className="md:w-[55%]">
            {/* LEFT – BIG HEADING */}
            {heading && (
              <h2
                className="text-[36px] md:text-[64px] leading-[44px] md:leading-[70px] font-medium"
                dangerouslySetInnerHTML={{ __html: heading }}
              />
            )}
          </div>
          {/* RIGHT – TEXT + CTA */}
          <div className="md:w-[45%]">
            {short_text && <p className="text-white text-[18px] mb-6">{short_text}</p>}

            {cta_text && cta_url && (
              <Link
                href={langHref(cta_url, lang)}
                className="
                  gap-3 group relative inline-flex items-center
                  rounded-sm bg-(--color-accent) px-6 py-4
                  text-black  
                  transition-all duration-300
                  w-[144px] overflow-hidden select-none
                "
              >
                {/* LEFT DOT */}
                <span className="relative w-6 flex items-center justify-center">
                  <span
                    className="
                      absolute h-2 w-2 rounded-full bg-[#191F68]
                      transition-all duration-300 ease-out
                      group-hover:opacity-0 group-hover:-translate-x-1
                    "
                  />
                </span>

                {/* TEXT */}
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

                {/* ARROW */}
                <span className="relative w-4 flex items-center justify-center">
                  <span
                    className="
                      w-4 absolute opacity-0 -translate-x-4
                      transition-all duration-300 ease-out
                      group-hover:opacity-100 group-hover:-translate-x-2
                    "
                  >
                    <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
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
