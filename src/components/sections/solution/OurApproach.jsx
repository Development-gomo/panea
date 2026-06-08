"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function formatStepNumber(value, index) {
  const number = value ?? index + 1;
  const numericValue = Number(number);

  if (Number.isFinite(numericValue)) {
    return String(numericValue).padStart(2, "0");
  }

  return String(number);
}

export default function SolutionOurApproach({ data }) {
  const {
    text_above_title,
    title,
    cta_text,
    cta_url,
    steps = [],
  } = data || {};

  if (!data || !steps.length) return null;

  return (
    <section className="w-full pt-[60px] pb-0 md:pt-[120px]">
      <div className="web-width mx-auto px-6">
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
              className="section-heading h2 max-w-[920px] text-2xl font-regular leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px]"
              dangerouslySetInnerHTML={{ __html: title }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}
        </div>

        <div className="grid grid-cols-1 border-t border-(--color-dark)/20 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.article
              key={`${step.step_number || index}-${step.step_title || ""}`}
              className="border-b border-(--color-dark)/20 py-8 sm:px-6 sm:[&:nth-child(2n)]:border-l lg:border-b-0 lg:px-6 lg:[&:not(:nth-child(4n+1))]:border-l lg:[&:nth-child(2n)]:border-l"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <p className="ff-larken text-[36px] font-medium leading-none text-(--color-body) md:text-[64px]">
                {formatStepNumber(step.step_number, index)}
              </p>

              {step.step_title && (
                <h3 className="mt-6 mb-4 text-[18px] font-normal leading-[1.25] text-(--color-body)">
                  {step.step_title}
                </h3>
              )}

              {step.step_details && (
                <div
                  className="text-[14px] font-light leading-[1.55] text-(--color-body) [&_p]:mb-4 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: step.step_details }}
                />
              )}
            </motion.article>
          ))}
        </div>

        {cta_text && cta_url && (
          <motion.div
            className="mt-16 flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link
              href={cta_url}
              className="inline-flex rounded-[50px] bg-(--color-body) px-9 py-3.5 text-[16px] leading-none text-white transition-colors duration-300 hover:bg-white hover:text-(--color-body)"
            >
              {cta_text}
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
