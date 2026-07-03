// src/components/sections/HomeCounter.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { DEFAULT_LANG } from "@/config";
import RightArrow from "../../../../public/right-arrow.svg";

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

export default function HomeCounter({ data, lang = DEFAULT_LANG }) {
  if (!data) return null;

  const {
    text_above_title,
    title,
    cta_text,
    cta_url,
    image,
    content,
    image_position,
    counters = [],
  } = data;

  const imageLeft = image_position === "left";

  return (
    <section className="w-full pt-[60px] md:pt-[120px] pb-0">
      <div className="web-width-sm mx-auto px-6">

        {/* TOP — label + title + CTA */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-16">
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
              className="section-heading h2 text-(--color-body) max-w-[920px] text-2xl md:text-3xl lg:text-[36px] leading-[1.3] font-regular"
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
                {/* Text with underline that extends toward the arrow on hover */}
                <span className="relative pb-[2px]">
                  {cta_text}
                  <span className="absolute bottom-0 left-0 h-[1px] bg-(--color-dark) w-full transition-all duration-300 ease-out group-hover:w-[calc(100%+22px)]" />
                </span>
                {/* Arrow — always visible, shifts right on hover */}
                <span className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                  <Image src={RightArrow} alt="arrow" width={17} height={17} />
                </span>
              </Link>
            </motion.div>
          )}
        </div>

        {/* MIDDLE — image + content */}
        {(image?.url || content) && (
          <motion.div
            className={`flex flex-col md:flex-row ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-8 md:gap-12 lg:gap-[80px] items-start mb-5 md:mb-10`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {image?.url && (
              <div className="w-full md:w-1/2 shrink-0">
                <Image
                  src={image.url}
                  alt={image.alt || ""}
                  width={560}
                  height={420}
                  className="w-full h-auto rounded-sm object-cover"
                />
              </div>
            )}

            {content && (
              <div
                className="w-full md:w-1/2 body-text text-(--color-body) space-y-4 [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </motion.div>
        )}

        {/* DIVIDER */}
        {counters.length > 0 && (
          <hr className="border-t border-(--color-dark)/20 mb-6" />
        )}

        {/* BOTTOM — counters row */}
        {counters.length > 0 && (
          <>
            <div className="counter-grid">
              {counters.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="w-full flex flex-col md:last:items-end"
                >
                  <div className="w-full md:w-auto">
                    <p className="text-[36px] md:text-[64px] leading-none font-medium text-(--color-body) font-normal">
                      <AnimatedNumber value={item.number} />
                      {item.suffix && <span>{item.suffix}</span>}
                    </p>
                    {item.short_text && (
                      <p className="mt-4 text-base text-left text-(--color-body) font-light">{item.short_text}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <style jsx>{`
              .counter-grid {
                display: grid;
                gap: 2rem;
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }

              @media (min-width: 768px) {
                .counter-grid {
                  grid-template-columns: 332px 332px 332px minmax(0, 1fr);
                }
              }
            `}</style>
          </>
        )}
      </div>
    </section>
  );
}



