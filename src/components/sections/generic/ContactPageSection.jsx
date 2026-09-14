"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import ContactForm from "../contact-form/ContactForm";
import PhoneIcon from "../../../../public/p-ph.png";
import PinIcon from "../../../../public/p-pin.png";

function postId(item) {
  return typeof item === "object" ? item?.ID || item?.id : item;
}

function repeaterRows(rows) {
  if (!rows) return [];
  return Array.isArray(rows) ? rows : [rows];
}

function getLocationRows(locationData) {
  const phones = repeaterRows(locationData?.phone_number)
    .map((row) => ({ type: "phone", html: row?.phone_number || "" }))
    .filter((row) => row.html);
  const addresses = repeaterRows(locationData?.address)
    .map((row) => ({ type: "address", html: row?.address || "" }))
    .filter((row) => row.html);

  return [...phones, ...addresses];
}

export default function GenericContactPageSection({ data, locationData, lang }) {
  const { text_above_title_copy, title, select_form, cform_title } = data || {};
  const formId = postId(select_form);
  const locationTitle = locationData?.title || "";
  const locationRows = getLocationRows(locationData);

  const formBoxRef = useRef(null);
  const [locationBoxHeight, setLocationBoxHeight] = useState(null);

  useEffect(() => {
    const formBox = formBoxRef.current;
    if (!formBox) return undefined;

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updateHeight = () => {
      setLocationBoxHeight(desktopQuery.matches ? formBox.offsetHeight : null);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(formBox);
    desktopQuery.addEventListener("change", updateHeight);

    return () => {
      resizeObserver.disconnect();
      desktopQuery.removeEventListener("change", updateHeight);
    };
  }, [formId]);

  if (!formId && !locationTitle && locationRows.length === 0) return null;

  return (
    <section className="w-full pt-[60px] md:pt-[120px]">
      <div className="web-width-sm mx-auto px-6">
        <div className="mb-10 flex flex-col items-center text-center md:mb-16">
          {text_above_title_copy && (
            <motion.p
              className="ff-larken mb-4 text-[16px] font-light leading-normal text-(--color-body)"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {text_above_title_copy}
            </motion.p>
          )}

          {title && (
            <motion.div
              className="section-heading h2 max-w-[920px] text-2xl font-regular leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px]"
              dangerouslySetInnerHTML={{ __html: title }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
          {formId && (
            <motion.div
              ref={formBoxRef}
              className="rounded-[10px] bg-(--color-body) p-12 text-white"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <ContactForm
                formId={formId}
                lang={lang}
                variant="solution"
                showTitle
                formTitle={cform_title}
                submitLabel={lang === "sv" ? "Skicka förfrågan" : "Submit form"}
              />
            </motion.div>
          )}

          {(locationTitle || locationRows.length > 0) && (
            <motion.div
              className="rounded-[10px] border border-[#1E2E31]/16 pr-3 md:pr-4"
              style={locationBoxHeight ? { height: `${locationBoxHeight}px` } : undefined}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              viewport={{ once: true }}
            >
              <div className="panea-thin-scrollbar px-6 pt-12 pb-6 md:px-8 md:pb-8 lg:h-full lg:overflow-y-auto">
                {locationTitle && (
                  <h3 className="ff-larken mb-6 text-[26px] font-light leading-tight text-(--color-body)">
                    {locationTitle}
                  </h3>
                )}

                <div className="space-y-6">
                  {locationRows.map((row, index) => (
                    <div
                      key={`${row.type}-${index}`}
                      className="flex items-start gap-4"
                    >
                      <Image
                        src={row.type === "phone" ? PhoneIcon : PinIcon}
                        alt=""
                        width={22}
                        height={22}
                        className="mt-1 h-auto w-[18px] shrink-0 md:w-[22px]"
                      />
                      <div
                        className="body-text text-[15px] leading-[1.55] text-(--color-body) [&_p]:mb-2 [&_p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: row.html }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
