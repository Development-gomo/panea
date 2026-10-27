"use client";

import Image from "next/image";
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
    ""
  );
}

export default function ProjectSteps({ data }) {
  if (!data) return null;

  const {
    text_above_title,
    title,
    image,
    steps_content,
    image_position,
    cta_text,
  } = data;

  const imageUrl = getImageUrl(image);
  const imageLeft = image_position === "left";
  const steps = Array.isArray(steps_content) ? steps_content : [];

  if (!text_above_title && !title && !imageUrl && !steps.length && !cta_text) {
    return null;
  }

  return (
    <section className="w-full bg-[#F2EBE2] py-[40px] md:py-[60px]">
      <div className="web-width mx-auto px-6">
        <div className="mb-10 flex flex-col items-center text-center md:mb-15">
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
              className="section-heading h2 max-w-[920px] text-2xl leading-[1.3] font-regular text-(--color-body) md:text-3xl lg:text-[36px]"
              dangerouslySetInnerHTML={{ __html: title }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}
        </div>

        {(imageUrl || steps.length > 0) && (
          <motion.div
            className={`flex flex-col items-start gap-8 md:gap-12 lg:gap-[80px] ${
              imageLeft ? "md:flex-row" : "md:flex-row-reverse"
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {imageUrl && (
              <div className="w-full min-w-0 md:flex-1">
                <Image
                  src={imageUrl}
                  alt={image?.alt || ""}
                  width={560}
                  height={420}
                  sizes="(min-width: 768px) 50vw, calc(100vw - 48px)"
                  className="h-auto w-full rounded-[10px] object-cover"
                />
              </div>
            )}

            <div className="w-full min-w-0 md:flex-1">
              {steps.length > 0 && (
                <div>
                  {steps.map((step, index) => (
                    <article
                      key={`${step?.title || "step"}-${index}`}
                      className={`grid grid-cols-[28px_minmax(0,1fr)] gap-1 md:grid-cols-[32px_minmax(0,1fr)] ${
                        index > 0 ? "pt-5" : ""
                      }`}
                    >
                      <span className="ff-larken pt-[10px] text-[16px] leading-none font-light text-(--color-body) italic">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="border-b border-[#1E2E31]/20 pb-4">
                        {step?.title && (
                          <h3 className="ff-larken break-words text-[21px] leading-[1.2] font-light text-(--color-body) sm:text-[24px]">
                            {step.title}
                          </h3>
                        )}
                        {step?.short_information && (
                          <div
                            className="mt-2 break-words text-[14px] leading-[1.45] font-normal text-(--color-body) sm:text-[16px] [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-0"
                            dangerouslySetInnerHTML={{
                              __html: step.short_information,
                            }}
                          />
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
