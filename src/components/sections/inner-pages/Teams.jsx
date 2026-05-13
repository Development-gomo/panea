"use client";

import { useState } from "react";
import Image from "next/image";
import DownArrow from "../../../../public/down-arrow.svg";
import Email from "../../../../public/email.svg";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

import {
  buildTeamFilters,
  filterTeamByType,
  getTeamImage,
} from "@/lib/api";

export default function TeamSection({ data, lang, prefetchedTeam }) {
  const currentLang = lang || DEFAULT_LANG;

  function filterByLang(res) {
    if (!Array.isArray(res)) return [];
    return res.filter((m) => {
      if (!m?.link) return false;
      const afterBase = m.link.split("/panea/")[1] || "";
      if (currentLang !== DEFAULT_LANG) return afterBase.startsWith(`${currentLang}/`);
      const nonDefaultLangs = SUPPORTED_LANGS.filter((l) => l !== DEFAULT_LANG);
      return !nonDefaultLangs.some((l) => afterBase.startsWith(`${l}/`));
    });
  }

  const team = prefetchedTeam ? filterByLang(prefetchedTeam) : [];
  const filters = buildTeamFilters(team);
  const [activeFilter, setActiveFilter] = useState("all");

  const { sub_heading, heading, short_text, team_cards } = data || {};
  const filteredTeam = filterTeamByType(team, activeFilter);

  if (team_cards === "Disable") return null;

  return (
    <section className="team-section py-15 md:py-30 web-width px-6">
      {/* Section Heading */}
      <div className="max-w-3xl mb-6">
        {sub_heading && (
          <div className="flex items-center gap-2 mb-2 md:mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
            <span className="subheading-label uppercase">{sub_heading}</span>
          </div>
        )}

        {heading && (
          <div
            className="section-heading mb-6"
            dangerouslySetInnerHTML={{ __html: heading }}
          />
        )}

        {short_text && (
          <div
            className="max-w-[510px]"
            dangerouslySetInnerHTML={{ __html: short_text }}
          />
        )}
      </div>

      {/* Filter Dropdown */}
      <div className="mb-14">
        <div className="form-group relative max-w-[307px]">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="team-filter min-w-[307px] rounded-sm bg-(--color-brand) border border-gray-300 px-6 py-2 text-white h-[48px] capitalize"
          >
            {filters.map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.name}
              </option>
            ))}
          </select>
          <Image
            src={DownArrow}
            alt="Down arrow"
            width={16}
            height={14}
            className="absolute top-5 right-4"
          />
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredTeam.map((member) => {
          const image = getTeamImage(member);

          return (
            <div
              key={member.id}
              className="relative overflow-hidden rounded-md bg-gray-100"
            >
              {/* Image */}
              <div className="relative aspect-[3/4]">
                {image && (
                  <Image
                    src={image}
                    alt={member.title.rendered}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="absolute rounded-sm inset-x-0 max-w-[270px] bottom-4 left-4 bg-(--color-bg) p-4 text-white">
                <p className="font-medium text-[20px] mb-1">{member.title.rendered}</p>
                <p className="text-sm team-title">{member?.acf?.job_title}</p>
              </div>

              {/* Email Button */}
              {member?.acf?.email && (
                <a
                  href={`mailto:${member.acf.email}`}
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#1c2a7a] text-white transition hover:opacity-90"
                  aria-label="Email"
                >
                 <Image src={Email} alt="Email" width={11} height={11} />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
