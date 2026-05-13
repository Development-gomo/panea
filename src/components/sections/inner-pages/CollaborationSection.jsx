"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const CollaborationSection = ({ data }) => {
  const {
    sub_heading,
    heading,
    image,
    content_heading,
    logo,
    short_text,
    cta_text,
    cta_url,
  } = data;

  return (
    <section className="bg-(--color-brand) text-white">
      <div className="lg:flex md:gap-4 md:gap-12 py-15 md:py-30 web-width px-6">
        {/* Sub Heading */}
        <div className="lg:w-[45%]">
          {sub_heading && (
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
              <span className="subheading-label uppercase">
                {sub_heading}
              </span>
            </div>
          )}

          {heading && <h2 className="section-heading text-white mb-6" dangerouslySetInnerHTML={{ __html: heading }} />}
        </div>
        <div className="lg:w-[55%]">
          {/* Image */}
          {image && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-[300px] rounded-lg overflow-hidden mb-14"
            >
              <Image
                src={image.url}
                alt="Collaboration image"
                fill
                className="object-cover"
              />
            </motion.div>
          )}

          <div className="div md:flex gap-10 mb-8">
          {/* Content Heading */}
          {content_heading && (
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="content-heading text-white"
            >
              {content_heading}
            </motion.h2>
          )}
           {logo && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-full inline-block  mt-6 md:mt-0 md:flex items-center justify-center p-6"
            >
              <Image
                src={logo.url}
                alt="Collaboration image"
                width={144}
                height={120}
                className="object-contain"
              />
            </motion.div>
          )}
            </div>
          {/* Short Text */}
          {short_text && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className=" max-w-3xl [&_p_a]:text-[var(--color-accent)]"
              dangerouslySetInnerHTML={{ __html: short_text }}
            />
          )}

          {/* CTA Button */}
          {cta_text && cta_url && (
            <motion.a
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              href={cta_url}
              className="mt-8 inline-block py-3 px-6 bg-(--color-accent) text-white text-lg font-semibold rounded-full hover:bg-[var(--color-accent-dark)] transition duration-300"
            >
              {cta_text}
            </motion.a>
          )}
        </div>
      </div>
    </section>
  );
};

export default CollaborationSection;
