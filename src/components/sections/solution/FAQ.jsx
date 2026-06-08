"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import RightArrow from "../../../../public/right-arrow.svg";
import ToggleIcon from "../../../../public/toggle-icon-down.svg";

function getFaqItems(data) {
  const rows = data?.["q&a"] || data?.q_a || data?.qa || data?.faqs || [];

  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => row?.faq_data || row)
    .filter((item) => item?.question || item?.answer);
}

export default function SolutionFAQ({ data }) {
  const [openIndex, setOpenIndex] = useState(0);

  const {
    text_above_title,
    title,
    cta_text,
    cta_url,
  } = data || {};
  const faqItems = getFaqItems(data);

  if (!data || !faqItems.length) return null;

  return (
    <section className="w-full pt-[60px] pb-0 md:pt-[120px]">
      <div className="web-width-sm mx-auto px-6">
        <div className="flex flex-col items-center text-center">
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
              className="section-heading h2 max-w-[920px] text-2xl font-regular leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px]"
              dangerouslySetInnerHTML={{ __html: title }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}

          {cta_text && cta_url && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link
                href={cta_url}
                className="group inline-flex items-center text-xs font-normal text-(--color-body) transition-all"
              >
                <span className="relative pb-[2px]">
                  {cta_text}
                  <span className="absolute bottom-0 left-0 h-[1px] w-full bg-(--color-dark) transition-all duration-300 ease-out group-hover:w-[calc(100%+22px)]" />
                </span>
                <span className="ml-1 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                  <Image src={RightArrow} alt="" width={13} height={13} />
                </span>
              </Link>
            </motion.div>
          )}
        </div>

        <motion.div
          className="mt-16 border-t border-(--color-dark)/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `solution-faq-answer-${index}`;

            return (
              <div
                key={`${item.question}-${index}`}
                className="border-b border-(--color-dark)/20"
              >
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-6 py-6 text-left md:gap-16"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="flex-1 text-[16px] leading-[1.4] text-(--color-body) md:text-[18px]">
                    {item.question}
                  </span>
                  <Image
                    src={ToggleIcon}
                    alt=""
                    width={16}
                    height={16}
                    className={`shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && item.answer && (
                    <motion.div
                      id={answerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className="max-w-[1080px] pb-6 pr-10 text-[14px] font-light leading-[1.6] text-(--color-body) md:pr-20 md:text-[16px] [&_p]:mb-4 [&_p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: item.answer }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
