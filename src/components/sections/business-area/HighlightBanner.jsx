"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

function getImageUrl(image) {
  return image?.url || image?.sizes?.large || image?.sizes?.medium_large || "";
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

function getIconDescriptionItems(rows) {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => ({
      iconUrl: getImageUrl(row?.icon),
      iconAlt: row?.icon?.alt || "",
      text: row?.one_line_text || "",
    }))
    .filter((item) => item.iconUrl || item.text);
}

export default function BusinessAreaHighlightBanner({ data }) {
  if (!data) return null;

  const backgroundImage = data.background_image || data?.backgroundImage;
  const logo = data.logo;
  const backgroundUrl = getImageUrl(backgroundImage);
  const logoUrl = getImageUrl(logo);
  const buttons = getButtons(data.button_row);
  const iconDescriptionItems = getIconDescriptionItems(data.icon_and_description);

  if (!backgroundUrl && !data.title && !data.description && !logoUrl) return null;

  return (
    <section className="w-full pt-[60px] pb-0 md:pt-[120px]">
      <div className="web-width-sm mx-auto px-6">
        <motion.div
          className="relative overflow-hidden rounded-[10px] bg-(--color-body) px-8 py-10 text-[#F2EBE2] md:px-[60px] md:py-[80px]"
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

          <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(30,46,49,0)_0%,rgba(30,46,49,0.9)_44.53%,#1E2E31_61.84%)]" />

          <div className="relative z-10 max-w-[540px]">
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
                className="ff-larken text-[32px] font-light leading-[1.18] md:text-[42px] [font-family:var(--font-larken)!important] [&_*]:[font-family:var(--font-larken)!important] [&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: data.title }}
              />
            )}

            {data.description && (
              <div
                className="mt-2 max-w-[500px] text-[15px] font-light leading-[1.45] text-[#F2EBE2]/85 md:text-[16px] [&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            )}

            {iconDescriptionItems.length > 0 && (
              <div className="mt-6 flex flex-col gap-2">
                {iconDescriptionItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    {item.iconUrl && (
                      <Image
                        src={item.iconUrl}
                        alt={item.iconAlt}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 object-contain"
                      />
                    )}
                    {item.text && (
                      <div
                        className="text-[15px] font-light leading-[1.45] text-[#F2EBE2] md:text-[16px] [&_p]:mb-0"
                        dangerouslySetInnerHTML={{ __html: item.text }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {buttons.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
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
