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

function getGalleryImages(rows) {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => row?.image || row)
    .map((image) => ({
      image,
      url: getImageUrl(image),
      alt: image?.alt || image?.title || "",
    }))
    .filter((item) => item.url);
}

function getMasonryClass(index) {
  const positions = [
    "col-span-2 row-span-2 lg:col-start-1 lg:row-start-1",
    "lg:col-start-3 lg:row-start-1",
    "lg:col-start-4 lg:row-start-1",
    "lg:col-start-4 lg:row-start-2",
    "row-span-2 lg:col-start-3 lg:row-start-2",
    "lg:col-start-1 lg:row-start-3",
    "lg:col-start-2 lg:row-start-3",
    "lg:col-start-4 lg:row-start-3",
  ];

  return positions[index] || "";
}

export default function ProjectGallery({ data }) {
  if (!data) return null;

  const { text_above_title, heading, gallery_images } = data;
  const images = getGalleryImages(gallery_images);

  if (!text_above_title && !heading && images.length === 0) return null;

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

        {images.length > 0 && (
          <div className="grid auto-rows-[130px] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[190px] lg:grid-cols-4 lg:auto-rows-[190px] xl:auto-rows-[250px]">
            {images.map((item, index) => (
              <motion.figure
                key={`${item.url}-${index}`}
                className={`relative overflow-hidden rounded-[10px] bg-[#E5DED4] ${getMasonryClass(index)}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, calc(100vw - 48px)"
                  className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
