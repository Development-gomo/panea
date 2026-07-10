// src/components/sections/home/WhyChooseUs.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_LANG } from "@/config";
import RightArrow from "../../../../public/right-arrow.svg";

export default function WhyChooseUs({ data, lang = DEFAULT_LANG }) {
  if (!data) return null;

  const {
    text_above_title,
    title,
    cta_text,
    cta_url,
    background_color,
    features = [],
  } = data;

  const bgColor = background_color || "#B8D1D1";

  return (
    <section className="w-full pt-[60px] md:pt-[120px] pb-0">
      <div className="web-width-sm mx-auto px-6">
        <div
          className="rounded-[11px] overflow-hidden"
          style={{ backgroundColor: bgColor }}
        >

          {/* TOP — label + title + CTA */}
          <div className="flex flex-col items-center text-center px-6 pt-12 md:pt-20 pb-10 md:pb-14">
            {text_above_title && (
              <motion.p
                className="text-(--color-body) leading-normal mb-4 ff-larken text-[16px] font-light"
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
                className="section-heading text-(--color-body) max-w-[820px] text-2xl md:text-3xl lg:text-[36px] leading-[1.3]"
                dangerouslySetInnerHTML={{ __html: title }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              />
            )}

            {cta_text && cta_url && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="mt-6"
              >
                <Link
                  href={cta_url}
                  className="group inline-flex items-center text-xs text-(--color-body) transition-all font-normal"
                >
                  <span className="relative pb-[2px]">
                    {cta_text}
                    <span className="absolute bottom-0 left-0 h-[1px] bg-(--color-body) w-full transition-all duration-300 ease-out group-hover:w-[calc(100%+22px)]" />
                  </span>
                  <span className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                    <Image src={RightArrow} alt="arrow" width={15} height={15} />
                  </span>
                </Link>
              </motion.div>
            )}
          </div>

          {/* FEATURES GRID */}
          {features.length > 0 && (
            <div className="border-t border-(--color-body)/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, i) => {
                  const isLastInMdRow = (i + 1) % 2 === 0;
                  const isLastInLgRow = (i + 1) % 4 === 0;
                  const isLast = i === features.length - 1;

                  return (
                    <motion.div
                      key={i}
                      className={[
                        "flex flex-col p-6 border-(--color-body)/30",
                        // Mobile: bottom border except last
                        !isLast ? "border-b" : "",
                        // MD (2-col): right border except end of each row
                        isLastInMdRow ? "md:border-r-0" : "md:border-r",
                        "md:border-b-0",
                        // LG (4-col): right border except end of each row
                        isLastInLgRow ? "lg:border-r-0" : "lg:border-r",
                        "lg:border-b-0",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {/* Icon */}
                      {feature.icon?.url && (
                        <div className="shrink-0">
                          <Image
                            src={feature.icon.url}
                            alt={feature.icon.alt || feature.title || ""}
                            width={feature.icon.width || 40}
                            height={feature.icon.height || 40}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                      )}

                      {/* 130px gap between icon and content */}
                      <div className="mt-[130px]">
                        {feature.title && (
                          <h3 className="text-(--color-body) text-xl font-normal mb-3">
                            {feature.title}
                          </h3>
                        )}
                        {feature.description && (
                          <div
                            className="text-(--color-body) text-[16px] font-light leading-relaxed [&_p]:mb-0"
                            dangerouslySetInnerHTML={{ __html: feature.description }}
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
