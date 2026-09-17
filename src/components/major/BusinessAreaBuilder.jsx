import dynamic from "next/dynamic";

import { DEFAULT_LANG } from "@/config";

import {
  getAllSolutions,
  getRecentCaseStudies,
  getTeamMembersByIds,
  getTestimonialsByIds,
} from "@/lib/api";

import { decodeHtml, stripHtml } from "@/lib/htmlText";

const BusinessAreaHero = dynamic(() =>
  import("../sections/business-area/Hero")
);

const BusinessAreaCounterSection = dynamic(() =>
  import("../sections/business-area/CounterSection")
);

const BusinessAreaExpertiseAreas = dynamic(() =>
  import("../sections/business-area/ExpertiseAreas")
);

const BusinessAreaHighlightBanner = dynamic(() =>
  import("../sections/business-area/HighlightBanner")
);

const BusinessAreaSolutionSlider = dynamic(() =>
  import("../sections/business-area/SolutionSlider")
);

const BusinessAreaOurApproach = dynamic(() =>
  import("../sections/business-area/OurApproach")
);

const BusinessAreaFAQ = dynamic(() =>
  import("../sections/business-area/FAQ")
);

const BusinessAreaWhyChooseUs = dynamic(() =>
  import("../sections/business-area/WhyChooseUs")
);

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

/* =========================================================
   GENERAL HELPERS
========================================================= */

function selectedPosts(value) {
  if (!value) return [];

  return Array.isArray(value)
    ? value
    : [value];
}

function postId(item) {
  return typeof item === "object"
    ? item?.ID || item?.id
    : item;
}

/* =========================================================
   BUSINESS AREA SOLUTION OVERRIDES
========================================================= */

/**
 * New ACF structure:
 *
 * business_area_solutions: [
 *   {
 *     solution: {...} / ID,
 *     short_description: "...",
 *     hover_text: "...",
 *     background_image: {...},
 *     button_row: [...]
 *   }
 * ]
 */
function getBusinessAreaSolutionRows(businessArea) {
  const rows =
    businessArea?.acf?.business_area_solutions;

  if (!rows) return [];

  return Array.isArray(rows)
    ? rows
    : [rows];
}

/**
 * Get IDs from the selected Solution inside
 * each Business Area repeater row.
 */
function collectSelectedSolutionIds(businessArea) {
  return getBusinessAreaSolutionRows(
    businessArea
  )
    .map((row) =>
      Number(postId(row?.solution))
    )
    .filter(Boolean);
}

/* =========================================================
   TESTIMONIALS
========================================================= */

function collectTestimonialIds(sections) {
  return sections
    .filter((block) =>
      [
        "testimonial",
        "testimonial_slider",
      ].includes(block?.acf_fc_layout)
    )
    .flatMap((block) =>
      selectedPosts(
        block.clients_testimonial
      )
    )
    .map((item) =>
      Number(postId(item))
    )
    .filter(Boolean);
}

/* =========================================================
   TEAM MEMBERS
========================================================= */

function collectTeamMemberIds(sections) {
  return sections
    .filter((block) =>
      [
        "contact_form_section",
        "contact_form",
        "team_member_section",
      ].includes(block?.acf_fc_layout)
    )
    .flatMap((block) =>
      selectedPosts(
        block.select_team_members
      )
    )
    .map((item) =>
      Number(postId(item))
    )
    .filter(Boolean);
}

/* =========================================================
   SOLUTION / BUSINESS AREA MATCHING
========================================================= */

function postSlug(item) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    return "";
  }

  return (
    item.slug ||
    item.post_name ||
    item.post_title ||
    ""
  );
}

function normalizeSlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase();
}

function slugFromUrl(value = "") {
  const parts = String(value)
    .split("/")
    .filter(Boolean);

  return (
    parts[parts.length - 1] ||
    ""
  );
}

function normalizeText(value = "") {
  return decodeHtml(
    stripHtml(value)
  )
    .trim()
    .toLowerCase();
}

/* =========================================================
   WPML HELPERS
========================================================= */

