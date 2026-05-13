"use client";

import React from "react";

export default function ResultSection({ data }) {
  if (!data) return null;

  const { sub_heading, heading, counters = [] } = data;

  return (
    <section className="py-15 md:py-30 bg-white">
      <div className="web-width px-6">
        {/* SUB HEADING */}
        {sub_heading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
            <span className="subheading-label text-[#8C8FA3] uppercase">
              {sub_heading}
            </span>
          </div>
        )}

        {/* MAIN HEADING */}
        {heading && (
          <div
            className="section-heading max-w-[990px] mb-8 md:mb-14"
            dangerouslySetInnerHTML={{ __html: heading }}
          />
        )}
        <div className="flex flex-col lg:flex-row md:gap-20">
        {/* LEFT META COLUMN */}
          <div className="md:w-[25%]"></div>
          <div className="md:w-[75%]">
            {/* RESULTS GRID */}
            {counters.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {counters.map((item, index) => (
                  <div
                    key={index}
                    className="result-number bg-[#F4F4F6] rounded-lg p-8 flex flex-col justify-between gap-10 md:min-h-[260px]"
                  >
                    {/* NUMBER */}
                    <div className="relative ">
                      <span className="text-[80px] leading-[70px] font-medium">
                        {item.number}
                      </span>

                      {item.suffix && (
                        <span className="suffix-text text-[40px] leading-[40px] font-medium text-[var(--color-accent)] ml-1 absolute top-[-5px]">
                          {item.suffix}
                        </span>
                      )}
                    </div>

                    {/* DESCRIPTION */}
                    {item.short_text && (
                      <div
                        className="text-[18px] mt-6"
                        dangerouslySetInnerHTML={{ __html: item.short_text }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>
        </div>
      </div>
    </section>
  );
}
