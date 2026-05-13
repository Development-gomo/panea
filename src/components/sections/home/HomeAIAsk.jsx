// src/components/sections/home/HomeAIAsk.jsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ArrowSvg from "../../../../public/right-arrow.svg";

export default function AskAI({ data }) {
  if (!data) return null;
  const bgImage = data?.bg_image?.url || "";
  const {
    sub_heading,
    heading,
    short_text,
  } = data;

  const ai_block = data?.ai_block || [];

  return (
    <section id="next" className="ai-section relative overflow-hidden">
      {bgImage ? (
        <div className="absolute inset-0 -z-2" style={{ backgroundImage: `url(${bgImage})`, backgroundPosition: '100% -30%', backgroundRepeat: 'no-repeat', backgroundSize: 'auto' }} suppressHydrationWarning />
      ) : null}

       <div className="pb-15 md:pb-30 web-width px-6 ">
      {/* SUB HEADING WITH DOT */}
      <motion.div
        className="flex items-center gap-2 mb-2 md:mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
        <span className="subheading-label">{sub_heading}</span>
      </motion.div>

      <motion.div
        className="section-heading mb-6"
        dangerouslySetInnerHTML={{ __html: heading }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        viewport={{ once: true }}
      />

      {/* SHORT TEXT */}
      {short_text && (
        <motion.div
          className="body-text max-w-[500px] mb-6 md:mb-14"
          dangerouslySetInnerHTML={{ __html: short_text }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }} 
          viewport={{ once: true }}
        />
      )}

      {/* AI CARDS */}
      {ai_block.length > 0 && (
        <div className="flex flex-col md:justify-end md:flex-row gap-4">
          {ai_block.map((item, index) => (
            <motion.a
              key={index}
              href={item.ai_link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between bg-[#f5f5f5] rounded-lg pt-6 pb-8 pl-8 pr-6 min-h-[210px] w-full md:w-[300px] overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
            >
              {/* Arrow button top-right */}
              <div className="flex justify-end">
                <span className="flex items-center justify-center w-13 h-13 rounded-full bg-(--color-brand) text-white transition-transform group-hover:translate-x-1">
                  <Image src={ArrowSvg} alt="arrow" width={16} height={16} />
                </span>
              </div>

              {/* Logo + label bottom */}
              <div className="flex items-center gap-3 mt-6">
                {item.ai_logo?.url && (
                  <Image
                    src={item.ai_logo.url}
                    alt={item.ai_logo.alt || item.heading || "AI logo"}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                )}
                {item.heading && (
                  <span className="font-[600] text-[24px]">{item.heading}</span>
                )}
              </div>
            </motion.a>
          ))}
        </div>
      )}</div>
    </section>
  );
}