function collectEntryIds(entry) {
  const ids = new Set();

  const addId = (value) => {
    const id = Number(value);

    if (id) {
      ids.add(id);
    }
  };

  addId(entry?.ID);
  addId(entry?.id);

  Object.values(
    entry?.translations || {}
  ).forEach(addId);

  Object.values(
    entry?.wpml_translations || {}
  ).forEach((translation) => {
    addId(translation);
    addId(translation?.id);
    addId(
      translation?.element_id
    );
  });

  Object.values(
    entry?.icl_translations || {}
  ).forEach((translation) => {
    addId(translation);
    addId(translation?.id);
    addId(
      translation?.element_id
    );
  });

  return ids;
}

function collectEntrySlugs(entry) {
  const slugs = new Set();

  const addSlug = (value) => {
    const slug =
      normalizeSlug(value);

    if (slug) {
      slugs.add(slug);
    }
  };

  addSlug(entry?.post_name);
  addSlug(entry?.slug);
  addSlug(
    slugFromUrl(entry?.link)
  );

  Object.values(
    entry?.translations || {}
  ).forEach((translation) => {
    addSlug(
      translation?.slug
    );
  });

  Object.values(
    entry?.wpml_translations || {}
  ).forEach((translation) => {
    addSlug(
      translation?.slug
    );

    addSlug(
      translation?.post_name
    );
  });

  Object.values(
    entry?.icl_translations || {}
  ).forEach((translation) => {
    addSlug(
      translation?.slug
    );

    addSlug(
      translation?.post_name
    );
  });

  return slugs;
}

function getEntryTitle(entry) {
  if (!entry) return "";

  if (
    typeof entry !== "object"
  ) {
    return "";
  }

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
    const title =
      normalizeText(value);

    if (title) {
      titles.add(title);
    }
  };

  addTitle(
    getEntryTitle(entry)
  );

  Object.values(
    entry?.translations || {}
  ).forEach((translation) => {
    addTitle(
      getEntryTitle(translation)
    );
  });

  Object.values(
    entry?.wpml_translations || {}
  ).forEach((translation) => {
    addTitle(
      getEntryTitle(translation)
    );
  });

  Object.values(
    entry?.icl_translations || {}
  ).forEach((translation) => {
    addTitle(
      getEntryTitle(translation)
    );
  });

  return titles;
}

/* =========================================================
   CHECK SOLUTION -> BUSINESS AREA RELATIONSHIP
========================================================= */

function solutionBelongsToBusinessArea(
  solution,
  businessArea
) {
  const linkedAreas =
    selectedPosts(
      solution?.acf
        ?.select_business_areas
    );

  const businessAreaIds =
    collectEntryIds(
      businessArea
    );

  const businessAreaSlugs =
    collectEntrySlugs(
      businessArea
    );

  const businessAreaTitles =
    collectEntryTitles(
      businessArea
    );

  return linkedAreas.some(
    (item) => {
      const linkedId =
        Number(
          postId(item)
        );

      const linkedSlug =
        normalizeSlug(
          postSlug(item)
        );

      const linkedTitle =
        normalizeText(
          getEntryTitle(item)
        );

      return (
        (
          linkedId &&
          businessAreaIds.has(
            linkedId
          )
        ) ||
        (
          linkedSlug &&
          businessAreaSlugs.has(
            linkedSlug
          )
        ) ||
        (
          linkedTitle &&
          businessAreaTitles.has(
            linkedTitle
          )
        )
      );
    }
  );
}

/* =========================================================
   MATCH BUSINESS AREA REPEATER ROWS WITH SOLUTIONS
========================================================= */

