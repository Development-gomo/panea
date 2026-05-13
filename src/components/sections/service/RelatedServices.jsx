// src/components/sections/HomeServices.jsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import ArrowSvg from "../../../../public/right-arrow.svg";
import { DEFAULT_LANG, langHref } from "@/config";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function RelatedServices({ data, lang = DEFAULT_LANG, prefetchedServices }) {
  const services = prefetchedServices || [];
  const { sub_heading, heading, cta_text, cta_url } = data || {};

  if (!services.length) return null;

  return (
    <section id="services-section" className="py-15 md:py-30 overflow-hidden">
      {/* FULL WIDTH WRAPPER */}
      <div className="w-full px-6 web-width">
        {/* SUB HEADING */}
        {sub_heading && (
          <div className="flex items-center gap-2 mb-2 md:mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
            <span className="subheading-label">{sub_heading}</span>
          </div>
        )}

        {/* TOP ROW: HEADING + CTA */}
        <div className="lg:flex lg:justify-between items-end mb-10 lg:mb-14">
          <div
            className="section-heading mb-4 md:mb-0"
            dangerouslySetInnerHTML={{ __html: heading }}
          />

          {/* CTA BUTTON */}
          {cta_text && cta_url && (
            <Link
              href={langHref(cta_url, lang)}
              className="
              gap-3 group relative inline-flex items-center
              rounded-sm bg-(--color-brand) px-6 py-4 text-white
              transition-all duration-300 hover:bg-(--color-brand)
              w-[235px] overflow-hidden select-none
            "
            >
              {/* LEFT DOT */}
              <span className="relative w-6 flex items-center justify-center">
                <span
                  className="
                  absolute h-2 w-2 rounded-full bg-[#27E0C0]
                  transition-all duration-300 ease-out
                  group-hover:opacity-0 group-hover:-translate-x-1
                "
                ></span>
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

      {/* FULL WIDTH SLIDER */}
      <div className="w-full web-width px-6 py-6 lg:py-0">
        <Swiper
          modules={[Navigation]}
          navigation={{ nextEl: ".next-btn", prevEl: ".prev-btn" }}
          slidesPerView={3}
          spaceBetween={24}
          centeredSlides={false}
          loop={true}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 1.5 },
            800: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="service-swiper"
        >
          {services.map((service) => {
            const img =
              service?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
              service?.acf?.featured_image?.url ||
              "";

            const excerpt = service?.excerpt?.rendered || "";
            const service_icon = service?.acf?.service_icon?.url || "";

            return (
              <SwiperSlide key={service.id} className="lg:w-[410px]">
                <Link
                  href={langHref(`/service/${service.slug}`, lang)}
                  className="block group rounded-lg overflow-hidden relative"
                >
                  {img && (
                    <Image
                      src={img}
                      alt={service.title.rendered}
                      width={410}
                      height={500}
                      className="w-full h-[500px] object-cover transition-all duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/0 to-transparent"></div>

                  {/* LABEL BADGE */}
                  <div className="absolute top-6 left-6">
                    <span className="service-link bg-(--color-bg) text-white px-6 py-3
                    rounded-full flex items-center gap-2 text-sm leading-[18px]">
                      {service_icon && (
                        <Image
                          src={service_icon}
                          alt={service.title.rendered}
                          width={24}
                          height={24}
                          className=""
                        />
                      )}
                      {service.title.rendered}
                    </span>
                  </div>

                  {/* ARROW TOP RIGHT */}
                  <div className="absolute top-6 right-8 transition-all duration-300">
                    <div
                      className="w-12 h-12 rounded-full bg-(--color-brand)
                    flex items-center justify-center
                    transition-all duration-300">
                      <Image src={ArrowSvg} width={15} height={15} alt="go" />
                    </div>
                  </div>

                  {/* EXCERPT */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div
                      className="text-white text-[24px] lg:text-[32px] leading-[38px]"
                      dangerouslySetInnerHTML={{ __html: excerpt }}
                    />
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-center gap-4 mt-8 lg:mt-10">
          {/* PREV */}
          <button className="cursor-pointer prev-btn w-12 h-12 rounded-md border border-gray-300 group flex items-center justify-center hover:bg-(--color-bg) transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12.532 12.403" className="transition-colors duration-300">
              <path d="M248.292,12.738h10.661a.338.338,0,1,1,0,.675H248.292l5.162,5.161a.338.338,0,1,1-.478.478L247,13.075,252.976,7.1a.338.338,0,1,1,.478.478Z" transform="translate(-246.859 -6.874)" className="fill-[#9192A0] stroke-[#9192A0] group-hover:fill-white group-hover:stroke-white" strokeWidth="0.2" fillRule="evenodd"/>
            </svg>
          </button>

          {/* NEXT */}
          <button className="cursor-pointer next-btn w-12 h-12 rounded-md border border-gray-300 group flex items-center justify-center hover:bg-(--color-bg) transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12.532 12.403" className="transition-colors duration-300">
              <path d="M258,12.738H247.338a.338.338,0,1,0,0,.675H258l-5.162,5.161a.338.338,0,0,0,.478.478l5.976-5.977L253.314,7.1a.338.338,0,0,0-.478.478Z" transform="translate(-246.9 -6.874)" className="fill-[#9192A0] stroke-[#9192A0] group-hover:fill-white group-hover:stroke-white" strokeWidth="0.2" fillRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
