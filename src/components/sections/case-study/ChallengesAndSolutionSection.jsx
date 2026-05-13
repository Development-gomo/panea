"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ChallengesAndSolutionSection({ data }) {
  if (!data) return null;

  const {
    sub_heading,
    heading,
    short_text,
    content_heading,
    challenge_image,
    content_heading_solution,
    short_text_solution,
    solution_image,
  } = data;

  return (
    <section id="challenges-and-solution" className="py-15 md:py-30 web-width px-6">
      {/* Subheading with dot */}
      {sub_heading && (
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
          <span className="subheading-label uppercase">{sub_heading}</span>
        </div> 
      )}

      {/* Heading */}
      {heading && (
        <div
          className="section-heading mb-8 md:mb-14 max-w-[990px]"
          dangerouslySetInnerHTML={{ __html: heading }}
        />
      )}

      {/* Two-Column Layout: Left (Challenge) + Right (Solution) */}
      <div className="flex flex-col md:flex-row md:gap-4">
        {/* Left Column: Challenge */}
        {content_heading && (
          <div className="lg:w-[50%]">
          <div className="bg-[#f4f4f5] p-12 rounded-tl-lg rounded-tr-lg ">
            {content_heading && (
              <div
                className="text-[40px] leading-[1.2] mb-6"
                dangerouslySetInnerHTML={{ __html: content_heading }}
              />
            )}

            {/* Bullet points for challenge */}
            {short_text && (
              <div
                className="bullet-box"
                dangerouslySetInnerHTML={{ __html: short_text }}
              />
            )}
          </div>

          {/* Challenge Image */}
          {challenge_image && (
            <div className="relative w-full h-[300px]">
              <Image
                src={challenge_image.url}
                alt="Challenge image"
                fill
                className="object-cover rounded-bl-lg rounded-br-lg"
              />
            </div>
          )}
        </div>
        )}

        {/* Right Column: Solution */}
         {content_heading_solution && (
        <div className="lg:w-[50%] mt-6 lg:mt-0">
          <div className="bg-[#191F68] rounded-tl-lg rounded-tr-lg p-12 text-white">
            {content_heading_solution && (
              <div
                className="text-[40px] leading-[1.2] text-white mb-6"
                dangerouslySetInnerHTML={{ __html: content_heading_solution }}
              />
            )}

            {/* Bullet points for solution */}
            {short_text_solution && (
              <div
                className="bullet-box"
                dangerouslySetInnerHTML={{ __html: short_text_solution }}
              />
            )}
          </div>

          {/* Solution Image */}
          {solution_image && (
            <div className="relative w-full h-[300px]">
              <Image
                src={solution_image.url}
                alt="Solution image"
                fill
                className="object-cover rounded-bl-lg rounded-br-lg"
              />
            </div>
          )}
        </div>
         )}
      </div>
    </section>
  );
}
