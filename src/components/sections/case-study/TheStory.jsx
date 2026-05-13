"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Quote from "../../../../public/quote-icon.png";

export default function StorySection({ data }) {
  if (!data) return null;

  const {
    sub_heading,
    heading,
    content_heading,
    short_text,
    review_text,
    review_by,
    section_image,
  } = data;

  return (
    <>
      {" "}
      <section className="py-15 md:py-30 web-width px-6">
        {/* Subheading with dot */}
        {sub_heading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
            <span className="subheading-label uppercase">{sub_heading}</span>
          </div>
        )}

        {/* Main Heading */}
        {heading && (
          <div
            className="section-heading mb-8 md:mb-14 max-w-[990px]"
            dangerouslySetInnerHTML={{ __html: heading }}
          />
        )}

        {/* Two-Column Layout: Content + Quote */}
        <div className="flex flex-col lg:flex-row md:gap-25">
          {/* LEFT META COLUMN */}
          <div className="md:w-[35%]"></div>
          <div className="md:w-[65%]">
            {content_heading && (
              <div
                className="content-heading mb-6 max-w-[560px]"
                dangerouslySetInnerHTML={{ __html: content_heading }}
              />
            )}
            {short_text && (
              <div
                className="body-text max-w-[560px] mb-8 md:mb-10"
                dangerouslySetInnerHTML={{ __html: short_text }}
              />
            )}
            {review_text && (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-[#00D084] max-w-[630px] text-white p-6 md:p-8 rounded-lg"
              >
                <p className="text-2xl">
                    <Image src={Quote} width={24} height={24} alt="Quote Icon" className="block mb-3" />
                    {review_text}
                </p>
                {review_by && (
                  <p className="text-sm mt-5"><span className="h-2 w-2 rounded-full bg-white inline-block mr-2"></span> {review_by}</p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Optional Image Section */}
      </section>
      {section_image && (
        <section className="image-breaker">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-[400px] lg:h-[450px]  overflow-hidden"
          >
            <img
              src={section_image.url}
              alt="Story image"
              className="object-cover w-full h-full"
            />
          </motion.div>
        </section>
      )}
    </>
  );
}
