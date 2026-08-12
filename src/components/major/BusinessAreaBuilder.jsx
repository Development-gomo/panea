import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import {
  getAllSolutions,
  getRecentCaseStudies,
  getTeamMembersByIds,
  getTestimonialsByIds,
} from "@/lib/api";

const BusinessAreaHero = dynamic(() => import("../sections/business-area/Hero"));
const BusinessAreaCounterSection = dynamic(() => import("../sections/business-area/CounterSection"));
const BusinessAreaExpertiseAreas = dynamic(() => import("../sections/business-area/ExpertiseAreas"));
const BusinessAreaHighlightBanner = dynamic(() => import("../sections/business-area/HighlightBanner"));
const BusinessAreaSolutionSlider = dynamic(() => import("../sections/business-area/SolutionSlider"));
const BusinessAreaOurApproach = dynamic(() => import("../sections/business-area/OurApproach"));
const BusinessAreaFAQ = dynamic(() => import("../sections/business-area/FAQ"));
const BusinessAreaWhyChooseUs = dynamic(() => import("../sections/business-area/WhyChooseUs"));
const BusinessAreaTestimonialSlider = dynamic(() =>
  import("../sections/business-area/TestimonialSlider")
);
const BusinessAreaContactFormSection = dynamic(() =>
  import("../sections/business-area/ContactFormSection")
);
const BusinessAreaCaseStudiesSlider = dynamic(() =>
  import("../sections/business-area/CaseStudiesSlider")
);
const BusinessAreaProcessAnimation = dynamic(() =>
  import("../sections/business-area/ProcessAnimation")
);

