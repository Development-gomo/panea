"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

function getImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;

  return (
    image.url ||
    image.source_url ||
    image.src ||
    image.sizes?.large ||
    image.sizes?.medium_large ||
    image.sizes?.medium ||
    image.media_details?.sizes?.large?.source_url ||
    image.media_details?.sizes?.medium_large?.source_url ||
    ""
  );
}

function getButtons(rows) {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => ({
      text: row?.cta_text || "",
      url: row?.cta_url || "",
    }))
    .filter((button) => button.text && button.url);
}

export default function WebshopHighlightBanner({ data }) {
  if (!data) return null;

  const backgroundImage = data.background_image || data?.backgroundImage;
  const logo = data.logo;
  const backgroundUrl = getImageUrl(backgroundImage);
  const logoUrl = getImageUrl(logo);
  const buttons = getButtons(data.button_row);

  if (!backgroundUrl && !data.title && !data.description && !logoUrl) return null;

  return (
    <section className="w-full pt-[160px] pb-[60px]">
      <div className="web-width mx-auto">
        <motion.div
          className="relative overflow-hidden rounded-[10px] bg-(--color-body) px-8 py-10 text-white md:px-[60px] md:py-[80px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {backgroundUrl && (
            <Image
              src={backgroundUrl}
              alt={backgroundImage?.alt || ""}
              fill
              sizes="(min-width: 1440px) 1200px, calc(100vw - 48px)"
              className="object-cover"
            />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%)]" />

          <div className="relative z-10 mx-auto flex max-w-[540px] flex-col items-center text-center">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt={logo?.alt || ""}
                width={58}
                height={58}
                className="mb-7 h-auto w-[46px] md:w-[58px]"
              />
            )}

            {data.title && (
              <div
                className="ff-larken text-[32px] font-light leading-[1.18] md:text-[42px] [&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: data.title }}
              />
            )}

            {data.description && (
              <div
                className="mt-5 max-w-[500px] text-[15px] font-light leading-[1.45] text-white/85 md:text-[16px] [&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            )}

            {buttons.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {buttons.map((button, index) => (
                  <Link
                    key={`${button.text}-${index}`}
                    href={button.url}
                    className={`inline-flex rounded-[50px] border px-9 py-3.5 text-[14px] leading-none transition-colors duration-300 ${
                      index === 0
                        ? "border-white bg-white text-(--color-body) hover:bg-transparent hover:text-white"
                        : "border-white/65 text-white hover:bg-white hover:text-(--color-body)"
                    }`}
                  >
                    {button.text}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
