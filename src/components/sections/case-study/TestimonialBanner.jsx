"use client";

import Image from "next/image";

export default function TestimonialBanner({ data }) {
  if (!data) return null;

  const { bg_image, heading, testimonial, name, person_organization } = data;

  return (
    <section className="relative w-full h-[560px] md:h-[620px] overflow-hidden bg-black">
      {/* BACKGROUND IMAGE */}
      {bg_image?.url && (
        <Image
          src={bg_image.url}
          alt="Testimonial background"
          fill
          priority
          className="object-cover"
        />
      )}

      {/* DARK OVERLAY (matches reference) */}
      {/* <div className="absolute inset  -0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" /> */}

      {/* CONTENT */}
      <div className="relative z-10 h-full">
        <div className="web-width px-6 h-full flex flex-col justify-between py-15 md:py-16">
          {/* TOP RIGHT HEADING */}
          {heading && (
            <div className="flex justify-end">
              <div
                className="
                  max-w-[660px]
                  text-right
                  text-white
                  text-[36px] md:text-[64px]
                  leading-[44px] md:leading-[72px]
                  font-serif
                "
                dangerouslySetInnerHTML={{ __html: heading }}
              />
            </div>
          )}

          {/* TESTIMONIAL */}
          <div className="max-w-[700px]">
            {testimonial && (
              <blockquote className="text-white content-heading mb-8">
                “{testimonial}”
              </blockquote>
            )}

            {/* AUTHOR */}
            <div className="text-white font-bold m-1">
              {name && <p className="font-bold">{name}</p>}
            </div>
            {person_organization && (
            <div className="flex items-start gap-2">
              {/* ACCENT DOT */}
              <span className="mt-2 h-2 w-2 rounded-full bg-(--color-accent)"></span>
              
                <p className="text-white text-sm">{person_organization}</p>
            </div>
             )}
          </div>
        </div>
      </div>
    </section>
  );
}
