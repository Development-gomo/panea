// src/components/major/Footer.jsx

import React from "react";
import { getThemeOptions } from "@/lib/api";
import { DEFAULT_LANG, langHref } from "@/config";

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
        <div className="w-full flex justify-center overflow-hidden pt-[60px]">
          {footerLogo && (
            <img
              src={footerLogo.url}
              alt="Footer Logo"
              className="w-full max-w-[1200px] h-auto object-contain opacity-90"
            />
          )}
        </div>
       {/* footer_column_1 */}   
        <div className="max-w-[1400px] mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-10">
              <div>
                {footer_column_1.column_one_heading && (
                  <h4 className="text-white text-[20px] font-normal leading-normal text-lg mb-5">
                    {footer_column_1.column_one_heading}
                  </h4>
                )}
                <ul className="space-y-3 text-sm text-[#F2EBE2] text-[16px] font-normal leading-normal">
                  {footer_column_1?.links?.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.url}
                        className="hover:text-white transition-colors"
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
                  <h4 className="text-white text-[20px] font-normal leading-normal text-lg mb-5">
                    {footer_column_2.column_two_heading}
                  </h4>
                )}
                <ul className="space-y-3 text-sm text-[#F2EBE2] text-[16px] font-normal leading-normal">
                  {footer_column_2?.links?.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.url}
                        className="hover:text-white transition-colors"
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
                  <h4 className="text-white text-[20px] font-normal leading-normal text-lg mb-5">
                    {footer_column_3.column_three_heading}
                  </h4>
                )}
                <ul className="space-y-3 text-sm text-[#F2EBE2] text-[16px] font-normal leading-normal">
                  {footer_column_3?.links?.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.url}
                        className="hover:text-white transition-colors"
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
                  <h4 className="text-white text-[20px] font-normal leading-normal text-lg mb-5">
                    {footer_column_4.column_four_heading}
                  </h4>
                )}
                <div className="space-y-5 text-sm text-[#F2EBE2] text-[16px] font-normal leading-normal">
                   
                   {footer_column_4?.mobile_no && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: footer_column_4?.mobile_no,
                      }}
                    />
                    )}    

                    {footer_column_4?.email_id && (
                    <div className="text-[#F2EBE2] text-[16px] font-normal leading-normal"
                      dangerouslySetInnerHTML={{
                        __html: footer_column_4?.email_id,
                      }}
                    />
                    )}

                    {footer_column_4?.visiting_address && (
                    <div className="text-[#F2EBE2] text-[16px] font-normal leading-normal mb-5"
                      dangerouslySetInnerHTML={{
                        __html: footer_column_4?.visiting_address,
                      }}
                    />
                    )}

                    {footer_column_4?.postal_address && (
                    <div
                      className="text-[#F2EBE2] text-[16px] font-normal leading-normal mb-5"
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
                  <h3 className="text-4xl md:text-5xl leading-tight text-[#B8D1D1] font-light max-w-[500px]">
                    {footer_column_5.column_five_heading}
                  </h3>
                )}
                <div className="mt-10 border-b border-white/20 flex items-center justify-between pb-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    className="bg-transparent outline-none text-white placeholder:text-white/40 w-full"
                  />
                  <button className="ml-4 text-2xl">→</button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mt-12">
                <div className="flex items-center gap-5">
                  {footer_column_5?.iso_logos?.map((item, index) => (
                    <img
                      key={index}
                      src={item.logo}
                      alt=""
                      className="w-16 h-16 object-contain opacity-80"
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
        <div className="bg-[#caaed1] text-[16px] font-normal leading-normal text-[#1E2E31]">
          <div className="max-w-[1400px] mx-auto px-6 py-[21px] flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            {copyrightText?.column_one_text && (
              <p>{copyrightText.column_one_text}</p>
            )}
            {copyrightText?.column_two_text && (
              <p>{copyrightText.column_two_text}</p>
            )}
            <div className="flex items-center gap-3">
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
