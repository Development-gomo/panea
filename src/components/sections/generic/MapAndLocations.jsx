"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import PinIcon from "../../../../public/p-pin.png";

function getLocations(rows) {
  if (!rows) return [];
  const items = Array.isArray(rows) ? rows : [rows];

  return items
    .map((row) => ({
      address: row?.address || "",
    }))
    .filter((item) => item.address);
}

export default function GenericMapAndLocations({ data }) {
  if (!data) return null;

  const {
    text_above_title,
    title,
    google_map_iframe,
  } = data;
  const locations = getLocations(data.locations);
  const hasContent = google_map_iframe || locations.length > 0;

  if (!hasContent && !title && !text_above_title) return null;

  return (
    <section className="w-full py-0">
      <div className="web-width-sm mx-auto px-6">
        <div className="mb-10 flex flex-col items-center text-center md:mb-16">
          {text_above_title && (
            <motion.p
              className="ff-larken mb-4 text-[16px] font-light leading-normal text-(--color-body)"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {text_above_title}
            </motion.p>
          )}

          {title && (
            <motion.div
              className="section-heading h2 max-w-[920px] text-2xl font-regular leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px] [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: title }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}
        </div>

        {hasContent && (
          <motion.div
            className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {google_map_iframe && (
              <div
                className="min-h-[360px] overflow-hidden rounded-[7px] bg-[#1E2E31]/10 md:min-h-[480px] [&_iframe]:h-full [&_iframe]:min-h-[360px] [&_iframe]:w-full [&_iframe]:border-0 md:[&_iframe]:min-h-[480px]"
                dangerouslySetInnerHTML={{ __html: google_map_iframe }}
              />
            )}

            {locations.length > 0 && (
              <div className="rounded-[7px] border border-[#1E2E31]/16 px-6 py-7 md:px-8 md:py-9">
                <div className="space-y-6">
                  {locations.map((item, index) => (
                    <div
                      key={`${item.address}-${index}`}
                      className="flex items-start gap-4 border-b border-[#1E2E31]/12 pb-6 last:border-b-0 last:pb-0"
                    >
                      <Image
                        src={PinIcon}
                        alt=""
                        width={22}
                        height={28}
                        className="mt-1 h-auto w-[18px] shrink-0 md:w-[22px]"
                      />
                      <div
                        className="body-text text-[15px] leading-[1.55] text-(--color-body) md:text-[16px] [&_p]:mb-2 [&_p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: item.address }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
