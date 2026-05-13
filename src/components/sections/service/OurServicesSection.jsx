"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import PlusIcon from "../../../../public/plus-light.svg";
import ArrowSvgB from "../../../../public/right-arrow-black.png";
import Arrowdown from "../../../../public/down-arrow-black.svg";

export default function OurServicesSection({ data }) {
  const { sub_heading, heading, section_image, service_list = [] } = data;
  const [openIndex, setOpenIndex] = useState(0); // no item open by default

  const toggleService = (index) => {
    setOpenIndex(index === openIndex ? null : index); // toggle open/close
  };

  return (
    <section className="bg-(--color-brand) text-white">
      <div className="web-width px-6 py-15 md:py-30">
        {/* SUB HEADING */}
        {sub_heading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)" />
            <span className="subheading-label">{sub_heading}</span>
          </div>
        )}
        {/* MAIN HEADING */}
        {heading && (
          <div
            className="section-heading mb-6 md:mb-14"
            dangerouslySetInnerHTML={{ __html: heading }}
          />
        )}

        {/* MAIN HEADING + 2 COLUMN LAYOUT */}
        <div className="md:flex md:gap-4 md:gap-12">
          <div className="lg:w-[45%]">
            {section_image && (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative w-full h-[300px] lg:h-[400px] rounded-lg mb-10"
              >
                <Image
                  src={section_image.url}
                  alt=""
                  width={405}
                  height={450}
                  className="rounded-lg"
                />
              </motion.div>
            )}
          </div>
          <div className="lg:w-[55%]">
            <div className="">
              {service_list.map((service, index) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    key={index}
                    className="py-6 md:py-8 [&:nth-child(1)]:pt-0 border-btm relative"
                  >
                    <button
                      onClick={() => toggleService(index)}
                      className="w-full flex items-center gap-4 md:gap-20 text-left cursor-pointer outline-none"
                    >
                      <span className="flex items-center gap-4">
                        {/* SERVICE NAME */}
                        <span className="h-2 w-2 rounded-full bg-(--color-accent)" />
                        <span className="text-white content-heading">
                          {service.heading}
                        </span>
                      </span>
                      {/* ICON (expand/collapse) */}
                      <span className="bg-(--color-accent) h-12 w-12 flex items-center justify-center rounded-full ml-auto">
                        <Image
                          src={Arrowdown}
                          alt="toggle icon"
                          width={16}
                          height={16}
                          className={`transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </button>

                    {/* SERVICE DETAILS (expand when open) */}
                    {isOpen && (
                      <div className="ml-8 mt-6">
                        <div className="text-white max-w-[540px]">{service.short_text}</div>
                        {service.cta_text && service.cta_url && (
                          <Link
                            href={service.cta_url}
                            className="mt-6 gap-3 group relative inline-flex items-center
                                    rounded-sm bg-(--color-accent) px-6 py-[14px] text-white
                                    transition-all duration-300 hover:bg-(--color-accent)
                                    w-[155px] overflow-hidden select-none"
                          >
                            {/* LEFT DOT */}
                            <span className="relative w-6 flex items-center justify-center">
                              <span className="absolute h-2 w-2 rounded-full bg-[#191F68] transition-all duration-300 ease-out group-hover:opacity-0 group-hover:-translate-x-1"></span>
                            </span>

                            {/* TEXT */}
                            <span className="text-black flex-1 text-[16px] leading-none transition-all duration-300 ease-out group-hover:-translate-x-4 whitespace-nowrap">
                              {service.cta_text}
                            </span>

                            {/* ARROW */}
                            <span className="relative w-4 flex items-center justify-center">
                              <span className="
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
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
