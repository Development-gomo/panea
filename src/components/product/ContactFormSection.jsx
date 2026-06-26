// src/components/product/ContactFormSection.jsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import ContactForm from "../sections/contact-form/ContactForm";
import ContactArrow from "../../../public/p-contact-arrow.svg";

function selectedPosts(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function postId(item) {
  return typeof item === "object" ? item?.ID || item?.id : item;
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
  return decodeHtml(
    stripHtml(member?.post_title || member?.title?.rendered || member?.title || "")
  );
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

function mergeMembers(selected, fetched) {
  const fetchedById = new Map(
    (fetched || []).map((item) => [Number(item.id), item])
  );

  return selected
    .map((item) => {
      const id = Number(postId(item));
      const fetchedItem = fetchedById.get(id);
      return fetchedItem || (typeof item === "object" ? item : null);
    })
    .filter(Boolean);
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

function hrefValue(row, fallback = "", type = "") {
  if (row && typeof row === "object") {
    const link =
      row.link ||
      row.url ||
      row.follow_link ||
      row.social_link ||
      row.social_media_url ||
      row.social_media_URL;
    if (typeof link === "string") return link;
    if (link?.url) return link.url;
  }

  if (type === "phone" && fallback) return `tel:${fallback.replace(/\s+/g, "")}`;
  if (type === "email" && fallback) return `mailto:${fallback}`;
  return fallback || "#";
}

function repeaterRows(rows) {
  if (!rows) return [];
  return Array.isArray(rows) ? rows : [rows];
}

function getContactItems(member) {
  const acf = member?.acf || {};

  return {
    phones: repeaterRows(acf.phone_number_details)
      .map((row) => {
        const label = firstValue(row, ["phone_number", "phone", "number", "title"]);
        return { label, href: hrefValue(row, label, "phone") };
      })
      .filter((item) => item.label),
    emails: repeaterRows(acf.email_details)
      .map((row) => {
        const label = firstValue(row, [
          "email_id",
          "email_Id",
          "email_ID",
          "email",
          "email_address",
          "mail",
          "title",
        ]);
        return { label, href: hrefValue(row, label, "email") };
      })
      .filter((item) => item.label),
    links: repeaterRows(acf.follow_me)
      .map((row) => {
        const label = firstValue(row, [
          "social_media_lable",
          "social_media_label",
          "social_media_title",
          "platform",
          "name",
          "title",
          "link",
        ]);
        return { label, href: hrefValue(row, label) };
      })
      .filter((item) => item.label),
  };
}

function ContactRow({ label, items, showLabel }) {
  if (!items.length) return null;

  return (
    <div
      className={`grid items-center gap-4 border-b border-[#1E2E31]/12 py-3 text-[14px] leading-tight text-(--color-body) ${
        showLabel ? "grid-cols-1 sm:grid-cols-[minmax(120px,1fr)_minmax(0,1fr)]" : "grid-cols-1"
      }`}
    >
      {showLabel && (
        <p className="text-[16px] font-light text-(--color-body)/60">{label}</p>
      )}
      <div className="space-y-2">
        {items.map((item, index) => (
          <a
            key={`${item.label}-${index}`}
            href={item.href}
            target={item.href?.startsWith("http") ? "_blank" : undefined}
            rel={item.href?.startsWith("http") ? "noreferrer" : undefined}
            className="group flex items-center justify-between gap-3 font-medium transition-opacity hover:opacity-70"
          >
            <span className="min-w-0 break-words">{item.label}</span>
            <Image
              src={ContactArrow}
              alt=""
              width={12}
              height={14}
              className="opacity-45 transition-transform group-hover:translate-x-1"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function TeamMemberCard({ member, compact }) {
  const title = getTitle(member);
  const image = getImage(member);
  const acf = member?.acf || {};
  const contacts = getContactItems(member);

  return (
    <article className={`min-w-0 ${compact ? "p-1" : "p-0"}`}>
      <div className={compact ? "space-y-4" : "grid gap-6 sm:grid-cols-[176px_1fr]"}>
        <div
          className={`relative shrink-0 overflow-hidden rounded-[4px] bg-[#1E2E31]/10 ${
            compact ? "h-[144px] w-[144px]" : "h-[176px] w-[176px] max-w-full"
          }`}
        >
          {image ? (
            <Image
              src={image}
              alt={title || "Team member"}
              fill
              sizes={compact ? "144px" : "176px"}
              className="object-cover"
            />
          ) : null}
        </div>

        <div>
          {title && (
            <h3 className={`${compact ? "text-[20px]" : "text-[26px]"} mb-2 font-normal leading-tight text-(--color-body)`}>
              {title}
            </h3>
          )}
          {acf.designation && (
            <p className="mb-4 text-[14px] font-light leading-normal text-(--color-body)/60">
              {acf.designation}
            </p>
          )}
          {acf.short_information && (
            <div
              className="text-[14px] font-medium leading-[1.45] text-(--color-body) [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: acf.short_information }}
            />
          )}
        </div>
      </div>

      <div className={compact ? "mt-5" : "mt-7"}>
        <ContactRow label="Phone" items={contacts.phones} showLabel={!compact} />
        <ContactRow label="E-mail" items={contacts.emails} showLabel={!compact} />
        <ContactRow label="Follow me" items={contacts.links} showLabel={!compact} />
      </div>
    </article>
  );
}

export default function ProductContactFormSection({
  data,
  teamData = null,
  lang,
  prefetchedTeamMembers = [],
}) {
  const { text_above_title, title, select_form } = data || {};
  const selectedTeamMembers =
    teamData?.select_team_members || data?.select_team_members;
  const teamMembers = mergeMembers(
    selectedPosts(selectedTeamMembers),
    prefetchedTeamMembers
  );
  const compactCards = teamMembers.length > 1;
  const formId = postId(select_form);

  if (!formId && !teamMembers.length) return null;

  return (
    <section className="w-full pt-[60px] pb-[120px]">
      <div className="web-width mx-auto px-6">
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5">
          {formId && (
            <motion.div
              className="rounded-[7px] bg-(--color-body) px-7 py-10 text-white md:min-h-[520px] md:px-11 md:py-13"
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
                submitLabel="Submit form"
              />
            </motion.div>
          )}

          {teamMembers.length > 0 && (
            <motion.div
              className={`rounded-[7px] border border-[#1E2E31]/16 ${
                compactCards
                  ? "grid gap-x-8 gap-y-6 p-6 sm:grid-cols-2 md:min-h-[520px]"
                  : "grid grid-cols-1 p-6 md:min-h-[520px] md:p-7"
              }`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              viewport={{ once: true }}
            >
              {teamMembers.map((member) => (
                <TeamMemberCard
                  key={postId(member)}
                  member={member}
                  compact={compactCards}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