function buildBusinessAreaSolutions(
  rows,
  availableSolutions
) {
  if (
    !Array.isArray(rows) ||
    !Array.isArray(
      availableSolutions
    )
  ) {
    return [];
  }

  return rows
    .map((row) => {
      const selected =
        row?.solution;

      const selectedId =
        Number(
          postId(selected)
        );

      const selectedSlug =
        normalizeSlug(
          postSlug(selected)
        );

      const selectedTitle =
        normalizeText(
          getEntryTitle(
            selected
          )
        );

      /*
       * First try ID.
       *
       * Then slug/title as WPML-safe
       * fallback when IDs differ.
       */
      const solution =
        availableSolutions.find(
          (item) => {
            const itemId =
              Number(
                item?.id ||
                item?.ID
              );

            const itemSlug =
              normalizeSlug(
                postSlug(item)
              );

            const itemTitle =
              normalizeText(
                getEntryTitle(
                  item
                )
              );

            return (
              (
                selectedId &&
                itemId ===
                  selectedId
              ) ||
              (
                selectedSlug &&
                itemSlug ===
                  selectedSlug
              ) ||
              (
                selectedTitle &&
                itemTitle ===
                  selectedTitle
              )
            );
          }
        );

      /*
       * If ACF returned the complete
       * Solution object, it can also
       * be used directly.
       */
      const resolvedSolution =
        solution ||
        (
          selected &&
          typeof selected ===
            "object"
            ? selected
            : null
        );

      if (!resolvedSolution) {
        return null;
      }

      /*
       * VERY IMPORTANT:
       *
       * Keep the entire repeater row.
       * This preserves:
       *
       * short_description
       * hover_text
       * background_image
       * button_row
       *
       * while replacing `solution`
       * with the complete REST object.
       */
      return {
        ...row,
        solution:
          resolvedSolution,
      };
    })
    .filter(Boolean);
}

/* =========================================================
   BUILDER
========================================================= */

