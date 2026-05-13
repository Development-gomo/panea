// src/components/sections/Overview.jsx

"use client";

import { DEFAULT_LANG } from "@/config";
import ContactForm from "../contact-form/ContactForm";

export default function Contactform({ data }) {
  if (!data) return null;
  const { sub_heading, heading, short_text, select_form } = data;

  return (
    <>
      <section
        id="next"
        className="about-section py-15 md:py-30 web-width px-6"
      >
        {sub_heading && (
          <div className="flex items-center gap-2 mb-2 md:mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
            <span className="subheading-label uppercase">{sub_heading}</span>
          </div>
        )}
        {heading && (
          <h2
            className="section-heading mb-6 md:mb-14"
            dangerouslySetInnerHTML={{ __html: heading }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
          <div>
            {short_text && (
              <div
                className="max-w-[490px] mb-6"
                dangerouslySetInnerHTML={{ __html: short_text }}
              />
            )}
          </div>
          <div>
            <ContactForm formId={select_form} lang={DEFAULT_LANG} />
          </div>
        </div>
      </section>
    </>
  );
}
