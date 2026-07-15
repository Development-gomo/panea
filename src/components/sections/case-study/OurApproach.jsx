"use client";

import { motion } from "framer-motion";

function formatStepNumber(value, index) {
  const number = value ?? index + 1;
  const numericValue = Number(number);

  if (Number.isFinite(numericValue)) {
    return String(numericValue).padStart(2, "0");
  }

  return String(number);
}

export default function CaseStudyOurApproach({ data }) {
  if (!data) return null;

  const { text_above_title, heading, counters = [] } = data;
  const steps = counters;

  if (!text_above_title && !heading && steps.length === 0) return null;

  return (
    <section className="w-full py-[40px] md:py-[60px]">
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

          {heading && (
            <motion.div
              className="section-heading h2 max-w-[920px] text-2xl font-regular leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px]"
              dangerouslySetInnerHTML={{ __html: heading }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}
        </div>

        {steps.length > 0 && (
          <div className="grid grid-cols-1 border-t border-(--color-dark)/20 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
                <motion.article
                  key={`${step.number || "counter"}-${index}`}
                  className="min-w-0 border-b border-(--color-dark)/20 py-8 sm:px-6 sm:[&:nth-child(2n)]:border-l lg:border-b-0 lg:px-6 lg:[&:not(:nth-child(4n+1))]:border-l lg:[&:nth-child(2n)]:border-l"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                >
                  <p className="ff-larken break-words text-[36px] font-medium leading-none text-(--color-body) md:text-[52px] xl:text-[64px]">
                    {formatStepNumber(step.number, index)}
                  </p>

                  {step.suffix && (
                    <h3 className="mt-6 mb-4 break-words text-[18px] font-normal leading-[1.25] text-(--color-body)">
                      {step.suffix}
                    </h3>
                  )}

                  {step.short_text && (
                    <div
                      className={`text-[14px] font-light leading-[1.55] text-(--color-body) [&_p]:mb-4 [&_p:last-child]:mb-0 ${
                        step.suffix ? "" : "mt-6"
                      }`}
                      dangerouslySetInnerHTML={{ __html: step.short_text }}
                    />
                  )}
                </motion.article>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