export default async function BusinessAreaBuilder({
  sections,
  lang = DEFAULT_LANG,
  businessAreaData = {},
  processSteps = [],
}) {
  if (!sections) {
    return null;
  }

  const sectionItems =
    Array.isArray(sections)
      ? sections
      : [sections];

  const needsSolutions =
    sectionItems.some(
      (block) =>
        block?.acf_fc_layout ===
        "solution_slider"
    );

  const needsCases =
    sectionItems.some((block) =>
      [
        "casestudies_slider",
        "case_studies_slider",
      ].includes(
        block?.acf_fc_layout
      )
    );

  const testimonialIds =
    collectTestimonialIds(
      sectionItems
    );

  const teamMemberIds =
    collectTeamMemberIds(
      sectionItems
    );

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const [
    currentLanguageSolutions,
    prefetchedCases,
    prefetchedTestimonials,
    prefetchedTeamMembers,
  ] = await Promise.all([
    needsSolutions
      ? getAllSolutions(lang)
      : [],

    needsCases
      ? getRecentCaseStudies(
          lang
        )
      : null,

    testimonialIds.length
      ? getTestimonialsByIds(
          testimonialIds,
          lang
        )
      : null,

    teamMemberIds.length
      ? getTeamMembersByIds(
          teamMemberIds,
          lang
        )
      : null,
  ]);

  /* =======================================================
     NEW BUSINESS AREA SOLUTION DATA
  ======================================================= */

  const businessAreaSolutionRows =
    getBusinessAreaSolutionRows(
      businessAreaData
    );

  const selectedSolutionIds =
    collectSelectedSolutionIds(
      businessAreaData
    );

  const selectedSolutionIdSet =
    new Set(
      selectedSolutionIds
    );

  /*
   * New repeater data matched
   * against current WPML language.
   */
  const selectedSolutions =
    buildBusinessAreaSolutions(
      businessAreaSolutionRows,
      currentLanguageSolutions
    );

  /* =======================================================
     EXISTING RELATIONSHIP FALLBACK
  ======================================================= */

  const currentLinkedSolutions =
    Array.isArray(
      currentLanguageSolutions
    )
      ? currentLanguageSolutions.filter(
          (solution) =>
            solutionBelongsToBusinessArea(
              solution,
              businessAreaData
            )
        )
      : [];

  /* =======================================================
     WPML FALLBACK
  ======================================================= */

  const shouldFetchFallback =
    needsSolutions &&
    (
      (
        businessAreaSolutionRows.length >
          0 &&
        selectedSolutions.length ===
          0
      ) ||
      (
        businessAreaSolutionRows.length ===
          0 &&
        currentLinkedSolutions.length ===
          0
      )
    );

  const fallbackSolutions =
    shouldFetchFallback
      ? await getAllSolutions(
          "all"
        )
      : [];

  /*
   * Try the new repeater against
   * all WPML solutions.
   */
  const fallbackSelectedSolutions =
    buildBusinessAreaSolutions(
      businessAreaSolutionRows,
      fallbackSolutions
    );

  /*
   * Existing relationship fallback.
   */
  const fallbackLinkedSolutions =
    Array.isArray(
      fallbackSolutions
    )
      ? fallbackSolutions.filter(
          (solution) =>
            solutionBelongsToBusinessArea(
              solution,
              businessAreaData
            )
        )
      : [];

  /* =======================================================
     FINAL SOLUTION DATA
  ======================================================= */

  let linkedSolutions = [];

  /*
   * Priority 1:
   *
   * NEW business_area_solutions.
   *
   * If editors added rows here,
   * these MUST win over the old
   * relationship.
   */
  if (
    businessAreaSolutionRows.length >
    0
  ) {
    if (
      selectedSolutions.length >
      0
    ) {
      linkedSolutions =
        selectedSolutions;
    } else {
      linkedSolutions =
        fallbackSelectedSolutions;
    }
  }

  /*
   * Priority 2:
   *
   * No new repeater has been
   * configured, so preserve the
   * old functionality.
   */
  if (
    businessAreaSolutionRows.length ===
    0
  ) {
    if (
      currentLinkedSolutions.length >
      0
    ) {
      linkedSolutions =
        currentLinkedSolutions;
    } else {
      linkedSolutions =
        fallbackLinkedSolutions;
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {sectionItems.map(
        (block, i) => {
          switch (
            block.acf_fc_layout
          ) {
            /* HERO */

            case "banner":
            case "hero":
            case "hero_section":
            case "business_area_hero":
              return (
                <BusinessAreaHero
                  key={i}
                  data={block}
                  lang={lang}
                />
              );

            /* COUNTER */

            case "counter_section":
            case "feature_counter":
            case "home_counter":
              return (
                <BusinessAreaCounterSection
                  key={i}
                  data={block}
                  lang={lang}
                />
              );

            /* EXPERTISE */

            case "expertise_areas":
              return (
                <BusinessAreaExpertiseAreas
                  key={i}
                  data={block}
                  lang={lang}
                />
              );

            /* HIGHLIGHT */

            case "highlight_banner":
              return (
                <BusinessAreaHighlightBanner
                  key={i}
                  data={block}
                  lang={lang}
                />
              );

            /* =================================================
               SOLUTION SLIDER
            ================================================= */

            case "solution_slider":
              return (
                <BusinessAreaSolutionSlider
                  key={i}
                  data={block}
                  lang={lang}
                  solutions={
                    linkedSolutions
                  }
                />
              );

            /* CASE STUDIES */

            case "casestudies_slider":
            case "case_studies_slider":
              return (
                <BusinessAreaCaseStudiesSlider
                  key={i}
                  data={block}
                  lang={lang}
                  prefetchedCases={
                    prefetchedCases
                  }
                />
              );

            /* OUR APPROACH */

            case "our_approach":
              return (
                <BusinessAreaOurApproach
                  key={i}
                  data={block}
                  lang={lang}
                />
              );

            /* FAQ */

            case "faq":
            case "faq_section":
              return (
                <BusinessAreaFAQ
                  key={i}
                  data={block}
                  lang={lang}
                />
              );

            /* WHY CHOOSE US */

            case "why_choose_us":
            case "why_choose":
              return (
                <BusinessAreaWhyChooseUs
                  key={i}
                  data={block}
                  lang={lang}
                />
              );

            /* TESTIMONIAL */

            case "testimonial":
            case "testimonial_slider":
              return (
                <BusinessAreaTestimonialSlider
                  key={i}
                  data={block}
                  prefetchedTestimonials={
                    prefetchedTestimonials
                  }
                />
              );

            /* CONTACT */

            case "contact_form_section":
            case "contact_form":
              return (
                <BusinessAreaContactFormSection
                  key={i}
                  data={block}
                  teamData={
                    sectionItems[
                      i + 1
                    ]?.acf_fc_layout ===
                    "team_member_section"
                      ? sectionItems[
                          i + 1
                        ]
                      : null
                  }
                  lang={lang}
                  prefetchedTeamMembers={
                    prefetchedTeamMembers
                  }
                />
              );

            /* TEAM MEMBER */

            case "team_member_section":
              return null;

            /* PROCESS */

            case "process_animation":
              return (
                <BusinessAreaProcessAnimation
                  key={i}
                  processSteps={
                    processSteps
                  }
                  lang={lang}
                />
              );

            default:
              return null;
          }
        }
      )}
    </>
  );
}