"use client";

import Image from "next/image";
import DownArrow from "../../../../public/scroll down icon.svg";
import { motion } from "framer-motion";

export default function HomeHero({ data }) {
  const bgImage = data?.bg_image?.url || "";
  const bgVideo = data?.bg_video?.url || "";

  const shortHeading = data?.short_heading || "";
  const bannerLogo = data?.banner_logo?.url || "";
  const bannerLogoAlt = data?.banner_logo?.alt || "";
  const bannerIntro = data?.banner_intro || "";

  return (
    <div className="web-width mx-auto px-6">
      <section className="relative rounded-[11px] overflow-hidden hero min-h-[50vh] md:min-h-[clamp(480px,90svh,100svh)]">

        {/* BG VIDEO / IMAGE */}
        <div className="absolute inset-0 -z-10">
          {bgVideo ? (
            <video
              src={bgVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-[center_30%] md:object-center"
            />
          ) : bgImage ? (
            <Image
              src={bgImage}
              alt=""
              fill
              priority
              className="object-cover object-center"
            />
          ) : null}
        </div>

        {/* Subtle gradient: dark at top, transparent in middle, slightly dark at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 -z-10" />

        {/* 3-ROW LAYOUT */}
        <div className="relative flex flex-col items-center justify-between w-full min-h-[50vh] md:min-h-[clamp(480px,90svh,100svh)]">

          {/* TOP — short_heading */}
          {shortHeading && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white font-extralight text-xs md:text-base text-center px-6 pt-7 md:pt-9 [&_*]:text-white [&_p]:text-white ff-larken fs-24"
              dangerouslySetInnerHTML={{ __html: shortHeading }}
            />
          )}

          {/* MIDDLE — banner_logo image */}
          {bannerLogo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.1 }}
              className="flex-1 flex items-center justify-center w-full px-6 py-4 md:py-8"
            >
              <Image
                src={bannerLogo}
                alt={bannerLogoAlt}
                width={900}
                height={220}
                className="w-full max-w-[260px] sm:max-w-[380px] md:max-w-[520px] h-auto object-contain"
                priority
              />
            </motion.div>
          )}

          {/* BOTTOM — banner_intro + scroll arrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center gap-3 pb-8 md:pb-10 px-6 text-center"
          >
            {bannerIntro && (
              <div
                className="ff-larken fs-24 font-light text-white text-xs md:text-sm max-w-[350px] md:max-w-[350px] leading-tight [&_*]:text-white [&_p]:leading-tight"
                dangerouslySetInnerHTML={{ __html: bannerIntro }}
              />
            )}
            <motion.button
              type="button"
              aria-label="Scroll down"
              onClick={() =>
                document.querySelector("#next")?.scrollIntoView({ behavior: "smooth" })
              }
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="mt-1 opacity-80 cursor-pointer"
            >
              <Image src={DownArrow} alt="scroll down" width={18} height={18} />
            </motion.button>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
