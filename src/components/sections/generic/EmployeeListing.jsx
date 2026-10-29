"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import ContactArrow from "../../../../public/p-contact-arrow.svg";
import LinkedinIcon from "../../../../public/linkedin-theme-icon.png";
import { decodeHtml, stripHtml } from "@/lib/htmlText";

// "Team Type" taxonomy (teamtype). Section titles and their order come from
// the WP terms (teamTypes, per language). A member's terms are read from
// class_list ("teamtype-<slug>"), which WP always includes.
const TEAM_TYPE_PREFIX = "teamtype-";

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

function getBusinessAreas(member) {
  return repeaterRows(member?.acf?.area_of_business_ownership)
    .map((row) => decodeHtml(stripHtml(row?.business_area_or_solution || "")).trim())
    .filter(Boolean);
}

function getTeamTypes(member) {
  return (member?.class_list || [])
    .filter((name) => name.startsWith(TEAM_TYPE_PREFIX))
    .map((name) => name.slice(TEAM_TYPE_PREFIX.length));
}

function humanizeSlug(slug) {
  const text = slug.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Groups follow the term order from WP; members with several types appear in
// each of them, and members without a type are collected in a final, untitled
// group so nobody drops off the page. A slug with no matching term (e.g. the
// taxonomy isn't exposed in REST yet) still gets a group, titled from the slug.
function groupByTeamType(members, teamTypes) {
  const groups = new Map(
    teamTypes.map((term) => [
      term.slug,
      { slug: term.slug, title: decodeHtml(term.name || ""), members: [] },
    ])
  );
  const untyped = [];

  members.forEach((member) => {
    const types = getTeamTypes(member);
    if (!types.length) {
      untyped.push(member);
      return;
    }

    types.forEach((slug) => {
      if (!groups.has(slug)) {
        groups.set(slug, { slug, title: humanizeSlug(slug), members: [] });
      }
      groups.get(slug).members.push(member);
    });
  });

  return [
    ...[...groups.values()].filter((group) => group.members.length),
    ...(untyped.length ? [{ slug: "", title: "", members: untyped }] : []),
  ];
}

function EmployeeGrid({ members }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((member, index) => (
        <EmployeeCard key={member?.id || member?.ID || index} member={member} index={index} />
      ))}
    </div>
  );
}

function ContactLink({ href, children }) {
  if (!children) return null;

  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 border-t border-[#1E2E31]/12 mx-4 py-4 text-[14px] font-medium leading-tight text-(--color-body) opacity-70 transition-opacity hover:opacity-100"
    >
      <span className="min-w-0 break-words">{children}</span>
      <Image
        src={ContactArrow}
        alt=""
        width={12}
        height={14}
        className="transition-transform group-hover:translate-x-1"
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
      className="flex h-full flex-col overflow-hidden rounded-[7px] border border-[#1E2E31]/20 bg-transparent"
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

      <div className="flex flex-1 flex-col px-4 py-5">
        {title && (
          <h3 className="mb-2 text-[24px] font-light leading-tight text-(--color-body)">
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
                className="rounded-[4px] border border-[#1E2E31]/25 px-3 py-[7px] text-[12px] leading-none text-(--color-body)"
              >
                {area}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <ContactLink href={phone ? `tel:${phone.replace(/\s+/g, "")}` : "#"}>
          {phone}
        </ContactLink>
        <ContactLink href={email ? `mailto:${email}` : "#"}>{email}</ContactLink>
      </div>
    </motion.article>
  );
}

export default function GenericEmployeeListing({
  data,
  employees = [],
  teamTypes = [],
}) {
  const { text_above_title, title } = data || {};
  const teamMembers = Array.isArray(employees) ? employees : [];

  if (!data || !teamMembers.length) return null;

  const groups = groupByTeamType(
    teamMembers,
    Array.isArray(teamTypes) ? teamTypes : []
  );
  // Until team types are assigned in WP, keep the single ungrouped grid.
  const isGrouped = groups.some((group) => group.slug);

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

        {isGrouped ? (
          <div className="flex flex-col gap-12 md:gap-16">
            {groups.map((group) => (
              <div key={group.slug || "untyped"}>
                {group.title && (
                  <motion.h3
                    className="mb-6 text-left text-[24px] font-light leading-tight text-(--color-body) md:mb-8 md:text-[28px]"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    {group.title}
                  </motion.h3>
                )}
                <EmployeeGrid members={group.members} />
              </div>
            ))}
          </div>
        ) : (
          <EmployeeGrid members={teamMembers} />
        )}
      </div>
    </section>
  );
}
