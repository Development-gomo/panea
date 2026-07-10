"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_LANG } from "@/config";
import RightArrow from "../../../../public/right-arrow.svg";

export default function BusinessAreaWhyChooseUs({ data, lang = DEFAULT_LANG }) {
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
          className="overflow-hidden rounded-[11px]"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex flex-col items-center px-6 pt-12 pb-10 text-center md:pt-20 md:pb-14">
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
                className="section-heading max-w-[820px] text-2xl leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px]"
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
                  className="group inline-flex items-center text-xs font-normal text-(--color-body) transition-all"
                >
                  <span className="relative pb-[2px]">
                    {cta_text}
                    <span className="absolute bottom-0 left-0 h-[1px] w-full bg-(--color-body) transition-all duration-300 ease-out group-hover:w-[calc(100%+22px)]" />
                  </span>
                  <span className="ml-1 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                    <Image src={RightArrow} alt="arrow" width={13} height={13} />
                  </span>
                </Link>
              </motion.div>
            )}
          </div>

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
                        "flex flex-col border-(--color-body)/30 p-6",
                        !isLast ? "border-b" : "",
                        isLastInMdRow ? "md:border-r-0" : "md:border-r",
                        "md:border-b-0",
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
                      {feature.icon?.url && (
                        <div className="shrink-0">
                          <Image
                            src={feature.icon.url}
                            alt={feature.icon.alt || feature.title || ""}
                            width={feature.icon.width || 40}
                            height={feature.icon.height || 40}
                            className="h-10 w-10 object-contain"
                          />
                        </div>
                      )}

                      <div className="mt-[105px]">
                        {feature.title && (
                          <h3 className="mb-3 text-xl font-medium text-(--color-body)">
                            {feature.title}
                          </h3>
                        )}
                        {feature.description && (
                          <div
                            className="text-[16px] font-light leading-relaxed text-(--color-body) [&_p]:mb-0"
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
