// src/components/sections/HomeCaseStudies.jsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import ArrowSvg from "../../../../public/right-arrow.svg";
import ArrowSvgB from "../../../../public/right-arrow-black.png";
import CheckSvg from "../../../../public/check.svg";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { DEFAULT_LANG, langHref } from "@/config";

export default function RealtedCase({ data, lang = DEFAULT_LANG, prefetchedCases }) {
  const cases = prefetchedCases || [];

  const { sub_heading, heading, cta_text, cta_url, read_more_text } =
    data || {};

  useEffect(() => {
    if (!cases.length) return;
    const raf = requestAnimationFrame(() => {
      const btn = document.querySelector(".case-next-btn");
      if (btn) btn.click();
    });
    return () => cancelAnimationFrame(raf);
  }, [cases.length]);

  if (!cases.length) return null;

  return (
    <section id="case-section" className="py-15 md:py-30">
      {/* FULL WIDTH WRAPPER */}
      <div className="w-full px-6 web-width">
        {/* SUB HEADING */}
        {sub_heading && (
          <div className="flex items-center gap-2 mb-2 md:mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
            <span className="subheading-label">{sub_heading}</span>
          </div>
        )}

        {/* TOP HEADING + CTA */}
        <div className="md:flex md:justify-between items-end mb-10 lg:mb-14">
          <div
            className="section-heading mb-4 md:mb-0"
            dangerouslySetInnerHTML={{ __html: heading }}
          />

          {cta_text && cta_url && (
            <Link
              href={cta_url}
              className="
              gap-3 group relative inline-flex items-center
              rounded-sm bg-(--color-brand) px-6 py-4 text-white
              transition-all duration-300 hover:bg-(--color-brand)
              w-[160px] overflow-hidden select-none"
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
      </div>

      {/* FULL WIDTH SLIDER */}
      <div className="w-full">
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".case-next-btn",
            prevEl: ".case-prev-btn",
          }}
          slidesPerView={1.5}
          spaceBetween={32}
          centeredSlides={true}
          breakpoints={{
            280: { slidesPerView: 1.1 },
            510: { slidesPerView: 1.1 },
            640: { slidesPerView: 1.5 },
            1024: { slidesPerView: 1.5 },
            1280: { slidesPerView: 1.4 },
            1536: { slidesPerView: 1.4 },
          }}
        >
          {cases.map((item) => {
            const img =
              item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
            const clientLogo = item?.acf?.client_logo?.url || "";
            const sliderData = item?.acf?.slider_card_data || [];
            const title = item?.title?.rendered || "";
            const section_label = item?.acf?.section_label || "";

            return (
              <SwiperSlide key={item.id}>
                <div className="grid grid-cols-1 lg:grid-cols-2 rounded-lg overflow-hidden bg-(--color-brand)">
                  <div className=" bg-(--color-brand) md:w-[600px] text-white z-20 p-6 lg:p-12 flex flex-col justify-center">
                    <h3
                      className="text-[24px] leading-[32px] md:text-[32px] lg:leading-[40px]"
                      dangerouslySetInnerHTML={{ __html: title }}
                    />
                    <Link
                      href={langHref(`/case-study/${item.slug}`, lang)}
                      className=" mt-8
                      gap-3 group relative inline-flex items-center
                      rounded-sm bg-(--color-accent) px-6 py-4 text-white
                      transition-all duration-300 hover:bg-(--color-accent)
                      w-[155px] overflow-hidden select-none mb-15"
                    >
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
                        whitespace-nowrap"
                      >
                        {read_more_text}
                      </span>

                      {/* ARROW */}
                      <span className="relative w-4 flex items-center justify-center">
                        <span
                          className="
                          w-4 absolute opacity-0 -translate-x-4
                          transition-all duration-300 ease-out
                          group-hover:opacity-100 group-hover:-translate-x-2">
                          <Image
                            src={ArrowSvgB}
                            width={13}
                            height={13}
                            alt="arrow"
                          />
                        </span>
                      </span>
                    </Link>

                    {/* Achievements */}
                    {sliderData?.length > 0 && (
                      <>
                        <p className="mb-4 font-medium text-[18px]">{section_label}</p>
                        <div className="gap-3">
                          {sliderData.map((row, i) => (
                            <span
                              key={i}
                              className="inline-block mb-4 [&:nth-child(2)]:mb-0"
                            >
                              <span className="flex text-xs items-center justify- border border-white rounded-[4px]">
                                <span className="flex items-center p-2 gap-2 min-w-[175px]">
                                  <span className="h-[24px] w-[24px] bg-[#ffffff40] flex items-center justify-center rounded-full">
                                    <Image
                                      src={CheckSvg}
                                      width={9}
                                      height={8}
                                      alt="no-follow"
                                    />
                                  </span>
                                  <span className="text-[14px]">
                                    {row.what_we_achieve}
                                  </span>
                                </span>
                                <span className="w-[50px] text-center px-3 py-3 text-[14px] border-l font-semibold">
                                  {row.stats}
                                </span>
                              </span>
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="relative z-10 h-[350px] lg:h-full">
                    {img && (
                      <Image
                        src={img}
                        fill
                        alt={title}
                        className="object-cover"
                      />
                    )}

                    {/* CLIENT LOGO */}
                    {clientLogo && (
                      <div className="absolute max-w-[134px] top-12 right-12 bg-(--color-bg) px-3 py-3 rounded-sm">
                        <Image
                          src={clientLogo}
                          alt="client logo"
                          width={100}
                          height={35}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* NAV BUTTONS */}
        <div className="flex justify-center gap-4 mt-8 lg:mt-10">
          <button className="cursor-pointer case-prev-btn w-12 h-12 rounded-md border border-gray-300 group flex items-center justify-center hover:bg-[#9192A0] transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12.532 12.403" className="transition-colors duration-300">
              <path d="M248.292,12.738h10.661a.338.338,0,1,1,0,.675H248.292l5.162,5.161a.338.338,0,1,1-.478.478L247,13.075,252.976,7.1a.338.338,0,1,1,.478.478Z" transform="translate(-246.859 -6.874)" className="fill-[#9192A0] stroke-[#9192A0] group-hover:fill-white group-hover:stroke-white" strokeWidth="0.2" fillRule="evenodd"/>
            </svg>
          </button>

          <button className="cursor-pointer case-next-btn w-12 h-12 rounded-md border border-gray-300 group flex items-center justify-center hover:bg-[#9192A0] transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12.532 12.403" className="transition-colors duration-300">
              <path d="M258,12.738H247.338a.338.338,0,1,0,0,.675H258l-5.162,5.161a.338.338,0,0,0,.478.478l5.976-5.977L253.314,7.1a.338.338,0,0,0-.478.478Z" transform="translate(-246.9 -6.874)" className="fill-[#9192A0] stroke-[#9192A0] group-hover:fill-white group-hover:stroke-white" strokeWidth="0.2" fillRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
