// src/components/sections/Overview.jsx

"use client";

export default function LargeContent({ data }) {
  if (!data) return null;
  const { sub_heading, heading, content_section } = data;

  return (
    <>
      <section
        id="next"
        className="about-section py-15 md:py-30 web-width px-6"
      >
        {/* SUB HEADING WITH DOT */}
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
        {content_section && (
          <div
            className="privacy-text max-w-3xl m-auto"
            dangerouslySetInnerHTML={{ __html: content_section }}
          />
        )}
      </section>
    </>
  );
}
