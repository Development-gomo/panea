import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import {
  getAllBusinessAreas,
  getCaseStudies,
  getTeamMembersByIds,
  getTestimonialsByIds,
} from "@/lib/api";

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
    needsCases ? getCaseStudies(lang) : null,
    needsBusinessAreas ? getAllBusinessAreas(lang) : null,
    testimonialIds.length ? getTestimonialsByIds(testimonialIds, lang) : null,
    teamMemberIds.length ? getTeamMembersByIds(teamMemberIds, lang) : null,
  ]);
  const selectedBusinessAreas = getSelectedBusinessAreas(
    solutionData?.select_business_areas,
    allBusinessAreas
  );

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
                businessAreas={selectedBusinessAreas}
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
