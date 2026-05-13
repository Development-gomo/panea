"use client";

import Image from "next/image";

export default function KeyProblemSection({ data }) {
  const {
    bg_image,
    sub_heading,
    heading,
    key_problem = [],
  } = data;

  return (
    <section id="key-problems" className="relative w-full overflow-hidden text-white">
      {/* BACKGROUND */}
      {bg_image?.url && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={bg_image.url}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/0" />
        </div>
      )}

      <div className="web-width px-6 py-15 md:py-30">

        {/* SUB HEADING */}
        {sub_heading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)" />
            <span className="subheading-label text-white">
              {sub_heading}
            </span>
          </div>
        )}

        {/* MAIN HEADING */}
        {heading && (
          <h2 className="section-heading mb-8 md:mb-14 max-w-[1150px]" dangerouslySetInnerHTML={{ __html: heading }} />
        )}

        {/* CARDS GRID */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {key_problem.map((item, index) => ( 
            <div
              key={index}
              className="bg-(--color-brand) rounded-sm p-6 md:p-8">
              {/* ICON */}
              {item.icon?.url && (
                <Image
                  src={item.icon.url}
                  alt={item.heading || "icon"}
                  width={40}
                  height={40}
                  className={`object-contain mb-10 md:mb-20 ${item.icon.name}`}
                />
              )}

              {/* TITLE */}
              {item.heading && (
                <p className="text-[24px] leading-[30px] font-semibold mb-3">
                  {item.heading}
                </p>
              )}

              {/* TEXT */}
              {item.short_text && (
                <p className="text-white">
                  {item.short_text}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
