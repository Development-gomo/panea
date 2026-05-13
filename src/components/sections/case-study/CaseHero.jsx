"use client";

import Image from "next/image";
import React from "react";
import DownArrow from "../../../../public/hero-down-arrow.png";
import Overlay from "../../../../public/overlay.png";
import { motion } from "framer-motion";

export default function CaseHero({ data }) {
  const bgImage = data?.bg_image?.url || "";
  const heading = data?.heading || "";
  const sub_heading = data?.sub_heading || "";
  const logo = data?.logo?.url || "";

  return (
    <section id="inner-hero" className="relative w-full overflow-hidden hero">
      {/* BG IMAGE/VIDEO */}
      <div className="absolute inset-0 -z-10">
        {bgImage &&  
          <Image
            src={bgImage}
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
        }
      </div>

      {/* Gradient Overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/80 -z-10"></div>
      <div className="absolute inset-0 -z-10"><Image src={Overlay} alt="Overlay" fill className="object-cover" /></div> */}

      {/* HERO TEXT */}
      <div className="relative min-h-screen web-width px-6 py-16 lg:py-25 h-full flex flex-col items-start justify-end">
        <div className="md:flex items-end justify-between gap-20">
          <div className="max-w-[1046px]">
          {sub_heading && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="uppercase subheading-label text-[var(--color-accent)] md:mb-6"
              dangerouslySetInnerHTML={{ __html: sub_heading }}
            />
          )}
          <h1>
          <motion.span
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="heading-xl text-white"
            dangerouslySetInnerHTML={{
              __html: heading.replace(/<em>(.*?)<\/em>/g, `<em>$1</em>`),
            }}
          />
            <motion.a
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector("#next")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="block md:inline-block w-16 h-16 text-center pt-6 pl-6 rounded-full bg-(--color-accent) translate-y-2 transition-all duration-300 shadow-md hover:translate-y-3.5 cursor-pointer md:ml-8 mt-4 md:mt-0">
                            <Image src={DownArrow} alt="arrow" width={16} height={16} />
            </motion.a>
            </h1>
        </div>

        {logo && (
          <div className="bg-(--color-bg) px-3 py-3 rounded-sm mt-12 md:mt-6">
            <Image src={logo} alt="Case Study Logo" width={150} height={75} className=""/>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
