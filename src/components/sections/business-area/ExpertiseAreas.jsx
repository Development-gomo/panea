"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const AUTO_ROTATE_DELAY = 5000;

function getImageUrl(item) {
  return (
    item?.image?.url ||
    item?.image?.sizes?.large ||
    item?.image_url ||
    null
  );
}

function getExpertiseItems(data) {
  const rows = data?.expertise_items || [];

  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => row?.expertise_item || row?.item || row)
    .map((item) => ({
      ...item,
      item_title: item?.item_title || item?.title || "",
      item_content: item?.item_content || item?.content || "",
      image_url: getImageUrl(item),
    }))
    .filter((item) => item.item_title);
}

export default function BusinessAreaExpertiseAreas({ data }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const sectionData = data || {};
  const { text_above_title, title } = sectionData;
  const expertiseItems = getExpertiseItems(sectionData);
  const activeItem = expertiseItems[activeIndex] || expertiseItems[0] || {};
  const activeImage = activeItem.image_url;

  useEffect(() => {
    if (!expertiseItems.length || isPaused || expertiseItems.length <= 1) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % expertiseItems.length);
    }, AUTO_ROTATE_DELAY);

    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, expertiseItems.length]);

  if (!data || !expertiseItems.length) return null;

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

        <motion.div
          className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] md:gap-12 lg:gap-[80px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsPaused(false);
              }
            }}
          >
            <ul>
              {expertiseItems.map((item, index) => {
                const isActive = index === activeIndex;
                const itemNumber =
                  item.item_number !== undefined && item.item_number !== null
                    ? String(item.item_number).padStart(2, "0")
                    : String(index + 1).padStart(2, "0");

                return (
                  <li key={`${item.item_title}-${index}`}>
                    <button
                      type="button"
                      className="grid w-full cursor-pointer grid-cols-[34px_minmax(0,1fr)] gap-4 border-b border-(--color-dark)/20 py-5 text-left focus-visible:outline-none md:grid-cols-[44px_minmax(0,1fr)]"
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => setActiveIndex(index)}
                      aria-pressed={isActive}
                    >
                      <span
                        className={`ff-larken pt-1 text-[14px] font-light italic leading-none text-(--color-body) transition-opacity duration-300 ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {itemNumber}
                      </span>

                      <span>
                        <span className="ff-larken block text-[28px] font-normal leading-[1.2] text-(--color-body) transition-colors duration-300 md:text-[34px] lg:text-[42px]">
                          {item.item_title}
                        </span>

                        {isActive && item.item_content && (
                          <motion.span
                            key={`${item.item_title}-content`}
                            className="mt-3 block max-w-[560px] text-[15px] font-light leading-[1.55] text-(--color-body) md:text-[16px] [&_p]:mb-0"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            dangerouslySetInnerHTML={{ __html: item.item_content }}
                          />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-[7px] bg-(--color-body)/10 md:min-h-[420px] lg:min-h-[500px]">
            {activeImage ? (
              <Image
                key={activeImage}
                src={activeImage}
                alt={activeItem.image?.alt || activeItem.item_title || ""}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-opacity duration-500"
              />
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}