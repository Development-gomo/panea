"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

function AnimatedNumber({ value, duration = 2000 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const target = parseFloat(value) || 0;
    const isDecimal = value.toString().includes(".");
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(isDecimal ? parseFloat(current.toFixed(1)) : Math.round(current));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [inView, value, duration]);

  return <span ref={ref}>{display}</span>;
}

export default function BusinessAreaCounterSection({ data }) {
  if (!data) return null;

  const {
    text_above_title,
    title,
    image,
    content,
    image_position,
    counters = [],
  } = data;

  const imageLeft = image_position === "left";
  const hasBody = image?.url || content || counters.length > 0;

  return (
    <section className="w-full pt-[60px] pb-0 md:pt-[120px]">
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
              className="section-heading h2 max-w-[920px] text-2xl font-regular leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px]"
              dangerouslySetInnerHTML={{ __html: title }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}
        </div>

        {hasBody && (
          <motion.div
            className={`flex flex-col gap-8 md:gap-12 lg:gap-[80px] ${
              imageLeft ? "md:flex-row" : "md:flex-row-reverse"
            } items-start`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {image?.url && (
              <div className="w-full shrink-0 md:w-1/2">
                <Image
                  src={image.url}
                  alt={image.alt || ""}
                  width={560}
                  height={420}
                  className="h-auto w-full rounded-sm object-cover"
                />
              </div>
            )}

            <div className="w-full md:w-1/2">
              {content && (
                <div
                  className="body-text space-y-4 text-(--color-body) [&_p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}

              {counters.length > 0 && (
                <>
                  <hr className="mt-8 mb-6 border-t border-(--color-dark)/20 md:mt-10" />

                  <div className="grid grid-cols-2 gap-x-6 gap-y-8 ff-larken sm:grid-cols-3">
                    {counters.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <p className="text-[36px] font-normal leading-none text-(--color-body) md:text-[44px] lg:text-[54px]">
                          <AnimatedNumber value={item.number} />
                          {item.suffix && <span>{item.suffix}</span>}
                        </p>
                        {item.short_text && (
                          <p className="mt-4 text-base font-light text-(--color-body)">
                            {item.short_text}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
