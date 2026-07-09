"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import ContactArrow from "../../../../public/p-contact-arrow.svg";
import LinkedinIcon from "../../../../public/linkedin-theme-icon.png";

function selectedPosts(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, "").trim();
}

function decodeHtml(value = "") {
  return String(value)
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getTitle(member) {
  return decodeHtml(stripHtml(member?.post_title || member?.title?.rendered || member?.title || ""));
}

function getImage(member) {
  return (
    member?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    member?.featured_image?.url ||
    member?.acf?.featured_image?.url ||
    member?.acf?.image?.url ||
    ""
  );
}

function firstValue(row, keys = []) {
  if (!row) return "";
  if (typeof row === "string" || typeof row === "number") return String(row);

  for (const key of keys) {
    const value = row?.[key];
    if (!value) continue;
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (value?.title) return String(value.title);
    if (value?.url) return String(value.url);
  }

  const value = Object.values(row).find((item) => {
    if (!item) return false;
    if (typeof item === "string" || typeof item === "number") return true;
    return item?.title || item?.url;
  });

  if (typeof value === "string" || typeof value === "number") return String(value);
  return value?.title || value?.url || "";
}

function repeaterRows(rows) {
  if (!rows) return [];
  return Array.isArray(rows) ? rows : [rows];
}

function getPhone(member) {
  const row = repeaterRows(member?.acf?.phone_number_details)[0];
  return firstValue(row, ["phone_number", "phone", "mobile_number", "mobile", "number", "title"]);
}

function getEmail(member) {
  const row = repeaterRows(member?.acf?.email_details)[0];
  return firstValue(row, [
    "email_id",
    "email_Id",
    "email_ID",
    "email",
    "email_address",
    "mail",
    "title",
  ]);
}

function getFollowLink(member) {
  const row = repeaterRows(member?.acf?.follow_me)[0];
  if (!row || typeof row !== "object") return "";

  const link =
    row.link ||
    row.url ||
    row.follow_link ||
    row.social_link ||
    row.social_media_url ||
    row.social_media_URL;

  if (typeof link === "string") return link;
  return link?.url || "";
}

function getEntryTitle(entry) {
  if (!entry || typeof entry !== "object") return "";
  return decodeHtml(
    stripHtml(entry?.title?.rendered || entry?.title || entry?.post_title || entry?.name || "")
  );
}

function getBusinessAreas(member) {
  const areas = selectedPosts(member?.acf?.responsible_business_area)
    .map(getEntryTitle)
    .filter(Boolean);

  if (areas.length) return areas;

  const terms = member?._embedded?.["wp:term"] || [];
  return terms
    .flat()
    .filter((term) => ["business_area", "business_areas"].includes(term?.taxonomy))
    .map((term) => term.name)
    .filter(Boolean);
}

function ContactLink({ href, children }) {
  if (!children) return null;

  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 border-t border-[#1E2E31]/12 px-4 py-4 text-[14px] font-medium leading-tight text-(--color-body) transition-opacity hover:opacity-70"
    >
      <span className="min-w-0 break-words">{children}</span>
      <Image
        src={ContactArrow}
        alt=""
        width={12}
        height={14}
        className="opacity-45 transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
}

function EmployeeCard({ member, index }) {
  const title = getTitle(member);
  const image = getImage(member);
  const acf = member?.acf || {};
  const phone = getPhone(member);
  const email = getEmail(member);
  const linkedin = getFollowLink(member);
  const businessAreas = getBusinessAreas(member);

  return (
    <motion.article
      className="overflow-hidden rounded-[7px] border border-[#1E2E31]/20 bg-transparent"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <div className="relative aspect-[4/2.45] overflow-hidden bg-[#1E2E31]/10">
        {image ? (
          <Image
            src={image}
            alt={title || "Team member"}
            fill
            sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) 50vw, 25vw"
            className="object-cover"
          />
        ) : null}

        {linkedin && (
          <Link
            href={linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={`${title || "Team member"} LinkedIn`}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#1E2E31] bg-[#F2EBE2]"
          >
            <Image src={LinkedinIcon} alt="" height={20} className="h-5 w-auto" />
          </Link>
        )}
      </div>

      <div className="px-4 py-5">
        {title && (
          <h3 className="mb-2 text-[22px] font-normal leading-tight text-(--color-body)">
            {title}
          </h3>
        )}

        {acf.designation && (
          <p className="mb-4 text-[14px] font-light leading-normal text-(--color-body)/65">
            {acf.designation}
          </p>
        )}

        {businessAreas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {businessAreas.map((area, areaIndex) => (
              <span
                key={`${area}-${areaIndex}`}
                className="rounded-[4px] border border-[#1E2E31]/25 px-3 py-1 text-[12px] leading-none text-(--color-body)"
              >
                {area}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <ContactLink href={phone ? `tel:${phone.replace(/\s+/g, "")}` : "#"}>
          {phone}
        </ContactLink>
        <ContactLink href={email ? `mailto:${email}` : "#"}>{email}</ContactLink>
      </div>
    </motion.article>
  );
}

export default function GenericEmployeeListing({ data, employees = [] }) {
  const { text_above_title, title } = data || {};
  const teamMembers = Array.isArray(employees) ? employees : [];

  if (!data || !teamMembers.length) return null;

  return (
    <section className="w-full pt-[60px] pb-0 md:pt-[120px]">
      <div className="web-width-sm mx-auto px-6">
        <div className="mb-10 flex flex-col items-center text-center md:mb-16">
          {text_above_title && (
            <motion.p
              className="ff-larken mb-4 text-[16px] font-light leading-normal text-(--color-body)"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {text_above_title}
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teamMembers.map((member, index) => (
            <EmployeeCard key={member?.id || member?.ID || index} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
