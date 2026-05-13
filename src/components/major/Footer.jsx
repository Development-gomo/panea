// src/components/major/Footer.jsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getFooterWidgets, getThemeOptions } from "@/lib/api";
import { DEFAULT_LANG, langHref } from "@/config";

import LinkedInPng from "../../../public/linkedin.png";
import XPng from "../../../public/x.png";
import ArrowSvgB from "../../../public/right-arrow-black.png";
import RightSVG from "../../../public/right-arrow.svg";

// Map icons
const SOCIAL_ICON_MAP = {
  linkedin: LinkedInPng,
  x: XPng,
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
    html.matchAll(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gim)
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
    .replace(/<\/?(p|div|section|article|aside|header|footer|main|nav|ul|ol|li|h[1-6]|blockquote|figure|figcaption)\b[^>]*>/gi, "")
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
  const [widgets, themeOptions] = await Promise.all([
    getFooterWidgets(lang),
    getThemeOptions(lang),
  ]);

  // ================================
  //   GET IN TOUCH SECTION DATA
  // ================================
  const contactBlock = themeOptions?.get_in_touch || {};
  const {
    sub_heading,
    heading,
    short_description,
    cta_text,
    cta_url,
    column_i_text,
    column_ii_text,
    column_iii_text,
    column_i_image,
    column_ii_image,
    column_iii_image,
    right_top,
    right_bottom,
  } = contactBlock;

  // FOOTER DATA
  const quickLinks = extractLinksFromHtml(widgets?.quick_links);
  const services = extractLinksFromHtml(widgets?.services);
  const offices = extractOfficesFromHtml(widgets?.offices);

  const servicesTitle = widgets?.services_title || "Services";
  const officesTitle = widgets?.offices_title || "Offices";

  const footerLogo = themeOptions?.footer?.footer_logo;
  const copyrightText = themeOptions?.footer?.copyrights_text;

  // Social links
  const socialLinks = [];
  if (themeOptions?.social?.linkedin) {
    socialLinks.push(["linkedin", themeOptions.social.linkedin]);
  }
  if (themeOptions?.social?.x) {
    socialLinks.push(["x", themeOptions.social.x]);
  }

  const hasMainContent = quickLinks.length > 0 || services.length > 0 || offices.length > 0;
  const hasBottomRow = footerLogo || copyrightText || socialLinks.length > 0;

  return (
    <>
      <section
        id="cta-section"
        className="bg-(--color-brand) text-white pt-12 lg:pt-30 relative overflow-x-hidden lg:top-[2px]"
      >
        <div className="web-width relative px-6 flex flex-col lg:flex-row gap-8 lg:gap-[50px]">
          {/* First Column with max-width 415px */}
          <div className="max-w-[415px] w-full">
            {sub_heading && (
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
                <span className="subheading-label text-[#9192A0] uppercase">
                  {sub_heading}
                </span>
              </div>
            )}

            {heading && (
              <h2 className="section-heading text-white">{heading}</h2>
            )}

            {short_description && (
              <div className="mt-6 text-white/80 max-w-md leading-[26px]">
                {short_description}
              </div>
            )}

            {cta_text && cta_url && (
              <Link
                href={langHref(cta_url, lang)}
                className=" mt-8
                      gap-3 group relative inline-flex items-center
                      rounded-sm bg-(--color-accent) px-6 py-4 text-white
                      transition-all duration-300 hover:bg-(--color-accent)
                      w-[154px] overflow-hidden select-none
                    "
              >
                {/* LEFT DOT */}
                <span className="relative w-6 flex items-center justify-center">
                  <span
                    className="
                          absolute h-2 w-2 rounded-full bg-[#191F68]
                          transition-all duration-300 ease-out
                          group-hover:opacity-0 group-hover:-translate-x-1
                        "
                  ></span>
                </span>

                {/* TEXT */}
                <span
                  className="text-black
                        flex-1 text-[16px] leading-none
                        transition-all duration-300 ease-out
                        group-hover:-translate-x-4
                        whitespace-nowrap
                      "
                >
                  {cta_text}
                </span>

                {/* ARROW */}
                <span className="relative w-4 flex items-center justify-center">
                  <span
                    className="
                          w-4 absolute opacity-0 -translate-x-4
                          transition-all duration-300 ease-out
                          group-hover:opacity-100 group-hover:-translate-x-2
                        ">
                    <Image src={ArrowSvgB} width={13} height={13} alt="arrow" />
                  </span>
                </span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="relative">
              {column_i_text && (
                <div className="h-[195px] bg-[#272D7E] mb-[10px] md:text-[18px] rounded-sm p-3 lg:p-6 flex items-end mt-5 lg:mt-34 text-white leading-[26px]">
                  <i>{column_i_text}</i>
                </div>
              )}
              {column_i_image?.url && (
                <Image
                  src={column_i_image.url}
                  alt="right-top"
                  width={275}
                  height={130}
                  className="rounded-sm object-cover img-120"
                />
              )}
            </div>
            <div className="relative">
              {column_ii_image?.url && (
                <Image
                  src={column_ii_image.url}
                  alt="right-top"
                  width={275}
                  height={215}
                  className="mt-6 lg:mt-17 rounded-sm object-cover"
                />
              )}
              {column_ii_text && (
                <div className="h-[195px] lg:h-[175px] md:text-[18px] bg-[#272D7E] mt-[8px] rounded-sm p-3 lg:p-6 flex items-end text-white leading-[26px]">
                  <i>{column_ii_text}</i>
                </div>
              )}
            </div>
            <div className="relative">
              {column_iii_text && (
                <div className="h-[195px] lg:h-[205px] bg-[#272D7E] md:text-[18px] mt-[20px] md:mt-[13px] mb-[8px] rounded-sm p-3 lg:p-6 flex items-end text-white leading-[26px]">
                  <i>{column_iii_text}</i>
                </div>
              )}
              {column_iii_image?.url && (
                <Image
                  src={column_iii_image.url}
                  alt="right-top"
                  width={275}
                  height={215}
                  className="rounded-sm object-cover"
                />
              )}
              <div className="hidden lg:block h-[17px] bg-[#272D7E] rounded-sm  mt-[8px]"></div>
            </div>

            <div className="hidden lg:block absolute right-[-17.6%] top-[-33px] cta-fix">
              {right_top?.url && (
                <Image
                  src={right_top.url}
                  alt=""
                  width={250}
                  height={215}
                  className="rounded-sm object-cover"
                />
              )}
              <div className="h-[215px] bg-[#272D7E] rounded-sm mb-[8px]  mt-[8px]"></div>
              {right_bottom?.url && (
                <Image
                  src={right_bottom.url}
                  alt=""
                  width={250}
                  height={75}
                  className=" rounded-sm object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXISTING FOOTER SECTION
         ===================================================== */}
      <footer className="bg-(--color-brand) text-white relative z-10  border-solid border-t border-[#9293a066]">
        <div className="mx-auto w-full web-width px-6 pb-12 pt-12 md:pt-25">
          {/* ============ MAIN FOOTER CONTENT ============ */}
          {hasMainContent && (
            <div className="grid md:grid-cols-2 gap-12 pb-12">
              {/* QUICK LINKS */}
              {quickLinks.length > 0 && (
                <div>
                  <ul className="space-y-4 pb-4 max-w-96">
                    {quickLinks.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center relative group justify-between text-xl md:text-[32px] border-b border-white/10 mb-0 py-[10.5px] [&:nth-child(1)]:pt-0 footer-quick-link"
                      >
                        <Link href={langHref(item.href, lang)} className=" hover:text-white/70">
                          {item.label}
                          <Image src={RightSVG} width={19} height={19} alt="arrow" className="opacity-0 group-hover:opacity-100 absolute right-3 top-6 " />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SERVICES + OFFICES */}
              {(services.length > 0 || offices.length > 0) && (
                <div className="grid grid-cols-2 gap-10">
                  {/* SERVICES */}
                  {services.length > 0 && (
                    <div>
                      <p className="mb-6 text-[14px] font-[500] uppercase tracking-[0.17px] text-[#9192A0]">
                        {servicesTitle}
                      </p>
                      <ul className="space-y-2 text-base font-normal text-white/90 leading-[30px]">
                        {services.map((service) => (
                          <li key={service.label}>
                            <Link
                              href={langHref(service.href, lang)}
                              className="hover:text-white/70"
                            >
                              {service.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* OFFICES */}
                  {offices.length > 0 && (
                    <div>
                      <p className="mb-6 text-[14px] font-medium uppercase tracking-[0.17px] text-[#9192A0]">
                        {officesTitle}
                      </p>
                      <div className="space-y-6 text-[16px]">
                        {offices.map((office) => (
                          <div key={office.title}>
                            <p className="mb-3 font-medium uppercase">
                              {office.title}
                            </p>
                            <div className="space-y-1 text-white">
                              {office.lines.map((line, i) => (
                                <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============ BOTTOM ROW ============ */}
          {hasBottomRow && (
            <div className="grid md:grid-cols-2 items-center gap-10 mt-6">
              {/* LOGO */}
              <div>
                {footerLogo?.url && (
                  <div className="relative h-[39px] w-[240px] opacity-80">
                    <Image
                      src={footerLogo.url}
                      alt="Footer Logo"
                      width={240}
                      height={39}
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* COPYRIGHT + SOCIAL */}
              <div className="flex justify-between items-center copyright-social-gap">
                {copyrightText && (
                  <p className="text-[#9192A0]" dangerouslySetInnerHTML={{ __html: copyrightText }} />
                )}

                {/* SOCIAL */}
                <div className="flex gap-3">
                  {socialLinks.map(([network, url]) => {
                    const IconSrc = SOCIAL_ICON_MAP[network];
                    return (
                      <Link key={network} href={url} target="_blank">
                        <Image
                          src={IconSrc}
                          width={31}
                          height={31}
                          alt={network}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
