"use client";

import { useState } from "react";
import Image from "next/image";
import PlusIcon from "../../../../public/plus-light.svg";

export default function Faq({ data }) {
  const { sub_heading, heading, faqs = [] } = data;
  const [openIndex, setOpenIndex] = useState(0); // first open by default

  const toggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <section className="bg-(--color-brand) text-white">
      <div className="web-width px-6 py-15 md:py-30">
        {/* SUB HEADING */}
        {sub_heading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)" />
            <span className="subheading-label">{sub_heading}</span>
          </div>
        )}

        {/* MAIN HEADING */}
        {heading && (
          <h2
            className="section-heading mb-8 md:mb-14"
            dangerouslySetInnerHTML={{ __html: heading }}
          />
        )}

        {/* FAQ LIST */}
        <div className="divide-y divide-[#91929f4d] border-t border-[#91929f4d]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index} className="py-6 md:py-8 [&:nth-last-child(1)]:pb-0">
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center gap-4 md:gap-20 text-left cursor-pointer"
                >
                  {/* NUMBER */}
                  <span className="text-[var(--color-accent)] text-sm md:text-base min-w-[30px] pt-1">
                    ({String(index + 1).padStart(2, "0")})
                  </span>

                  {/* QUESTION */}
                  <span className="flex-1 content-heading text-white">
                    {faq.question}
                  </span>

                  {/* ICON */}
                  <span className="text-[16px] leading-none">
                    <Image
                      src={PlusIcon}
                      alt="toggle icon"
                      width={16}
                      height={16}
                      className={`transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    />
                  </span>
                </button>

                {/* ANSWER */}
                {isOpen && (
                  <div className="ml-[64px] md:ml-[108px] mt-6 max-w-[1104px] text-white">
                    <div dangerouslySetInnerHTML={{ __html: faq.answers }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
