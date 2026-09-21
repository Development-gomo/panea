import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import {
  getAllBusinessAreas,
  getRecentCaseStudies,
  getTeamMembersByIds,
  getTestimonialsByIds,
} from "@/lib/api";
import { decodeHtml, stripHtml } from "@/lib/htmlText";

const SolutionHero = dynamic(() => import("../sections/solution/Hero"));
const SolutionFAQ = dynamic(() => import("../sections/solution/FAQ"));
const SolutionCaseStudiesSlider = dynamic(() => import("../sections/solution/CaseStudiesSlider"));
const SolutionOurApproach = dynamic(() => import("../sections/solution/OurApproach"));
const SolutionOurClients = dynamic(() => import("../sections/solution/OurClients"));
const SolutionBusinessAreas = dynamic(() => import("../sections/solution/BusinessAreas"));
const SolutionTestimonialSlider = dynamic(() => import("../sections/solution/TestimonialSlider"));
const SolutionContactFormSection = dynamic(() => import("../sections/solution/ContactFormSection"));

function getSelectedBusinessAreas(selected, allBusinessAreas) {
  const selectedItems = Array.isArray(selected)
    ? selected
    : selected
      ? [selected]
      : [];

  return selectedItems
    .map((item) => {
      const id = typeof item === "object" ? item?.ID || item?.id : item;
      const fullItem = allBusinessAreas?.find((area) => area.id === Number(id));
      return fullItem || (typeof item === "object" ? item : null);
    })
    .filter(Boolean);
}

function normalizeSelectedPosts(selected) {
  if (!selected) return [];
  return Array.isArray(selected) ? selected : [selected];
}

/* =========================================================
   SOLUTION AREA BUSINESS OVERRIDES
   (mirrors the business_area_solutions pattern used in
   BusinessAreaBuilder.jsx — per-Solution overrides for the
   business_areas module, sourced from:
   Panea - Solution Area Business Details ->
   solution_area_business: [
     { business: {...}/ID, short_description: "...", button_row: [...] }
   ]
========================================================= */

function postId(item) {
  return typeof item === "object" ? item?.ID || item?.id : item;
}

function postSlug(item) {
  if (!item || typeof item !== "object") return "";
  return item.slug || item.post_name || item.post_title || "";
}

function normalizeSlug(value = "") {
  return String(value).trim().toLowerCase();
}

function getEntryTitle(entry) {
  if (!entry || typeof entry !== "object") return "";
  return (
    entry?.title?.rendered ||
    entry?.title ||
    entry?.post_title ||
    entry?.name ||
    ""
  );
}

function normalizeText(value = "") {
  return decodeHtml(stripHtml(value)).trim().toLowerCase();
}

function getSolutionAreaBusinessRows(solutionData) {
  const rows = solutionData?.solution_area_business;
  if (!rows) return [];
  return Array.isArray(rows) ? rows : [rows];
}

/**
 * Resolve each row's `business` Post Object reference against the full
 * Business Area CPT list (ID match first, slug/title as a WPML-safe
 * fallback), keeping the row's own short_description/button_row overrides.
 */
function buildSolutionAreaBusinessItems(rows, availableBusinessAreas) {
  if (!Array.isArray(rows) || !Array.isArray(availableBusinessAreas)) return [];

  return rows
    .map((row) => {
      const selected = row?.business;
      const selectedId = Number(postId(selected));
      const selectedSlug = normalizeSlug(postSlug(selected));
      const selectedTitle = normalizeText(getEntryTitle(selected));

      const businessArea = availableBusinessAreas.find((item) => {
        const itemId = Number(item?.id || item?.ID);
        const itemSlug = normalizeSlug(postSlug(item));
        const itemTitle = normalizeText(getEntryTitle(item));

        return (
          (selectedId && itemId === selectedId) ||
          (selectedSlug && itemSlug === selectedSlug) ||
          (selectedTitle && itemTitle === selectedTitle)
        );
      });

      const resolvedBusinessArea =
        businessArea || (selected && typeof selected === "object" ? selected : null);

      if (!resolvedBusinessArea) return null;

      return {
        ...row,
        business: resolvedBusinessArea,
      };
    })
    .filter(Boolean);
}

function collectTestimonialIds(sections) {
  return sections
    .filter((block) => block.acf_fc_layout === "testimonial")
    .flatMap((block) => normalizeSelectedPosts(block.clients_testimonial))
    .map((item) => (typeof item === "object" ? item?.ID || item?.id : item))
    .filter(Boolean);
}

