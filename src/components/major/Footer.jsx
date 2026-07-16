// src/components/major/Footer.jsx

import React from "react";
import { getThemeOptions } from "@/lib/api";
import { DEFAULT_LANG } from "@/config";
import ContactForm from "@/components/sections/contact-form/ContactForm";

const FOOTER_FORM_IDS = {
  sv: 2453,
  en: 2454,
};

// Helpers
function stripHtml(text = "") {
  return text
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLinksFromHtml(html) {
  if (!html) return [];
  const matches = Array.from(
    html.matchAll(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gim),
  );

  return matches
    .map((m) => ({
      href: m[1] || "#",
      label: stripHtml(m[2]) || "Link",
    }))
    .filter((item) => item.label);
}

// Removes block-level structural tags that WP sometimes leaks into widget HTML
// while keeping safe inline tags (<a>, <strong>, <em>, <span>, etc.)
function sanitizeLineHtml(html = "") {
  return html
    .replace(
      /<\/?(p|div|section|article|aside|header|footer|main|nav|ul|ol|li|h[1-6]|blockquote|figure|figcaption)\b[^>]*>/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function extractOfficesFromHtml(html) {
  if (!html) return [];
  const normalized = html.replace(/\\n/g, "");
  const blocks = [];
  const regex = /<strong>(.*?)<\/strong>([\s\S]*?)(?=<strong>|$)/gi;
  let match;

  while ((match = regex.exec(normalized)) !== null) {
    const title = stripHtml(match[1]);
    const lines = match[2]
      .split(/<br\s*\/?>/i)
      .map((line) => sanitizeLineHtml(line))
      .filter(Boolean);

    if (title) blocks.push({ title, lines });
  }

  return blocks;
}

export default async function Footer({ lang = DEFAULT_LANG }) {
  // Fetch WP theme options + footer widgets
  const [themeOptions] = await Promise.all([getThemeOptions(lang)]);

  const footerLogo = themeOptions?.footer?.footer_logo;
  const footer_column_1 = themeOptions?.footer?.footer_column_1 || {};
  const footer_column_2 = themeOptions?.footer?.footer_column_2 || {};
  const footer_column_3 = themeOptions?.footer?.footer_column_3 || {};
  const footer_column_4 = themeOptions?.footer?.footer_column_4 || {};
  const footer_column_5 = themeOptions?.footer?.footer_column_5 || {};
  const copyrightText = themeOptions?.footer?.copyrights_text || {};

  return (
    <>
      {/* footer logo top */}
      <footer className="bg-[#1f1f1f] text-white overflow-hidden">
        <div className="web-width mx-auto flex justify-center overflow-hidden px-6 pt-[60px]">
          {footerLogo && (
            <img
              src={footerLogo.url}
              alt="Footer Logo"
              className="w-full h-auto object-contain opacity-90"
            />
          )}
        </div>
       {/* footer_column_1 */}   
        <div className="web-width mx-auto px-6 pt-12 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-10">
              <div>
                {footer_column_1.column_one_heading && (
                  <h4 className="text-white text-[20px] font-[300] leading-normal text-lg mb-5">
                    {footer_column_1.column_one_heading}
                  </h4>
                )}
                <ul className="space-y-3 text-sm text-[#F2EBE2] text-[16px] font-normal leading-normal">
                  {footer_column_1?.links?.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.url}
                        className="text-white/70 transition-colors hover:text-white"
                      >
                        {item.link_text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* footer_column_2 */}   
              <div>
                {footer_column_2.column_two_heading && (
                  <h4 className="text-white text-[20px] font-[300] leading-normal text-lg mb-5">
                    {footer_column_2.column_two_heading}
                  </h4>
                )}
                <ul className="space-y-3 text-sm text-[#F2EBE2] text-[16px] font-normal leading-normal">
                  {footer_column_2?.links?.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.url}
                        className="text-white/70 transition-colors hover:text-white"
                      >
                        {item.link_text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

               {/* footer_column_3 */}    
              <div>
                {footer_column_3.column_three_heading && (
                  <h4 className="text-white text-[20px] font-[300] leading-normal text-lg mb-5">
                    {footer_column_3.column_three_heading}
                  </h4>
                )}
                <ul className="space-y-3 text-sm text-[#F2EBE2] text-[16px] font-normal leading-normal">
                  {footer_column_3?.links?.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.url}
                        className="text-white/70 transition-colors hover:text-white"
                      >
                        {item.link_text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* footer_column_4 */}
              <div>
                {footer_column_4.column_four_heading && (
                  <h4 className="text-white text-[20px] font-[300] leading-normal text-lg mb-5">
                    {footer_column_4.column_four_heading}
                  </h4>
                )}
                <div className="space-y-5 text-[16px] font-normal leading-normal text-white/70 [&_a]:text-white/70 [&_a]:transition-colors [&_a:hover]:text-white">
                   
                   {footer_column_4?.mobile_no && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: footer_column_4?.mobile_no,
                      }}
                    />
                    )}    

                    {footer_column_4?.email_id && (
                    <div className="text-[16px] font-normal leading-normal text-white/70"
                      dangerouslySetInnerHTML={{
                        __html: footer_column_4?.email_id,
                      }}
                    />
                    )}

                    {footer_column_4?.visiting_address && (
                    <div className="mb-5 text-[16px] font-normal leading-normal text-white/70"
                      dangerouslySetInnerHTML={{
                        __html: footer_column_4?.visiting_address,
                      }}
                    />
                    )}

                    {footer_column_4?.postal_address && (
                    <div
                      className="mb-5 text-[16px] font-normal leading-normal text-white/70"
                      dangerouslySetInnerHTML={{
                        __html: footer_column_4?.postal_address,
                      }}
                    />
                    )}
                  
                </div>
              </div>
            </div>
            
            {/* footer_column_5 */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                {footer_column_5.column_five_heading && (
                  <h3 className="ff-larken text-4xl md:text-5xl leading-tight text-[#B8D1D1] font-light max-w-[500px]">
                    {footer_column_5.column_five_heading}
                  </h3>
                )}
                <ContactForm
                  formId={FOOTER_FORM_IDS[lang] || FOOTER_FORM_IDS[DEFAULT_LANG]}
                  lang={lang}
                  variant="footer"
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mt-8">
                <div className="flex items-center gap-5">
                  {footer_column_5?.iso_logos?.map((item, index) => (
                    <img
                      key={index}
                      src={item.logo}
                      alt=""
                      className="h-20 w-auto object-contain"
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {footer_column_5?.social_media?.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={item.media_logo}
                        alt=""
                        className="w-10 h-10 object-contain"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright section */}
        <div className="ff-larken bg-[#A68AA4] text-[16px] font-normal leading-normal text-[#1E2E31]">
          <div className="web-width mx-auto grid grid-cols-1 items-center gap-4 px-6 py-[21px] text-sm md:grid-cols-3">
            {copyrightText?.column_one_text && (
              <p className="text-center md:text-left">{copyrightText.column_one_text}</p>
            )}
            {copyrightText?.column_two_text && (
              <p className="text-center">{copyrightText.column_two_text}</p>
            )}
            <div className="flex items-center justify-center gap-3 md:justify-end">
            {copyrightText?.column_three_text && (
              <div
                dangerouslySetInnerHTML={{
                  __html: copyrightText?.column_three_text,
                }}
              />
            )}    
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