function selectedPosts(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function postId(item) {
  return typeof item === "object" ? item?.ID || item?.id : item;
}

function collectSelectedSolutionIds(businessArea) {
  return selectedPosts(businessArea?.acf?.select_solutions)
    .map((item) => Number(postId(item)))
    .filter(Boolean);
}

function collectTestimonialIds(sections) {
  return sections
    .filter((block) =>
      ["testimonial", "testimonial_slider"].includes(block?.acf_fc_layout)
    )
    .flatMap((block) => selectedPosts(block.clients_testimonial))
    .map((item) => Number(postId(item)))
    .filter(Boolean);
}

function collectTeamMemberIds(sections) {
  return sections
    .filter((block) =>
      ["contact_form_section", "contact_form", "team_member_section"].includes(
        block?.acf_fc_layout
      )
    )
    .flatMap((block) => selectedPosts(block.select_team_members))
    .map((item) => Number(postId(item)))
    .filter(Boolean);
}

function postSlug(item) {
  if (!item || typeof item !== "object") return "";
  return item.slug || item.post_name || item.post_title || "";
}

function normalizeSlug(value = "") {
  return String(value).trim().toLowerCase();
}

function slugFromUrl(value = "") {
  const parts = String(value)
    .split("/")
    .filter(Boolean);
  return parts[parts.length - 1] || "";
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

function normalizeText(value = "") {
  return decodeHtml(stripHtml(value)).trim().toLowerCase();
}

function collectEntryIds(entry) {
  const ids = new Set();
  const addId = (value) => {
    const id = Number(value);
    if (id) ids.add(id);
  };

  addId(entry?.ID);
  addId(entry?.id);
  Object.values(entry?.translations || {}).forEach(addId);
  Object.values(entry?.wpml_translations || {}).forEach((translation) => {
    addId(translation);
    addId(translation?.id);
    addId(translation?.element_id);
  });
  Object.values(entry?.icl_translations || {}).forEach((translation) => {
    addId(translation);
    addId(translation?.id);
    addId(translation?.element_id);
  });

  return ids;
}

function collectEntrySlugs(entry) {
  const slugs = new Set();
  const addSlug = (value) => {
    const slug = normalizeSlug(value);
    if (slug) slugs.add(slug);
  };

  addSlug(entry?.post_name);
  addSlug(entry?.slug);
  addSlug(slugFromUrl(entry?.link));
  Object.values(entry?.translations || {}).forEach((translation) => {
    addSlug(translation?.slug);
  });
  Object.values(entry?.wpml_translations || {}).forEach((translation) => {
    addSlug(translation?.slug);
    addSlug(translation?.post_name);
  });
  Object.values(entry?.icl_translations || {}).forEach((translation) => {
    addSlug(translation?.slug);
    addSlug(translation?.post_name);
  });

  return slugs;
}

function getEntryTitle(entry) {
  if (!entry) return "";
  if (typeof entry !== "object") return "";

  return (
    entry?.title?.rendered ||
    entry?.title ||
    entry?.post_title ||
    entry?.name ||
    entry?.label ||
    ""
  );
}

function collectEntryTitles(entry) {
  const titles = new Set();
  const addTitle = (value) => {
    const title = normalizeText(value);
    if (title) titles.add(title);
  };

  addTitle(getEntryTitle(entry));
  Object.values(entry?.translations || {}).forEach((translation) => {
    addTitle(getEntryTitle(translation));
  });
  Object.values(entry?.wpml_translations || {}).forEach((translation) => {
    addTitle(getEntryTitle(translation));
  });
  Object.values(entry?.icl_translations || {}).forEach((translation) => {
    addTitle(getEntryTitle(translation));
  });

  return titles;
}

function solutionBelongsToBusinessArea(solution, businessArea) {
  const linkedAreas = selectedPosts(solution?.acf?.select_business_areas);
  const businessAreaIds = collectEntryIds(businessArea);
  const businessAreaSlugs = collectEntrySlugs(businessArea);
  const businessAreaTitles = collectEntryTitles(businessArea);

  return linkedAreas.some((item) => {
    const linkedId = Number(postId(item));
    const linkedSlug = normalizeSlug(postSlug(item));
    const linkedTitle = normalizeText(getEntryTitle(item));

    return (
      (linkedId && businessAreaIds.has(linkedId)) ||
      (linkedSlug && businessAreaSlugs.has(linkedSlug)) ||
      (linkedTitle && businessAreaTitles.has(linkedTitle))
    );
  });
}

export default async function BusinessAreaBuilder({
  sections,
  lang = DEFAULT_LANG,
  businessAreaData = {},
  processSteps = [],
}) {
  if (!sections) return null;
  const sectionItems = Array.isArray(sections) ? sections : [sections];
  const needsSolutions = sectionItems.some(
    (block) => block?.acf_fc_layout === "solution_slider"
  );
  const needsCases = sectionItems.some((block) =>
    ["casestudies_slider", "case_studies_slider"].includes(block?.acf_fc_layout)
  );
  const testimonialIds = collectTestimonialIds(sectionItems);
  const teamMemberIds = collectTeamMemberIds(sectionItems);
  const [
    currentLanguageSolutions,
    prefetchedCases,
    prefetchedTestimonials,
    prefetchedTeamMembers,
  ] = await Promise.all([
    needsSolutions ? getAllSolutions(lang) : [],
    needsCases ? getRecentCaseStudies(lang) : null,
    testimonialIds.length ? getTestimonialsByIds(testimonialIds, lang) : null,
    teamMemberIds.length ? getTeamMembersByIds(teamMemberIds, lang) : null,
  ]);
  const selectedSolutionIds = collectSelectedSolutionIds(businessAreaData);
  const selectedSolutionIdSet = new Set(selectedSolutionIds);
  const selectedSolutions = Array.isArray(currentLanguageSolutions)
    ? selectedSolutionIds
        .map((id) => currentLanguageSolutions.find((solution) => Number(solution?.id) === id))
        .filter(Boolean)
    : [];
  const currentLinkedSolutions = Array.isArray(currentLanguageSolutions)
    ? currentLanguageSolutions.filter((solution) =>
        solutionBelongsToBusinessArea(solution, businessAreaData)
      )
    : [];
  const fallbackSolutions =
    needsSolutions && currentLinkedSolutions.length === 0
      ? await getAllSolutions("all")
      : [];
  const fallbackLinkedSolutions = Array.isArray(fallbackSolutions)
    ? fallbackSolutions.filter((solution) =>
        solutionBelongsToBusinessArea(solution, businessAreaData)
      )
    : [];
  const linkedSolutions =
    selectedSolutions.length > 0
      ? selectedSolutions
      : currentLinkedSolutions.length > 0
      ? currentLinkedSolutions
      : selectedSolutionIdSet.size > 0 && Array.isArray(fallbackSolutions)
        ? selectedSolutionIds
            .map((id) => fallbackSolutions.find((solution) => Number(solution?.id) === id))
            .filter(Boolean)
        : fallbackLinkedSolutions;

  return (
    <>
      {sectionItems.map((block, i) => {
        switch (block.acf_fc_layout) {
          case "banner":
          case "hero":
          case "hero_section":
          case "business_area_hero":
            return <BusinessAreaHero key={i} data={block} lang={lang} />;

          case "counter_section":
          case "feature_counter":
          case "home_counter":
            return <BusinessAreaCounterSection key={i} data={block} lang={lang} />;

          case "expertise_areas":
            return <BusinessAreaExpertiseAreas key={i} data={block} lang={lang} />;

          case "highlight_banner":
            return <BusinessAreaHighlightBanner key={i} data={block} lang={lang} />;

          case "solution_slider":
            return (
              <BusinessAreaSolutionSlider
                key={i}
                data={block}
                lang={lang}
                solutions={linkedSolutions}
              />
            );

          case "casestudies_slider":
          case "case_studies_slider":
            return (
              <BusinessAreaCaseStudiesSlider
                key={i}
                data={block}
                lang={lang}
                prefetchedCases={prefetchedCases}
              />
            );

          case "our_approach":
            return <BusinessAreaOurApproach key={i} data={block} lang={lang} />;

          case "faq":
          case "faq_section":
            return <BusinessAreaFAQ key={i} data={block} lang={lang} />;

          case "why_choose_us":
          case "why_choose":
            return <BusinessAreaWhyChooseUs key={i} data={block} lang={lang} />;

          case "testimonial":
          case "testimonial_slider":
            return (
              <BusinessAreaTestimonialSlider
                key={i}
                data={block}
                prefetchedTestimonials={prefetchedTestimonials}
              />
            );

          case "contact_form_section":
          case "contact_form":
            return (
              <BusinessAreaContactFormSection
                key={i}
                data={block}
                teamData={
                  sectionItems[i + 1]?.acf_fc_layout === "team_member_section"
                    ? sectionItems[i + 1]
                    : null
                }
                lang={lang}
                prefetchedTeamMembers={prefetchedTeamMembers}
              />
            );

          case "team_member_section":
            return null;

          case "process_animation":
            return (
              <BusinessAreaProcessAnimation
                key={i}
                processSteps={processSteps}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
