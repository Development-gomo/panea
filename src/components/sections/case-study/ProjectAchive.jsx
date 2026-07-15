"use client";

import { motion } from "framer-motion";

function firstValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== ""
  );
}

function getCards(data) {
  const cards = firstValue(
    data?.number_layout,
    data?.achievements,
    data?.project_achievements,
    data?.achievement_cards,
    data?.cards,
    data?.counters
  );

  return Array.isArray(cards) ? cards : [];
}

export default function ProjectAchive({ data }) {
  if (!data) return null;

  const eyebrow = firstValue(data.text_above_title, data.eyebrow, data.label);
  const heading = firstValue(data.heading, data.title);
  const intro = firstValue(
    data.short_information,
    data.intro_text,
    data.introduction,
    data.content,
    data.description
  );
  const cards = getCards(data);

  if (!eyebrow && !heading && !intro && cards.length === 0) return null;

  return (
    <section
      id="project-achive"
      tabIndex={-1}
      className="w-full scroll-mt-6 py-[40px] outline-none md:py-[60px]"
    >
      <div className="web-width mx-auto px-6">
        <div className="overflow-hidden rounded-[10px] bg-[#BDD4D5] p-6 text-(--color-body) sm:p-8 md:px-[60px] md:py-[80px]">
          <div className="mx-auto mb-12 flex max-w-[760px] flex-col items-center text-center md:mb-14">
            {eyebrow && (
              <motion.p
                className="ff-larken mb-4 text-[14px] font-light leading-normal text-(--color-body) md:text-[16px]"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {eyebrow}
              </motion.p>
            )}

            {heading && (
              <motion.div
                className="max-w-[720px] break-words text-[26px] font-normal leading-[1.2] text-(--color-body) sm:text-[28px] md:text-[34px] lg:text-[38px] [&_p]:m-0"
                dangerouslySetInnerHTML={{ __html: heading }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-[minmax(180px,0.9fr)_repeat(3,minmax(0,1fr))]">
            {intro && (
              <motion.div
                className="flex items-start pr-2 text-[14px] font-light leading-[1.5] text-(--color-body) md:col-span-2 lg:col-span-1 lg:pt-1 xl:pr-8 [&_p]:mb-4 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: intro }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                viewport={{ once: true }}
              />
            )}

            {cards.map((card, index) => {
              const cardTitle = firstValue(card.title, card.heading);
              const cardDescription = firstValue(
                card.short_description,
                card.description,
                card.short_information,
                card.short_text,
                card.content
              );
              const number = firstValue(card.number, card.value, card.stat);
              const suffix = firstValue(card.suffix, card.symbol);
              const numberLabel = firstValue(
                card.short_tag_line,
                card.number_label,
                card.stat_label,
                card.bottom_text,
                card.label
              );

              return (
                <motion.article
                  key={`${cardTitle || "achievement"}-${index}`}
                  className="flex min-w-0 flex-col rounded-[9px] border border-[#1E2E31]/25 px-5 py-6 sm:px-6 md:min-h-[320px]"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                >
                  <div>
                    {cardTitle && (
                      <h3 className="mb-3 text-[20px] font-normal leading-[1.25] text-(--color-body)">
                        {cardTitle}
                      </h3>
                    )}

                    {cardDescription && (
                      <div
                        className="break-words pb-8 text-[15px] font-normal leading-[1.45] text-(--color-body) sm:text-[16px] [&_img]:h-auto [&_img]:max-w-full [&_p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: cardDescription }}
                      />
                    )}
                  </div>

                  {(number || suffix || numberLabel) && (
                    <div className="mt-auto pt-8">
                      {(number || suffix) && (
                        <p className="ff-larken flex min-w-0 items-end text-[52px] font-normal leading-[0.9] text-(--color-body) sm:text-[64px] md:text-[58px] lg:text-[50px] xl:text-[58px]">
                          <span className="min-w-0 break-words">{number}</span>
                          {suffix && (
                            <span className="mb-1 shrink-0 text-[38px] leading-none sm:text-[48px] lg:text-[40px] xl:text-[48px]">
                              {suffix}
                            </span>
                          )}
                        </p>
                      )}

                      {numberLabel && (
                        <p className="mt-3 text-[14px] font-normal leading-[1.3] text-(--color-body)">
                          {numberLabel}
                        </p>
                      )}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
