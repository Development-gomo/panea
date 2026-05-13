"use client";

import Image from "next/image";
import Link from "next/link";
import ArrowSvg from "../../../../public/right-arrow.svg";

export default function WhyChoose({ data }) {
  const {
    bg_image,
    sub_heading,
    heading,
    short_text,
    cta_text,
    cta_url,
    key_solutions = [],
  } = data;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      {bg_image?.url && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={bg_image.url}
            alt="Why choose background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/00 -z-10" />
        </div>
      )}

      <div className="web-width px-6 py-15 md:py-[145px] text-white">
        <div className="grid lg:grid-cols-2 items-center">
          {/* LEFT CONTENT */}
          <div>
            {sub_heading && (
              <div className="flex items-center gap-2 mb-2 md:mb-4">
                <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
                <span className="subheading-label text-white ">
                  {sub_heading}
                </span>
              </div>
            )}

            {/* MAIN HEADING */}
            <div
              className="section-heading text-white mb-6"
              dangerouslySetInnerHTML={{ __html: heading }}
            />

            {/* DESCRIPTION */}
            {short_text && (
              <div
                className="text-white max-w-[420px] mb-6"
                dangerouslySetInnerHTML={{ __html: short_text }}
              />
            )}

            {/* CTA BUTTON */}
            {cta_text && cta_url && (
              <Link
                href={cta_url}
                className="
                gap-3 group relative inline-flex items-center
                rounded-sm bg-(--color-brand) px-6 py-4 text-white
                transition-all duration-300 hover:bg-(--color-brand)
                w-[154px] overflow-hidden select-none"
              >
                {/* DOT */}
                <span className="relative w-6 flex items-center justify-center">
                  <span
                    className="
                    absolute h-2 w-2 rounded-full bg-[#27E0C0]
                    transition-all duration-300 ease-out
                    group-hover:opacity-0 group-hover:-translate-x-1
                  "
                  ></span>
                </span>

                {/* TEXT */}
                <span
                  className="
                  flex-1 text-[16px] leading-none whitespace-nowrap
                  transition-all duration-300 ease-out
                  group-hover:-translate-x-3">
                  {cta_text}
                </span>

                {/* ARROW */}
                <span className="relative w-4 flex items-center justify-center">
                  <span
                    className="w-4 absolute opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:-translate-x-1">
                    <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
                  </span>
                </span>
              </Link>
            )}
          </div>

          {/* RIGHT GRID */}
          <div className="grid md:grid-cols-2 gap-4 mt-8 lg:mt-0">
            {key_solutions.map((item, index) => (
              <div key={index} className="lg:max-w-[312px] p-6 lg:px-8 lg:py-8 rounded-sm bg-(--color-brand)">
                {item.solution_icons?.url && (
                  <Image
                    src={item.solution_icons.url} alt={item.heading || "icon"} width={32} height={32} className="mb-8"/>
                )}
                {item.heading && (
                  <p className="text-[24px] font-[600] mb-3">{item.heading}</p>
                )}
                {item.short_text && (
                  <p className="text-white font-[500]">{item.short_text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
