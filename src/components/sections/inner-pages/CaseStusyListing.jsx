// src/components/sections/HomeCaseStudies.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

import ArrowSvg from "../../../../public/right-arrow.svg";
import ArrowSvgB from "../../../../public/right-arrow-black.png";
import CheckSvg from "../../../../public/check.svg";

import { DEFAULT_LANG, langHref } from "@/config";

export default function CaseStudyListing({
  data,
  lang = DEFAULT_LANG,
  prefetchedCases,
}) {
  const cases = prefetchedCases || [];
  const [visibleCount, setVisibleCount] = useState(6);
  const visibleCases = cases.slice(0, visibleCount);
  const hasMore = visibleCount < cases.length;
  const bgImage = data?.bg_image?.url || "";
  const { sub_heading, heading, cta_text, cta_url, read_more_text } =
    data || {};

  return (
    <>
      <div id="next"></div>
      <section id="case-section" className="py-15 md:py-30 relative overflow-hidden">
        {bgImage ? (
          <div
            className="absolute inset-0 -z-2"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundPosition:"0% 40%",
              backgroundRepeat: "no-repeat",
              backgroundSize: "auto",
            }}
            suppressHydrationWarning
          />
        ) : null}

        <div className="w-full px-6 web-width">
          {/* SUB HEADING */}
          {sub_heading && (
            <motion.div
              className="flex items-center gap-2 mb-2 md:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
              <span className="subheading-label">{sub_heading}</span>
            </motion.div>
          )}

          {/* TOP HEADING + CTA */}
          <div className="md:flex md:justify-between items-end mb-10 lg:mb-14">
            <motion.div
              className="section-heading mb-4 md:mb-0"
              dangerouslySetInnerHTML={{ __html: heading }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
            />

            {cta_text && cta_url && (
              <Link
                href={cta_url}
                className="
              gap-3 group relative inline-flex items-center
              rounded-sm bg-(--color-brand) px-6 py-4 text-white
              transition-all duration-300 hover:bg-(--color-brand)
              w-40 overflow-hidden select-none"
              >
                {/* LEFT DOT */}
                <span className="relative w-6 flex items-center justify-center">
                  <span
                    className="
                  absolute h-2 w-2 rounded-full bg-[#27E0C0]
                  transition-all duration-300 ease-out
                  group-hover:opacity-0 group-hover:-translate-x-1"
                  ></span>
                </span>

                {/* TEXT */}
                <span
                  className="
                flex-1 text-[16px] leading-none
                transition-all duration-300 ease-out
                group-hover:-translate-x-4
                whitespace-nowrap"
                >
                  {cta_text}
                </span>

                {/* ARROW */}
                <span className="relative w-4 flex items-center justify-center">
                  <span
                    className="
                  w-4 absolute opacity-0 -translate-x-4
                  transition-all duration-300 ease-out
                  group-hover:opacity-100 group-hover:-translate-x-2"
                  >
                    <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
                  </span>
                </span>
              </Link>
            )}
          </div>
          <div className="flex gap-6 flex-col lg:flex-row flex-wrap"  >
            {visibleCases.map((item) => {
              const img =
                item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
              const clientLogo = item?.acf?.client_logo?.url || "";
              const sliderData = item?.acf?.slider_card_data || [];
              const title = item?.title?.rendered || "";
              const section_label = item?.acf?.section_label || "";

              return (
                <div
                  key={item.id}
                  className="rounded-lg overflow-hidden bg-(--color-brand)"
                >
                  <div className="relative z-10 h-60">
                    {img && (
                      <Image
                        src={img}
                        fill
                        alt={title}
                        className="object-cover h-195"
                      />
                    )}

                    {/* CLIENT LOGO */}
                    {clientLogo && (
                      <div className="absolute max-w-[134px] top-4 right-4 bg-(--color-bg) px-3 py-3 rounded-sm">
                        <Image
                          src={clientLogo}
                          alt="client logo"
                          width={100}
                          height={35}
                        />
                      </div>
                    )}
                  </div>
                  <div className=" bg-(--color-brand) md:w-[410px] text-white z-20 p-6 lg:p-8 flex flex-col justify-center">
                    <h3
                      className="text-[24px] leading-8 md:text-[24px] lg:leading-8 mb-6"
                      dangerouslySetInnerHTML={{ __html: title }}
                    />
                    {/* Achievements */}
                    {sliderData?.length > 0 && (
                      <>
                        <div className="gap-3">
                          {sliderData.map((row, i) => (
                            <span
                              key={i}
                              className="inline-block mb-4 nth-2:mb-0">
                              <span className="flex text-xs items-center justify- ">
                                <span className="flex items-center gap-2 pr-2">
                                  <span className="h-6 w-6 bg-[#ffffff40] flex items-center justify-center rounded-full">
                                    <Image
                                      src={CheckSvg}
                                      width={11}
                                      height={9}
                                      alt="no-follow"
                                    />
                                  </span>
                                  <span className="text-[14px]">
                                    {row.what_we_achieve}
                                  </span>
                                </span>
                                <span className="text-center px-2 text-[14px] border-l font-semibold">
                                  {row.stats}
                                </span>
                              </span>
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    <Link
                      href={langHref(`/case-study/${item.slug}`, lang)}
                      className=" mt-8
                      gap-3 group relative inline-flex items-center
                      rounded-sm bg-(--color-accent) px-6 py-4 text-white
                      transition-all duration-300 hover:bg-(--color-accent)
                      w-40 overflow-hidden select-none">
                      {/* LEFT DOT */}
                      <span className="relative w-6 flex items-center justify-center">
                        <span
                          className="
                          absolute h-2 w-2 rounded-full bg-[#191F68]
                          transition-all duration-300 ease-out
                          group-hover:opacity-0 group-hover:-translate-x-1"
                        ></span>
                      </span>

                      {/* TEXT */}
                      <span
                        className="text-black 
                        flex-1 text-[16px] leading-none
                        transition-all duration-300 ease-out
                        group-hover:-translate-x-4
                        whitespace-nowrap">
                        {read_more_text}
                      </span>

                      {/* ARROW */}
                      <span className="relative w-4 flex items-center justify-center">
                        <span
                          className="
                          w-4 absolute opacity-0 -translate-x-4
                          transition-all duration-300 ease-out
                          group-hover:opacity-100 group-hover:-translate-x-2"
                        >
                          <Image
                            src={ArrowSvgB}
                            width={13}
                            height={13}
                            alt="arrow"
                          />
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="gap-3 group relative inline-flex items-center rounded-sm bg-(--color-brand) px-8 py-4 text-white transition-all duration-300 hover:bg-(--color-brand) overflow-hidden select-none"
              >
                <span className="relative w-6 flex items-center justify-center">
                  <span className="absolute h-2 w-2 rounded-full bg-[#27E0C0] transition-all duration-300 ease-out group-hover:opacity-0 group-hover:-translate-x-1"></span>
                </span>
                <span className="flex-1 text-[16px] leading-none transition-all duration-300 ease-out group-hover:-translate-x-4 whitespace-nowrap">
                  Load More
                </span>
                <span className="relative w-4 flex items-center justify-center">
                  <span className="w-4 absolute opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:-translate-x-2">
                    <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
