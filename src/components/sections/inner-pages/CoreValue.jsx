"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Seperator from "../../../../public/seperator.svg";

export default function CoreValueSection({ data }) {
  const { sub_heading, core_value = [] } = data || {};
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const itemRefs = useRef([]);

  // Duplicate items for seamless looping
  const items = [...core_value, ...core_value, ...core_value];

  useEffect(() => {
    if (!core_value.length) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId;
    let scrollPos = 0;
    const scrollSpeed = 1.2; // pixels per frame

    // Get the width of one set of items
    const singleSetWidth = scrollContainer.scrollWidth / 3;

    const animate = () => {
      scrollPos += scrollSpeed;

      // Reset to beginning when we've scrolled one full set
      if (scrollPos >= singleSetWidth) {
        scrollPos = 0;
      }

      scrollContainer.scrollLeft = scrollPos;

      // Calculate which item is currently active (in center)
      const containerCenter = scrollContainer.offsetWidth / 2;
      const scrollCenter = scrollPos + containerCenter;

      // Find which item is closest to center
      let closestIndex = 0;
      let closestDistance = Infinity;

      itemRefs.current.forEach((item, i) => {
        if (item && i < core_value.length) {
          const itemCenter = item.offsetLeft + item.offsetWidth / 2;
          const distance = Math.abs(scrollCenter - itemCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        }
      });

      setActiveIndex(closestIndex);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [core_value.length]);

  if (!core_value.length) return null;

  const activeItem = core_value[activeIndex];

  return (
    <section className="relative overflow-hidden bg-(--color-brand) text-white">
      <div className="pt-15 md:pt-30 web-width px-6">
        {/* Sub heading */}
        {sub_heading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)" />
            <span className="subheading-label">{sub_heading}</span>
          </div>
        )}
      </div>
      <div className="full-width pb-15 md:pb-30 px-6 md:px-0">
        {/* Marquee slider */}
        <div className="relative mb-6">
          {/* Left fade gradient */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#151B5D] to-transparent" />

          {/* Right fade gradient */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#151B5D] to-transparent" />

          {/* Scrolling container */}
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-hidden whitespace-nowrap scrollbar-hide md:gap-10"
            style={{ scrollBehavior: "auto" }}
          >
            {items.map((item, i) => {
              const originalIndex = i % core_value.length;
              const isActive = originalIndex === activeIndex;

              return (
                <div
                  key={`${item.heading}-${i}`}
                  ref={(el) => {
                    if (i < core_value.length) {
                      itemRefs.current[i] = el;
                    }
                  }}
                  className="flex shrink-0 items-center gap-4 md:gap-10"
                >
                  {/* Dot indicator */}
                  <span
                    className={`h-8 w-8 shrink-0 rounded-full transition-all duration-300 ${
                      isActive ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    <Image
                      src={Seperator}
                      alt="Seperator"
                      width={30}
                      height={30}
                    />
                  </span>

                  {/* Heading text */}
                  <h2
                    className={`text-[clamp(2.5rem,10vw,7rem)] font-semibold uppercase leading-none transition-all duration-500 core-text ${
                      isActive ? "text-[var(--color-accent)]" : "text-white/20"
                    }`}
                  >
                    {item.heading}
                  </h2>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description - shows for active item */}
        <div className="web-width flex justify-end">
          <div
            key={activeIndex}
            className="max-w-[400px] md:mr-[250px] animate-fade-in md:flex gap-4"
          >
            <p className="mb-6 md:mb-0 text-[#00FEC3]">
              ({String(activeIndex + 1).padStart(2, "0")})
            </p>

            <p className="text-base leading-relaxed text-white">
              {activeItem?.text_area}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </section>
  );
}