function collectTeamMemberIds(sections) {
  return sections
    .filter(
      (block) =>
        block.acf_fc_layout === "contact_form_section" ||
        block.acf_fc_layout === "team_member_section"
    )
    .flatMap((block) => normalizeSelectedPosts(block.select_team_members))
    .map((item) => (typeof item === "object" ? item?.ID || item?.id : item))
    .filter(Boolean);
}

export default async function SolutionBuilder({
  sections,
  lang = DEFAULT_LANG,
  solutionData = {},
}) {
  if (!sections) return null;

  const needsCases = sections.some(
    (block) => block.acf_fc_layout === "casestudies_slider"
  );
  const needsBusinessAreas = sections.some(
    (block) => block.acf_fc_layout === "business_areas"
  );
  const testimonialIds = collectTestimonialIds(sections);
  const teamMemberIds = collectTeamMemberIds(sections);
  const [
    prefetchedCases,
    allBusinessAreas,
    prefetchedTestimonials,
    prefetchedTeamMembers,
  ] = await Promise.all([
    needsCases ? getRecentCaseStudies(lang) : null,
    needsBusinessAreas ? getAllBusinessAreas(lang) : null,
    testimonialIds.length ? getTestimonialsByIds(testimonialIds, lang) : null,
    teamMemberIds.length ? getTeamMembersByIds(teamMemberIds, lang) : null,
  ]);
  const selectedBusinessAreas = getSelectedBusinessAreas(
    solutionData?.select_business_areas,
    allBusinessAreas
  );

  /*
   * Priority 1: new solution_area_business repeater, if configured on this
   * Solution — resolved against the fetched Business Area CPT list, with a
   * cross-language fallback fetch for WPML-mismatched IDs.
   *
   * Priority 2: no repeater configured, so preserve the existing
   * select_business_areas relationship behaviour untouched.
   */
  const solutionAreaBusinessRows = getSolutionAreaBusinessRows(solutionData);
  const selectedSolutionAreaBusiness = buildSolutionAreaBusinessItems(
    solutionAreaBusinessRows,
    allBusinessAreas
  );

  const shouldFetchBusinessAreaFallback =
    solutionAreaBusinessRows.length > 0 &&
    selectedSolutionAreaBusiness.length === 0;

  const fallbackBusinessAreas = shouldFetchBusinessAreaFallback
    ? await getAllBusinessAreas("all")
    : [];

  const fallbackSolutionAreaBusiness = buildSolutionAreaBusinessItems(
    solutionAreaBusinessRows,
    fallbackBusinessAreas
  );

  const businessAreaItems =
    solutionAreaBusinessRows.length > 0
      ? selectedSolutionAreaBusiness.length > 0
        ? selectedSolutionAreaBusiness
        : fallbackSolutionAreaBusiness
      : selectedBusinessAreas;

  return (
    <>
      {sections.map((block, i) => {
        switch (block.acf_fc_layout) {
          case "banner":
          case "hero":
          case "hero_section":
          case "solution_hero":
            return <SolutionHero key={i} data={block} lang={lang} />;

          case "faq":
          case "faq_section":
            return <SolutionFAQ key={i} data={block} lang={lang} />;

          case "casestudies_slider":
            return (
              <SolutionCaseStudiesSlider
                key={i}
                data={block}
                lang={lang}
                prefetchedCases={prefetchedCases}
              />
            );

          case "our_approach":
            return <SolutionOurApproach key={i} data={block} lang={lang} />;

          case "our_clients":
            return <SolutionOurClients key={i} data={block} lang={lang} />;

          case "business_areas":
            return (
              <SolutionBusinessAreas
                key={i}
                data={block}
                lang={lang}
                businessAreas={businessAreaItems}
                contactButton={solutionData?.contact_button}
              />
            );

          case "testimonial":
            return (
              <SolutionTestimonialSlider
                key={i}
                data={block}
                prefetchedTestimonials={prefetchedTestimonials}
              />
            );

          case "contact_form_section":
            return (
              <SolutionContactFormSection
                key={i}
                data={block}
                teamData={
                  sections[i + 1]?.acf_fc_layout === "team_member_section"
                    ? sections[i + 1]
                    : null
                }
                lang={lang}
                prefetchedTeamMembers={prefetchedTeamMembers}
              />
            );

          case "team_member_section":
            return null;

          default:
            return null;
        }
      })}
    </>
  );
}
