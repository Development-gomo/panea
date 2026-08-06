import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import {
  getAllBusinessAreas,
  getAllCareers,
  getAllPosts,
  getAllSuppliers,
  getAllTeam,
  getRecentCaseStudies,
  getTeamMembersByIds,
  getTestimonialsByIds,
} from "@/lib/api";

const GenericHero = dynamic(() => import("../sections/generic/Hero"));
const GenericCounterSection = dynamic(() =>
  import("../sections/generic/CounterSection")
);
const GenericCaseStudiesSlider = dynamic(() =>
  import("../sections/generic/CaseStudiesSlider")
);
const GenericHighlightBanner = dynamic(() =>
  import("../sections/generic/HighlightBanner")
);
const GenericFAQ = dynamic(() => import("../sections/generic/FAQ"));
const GenericOurClients = dynamic(() => import("../sections/generic/OurClients"));
const GenericBusinessTabs = dynamic(() => import("../sections/generic/BusinessTabs"));
const GenericImageCtaBanner = dynamic(() =>
  import("../sections/generic/ImageCtaBanner")
);
const GenericHomeNews = dynamic(() => import("../sections/generic/HomeNews"));
const GenericContactFormSection = dynamic(() =>
  import("../sections/generic/ContactFormSection")
);
const GenericMapAndLocations = dynamic(() =>
  import("../sections/generic/MapAndLocations")
);
const GenericEmployeeListing = dynamic(() =>
  import("../sections/generic/EmployeeListing")
);
const GenericSupplierListing = dynamic(() =>
  import("../sections/generic/SupplierListing")
);
const GenericTestimonialSlider = dynamic(() =>
  import("../sections/generic/TestimonialSlider")
);
const GenericVacanciesListing = dynamic(() =>
  import("../sections/generic/VacanciesListing")
);

function selectedPosts(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function postId(item) {
  return typeof item === "object" ? item?.ID || item?.id : item;
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

function collectTestimonialIds(sections) {
  return sections
    .filter((block) =>
      ["testimonial", "testimonials", "testimonial_slider"].includes(
        block?.acf_fc_layout
      )
    )
    .flatMap((block) => selectedPosts(block.clients_testimonial))
    .map((item) => Number(postId(item)))
    .filter(Boolean);
}

export default async function GenericPageBuilder({
  sections,
  lang = DEFAULT_LANG,
  imageCtaContainerWidthClass,
}) {
  if (!sections) return null;

  const sectionItems = Array.isArray(sections) ? sections : [sections];
  const needsCases = sectionItems.some((block) =>
    ["casestudies_slider", "case_studies_slider"].includes(block?.acf_fc_layout)
  );
  const needsBusinessAreas = sectionItems.some(
    (block) => block?.acf_fc_layout === "business_tabs"
  );
  const needsPosts = sectionItems.some((block) => block?.acf_fc_layout === "news_section");
  const needsEmployees = sectionItems.some(
    (block) => block?.acf_fc_layout === "employee_listing"
  );
  const needsSuppliers = sectionItems.some(
    (block) => block?.acf_fc_layout === "supplier_listing"
  );
  const needsVacancies = sectionItems.some((block) =>
    ["vacancies", "vacancy_listing", "vacancies_listing", "career_listing"].includes(
      block?.acf_fc_layout
    )
  );
  const teamMemberIds = collectTeamMemberIds(sectionItems);
  const testimonialIds = collectTestimonialIds(sectionItems);
  const [
    prefetchedCases,
    prefetchedBusinessAreas,
    prefetchedPosts,
    prefetchedTeamMembers,
    prefetchedEmployees,
    prefetchedSuppliers,
    prefetchedTestimonials,
    prefetchedVacancies,
  ] = await Promise.all([
    needsCases ? getRecentCaseStudies(lang) : null,
    needsBusinessAreas ? getAllBusinessAreas(lang) : null,
    needsPosts ? getAllPosts(lang) : null,
    teamMemberIds.length ? getTeamMembersByIds(teamMemberIds, lang) : null,
    needsEmployees ? getAllTeam(lang) : null,
    needsSuppliers ? getAllSuppliers(lang) : null,
    testimonialIds.length
      ? getTestimonialsByIds(testimonialIds, lang)
      : null,
    needsVacancies ? getAllCareers(lang) : null,
  ]);

  return (
    <>
      {sectionItems.map((block, i) => {
        switch (block.acf_fc_layout) {
          case "banner":
          case "hero":
          case "hero_section":
          case "business_area_hero":
            return <GenericHero key={i} data={block} lang={lang} />;

          case "counter_section":
          case "feature_counter":
          case "home_counter":
            return <GenericCounterSection key={i} data={block} lang={lang} />;

          case "casestudies_slider":
          case "case_studies_slider":
            return (
              <GenericCaseStudiesSlider
                key={i}
                data={block}
                lang={lang}
                prefetchedCases={prefetchedCases}
              />
            );

          case "highlight_banner":
            return <GenericHighlightBanner key={i} data={block} lang={lang} />;

          case "faq":
          case "faq_section":
            return <GenericFAQ key={i} data={block} lang={lang} />;

          case "testimonial":
          case "testimonials":
          case "testimonial_slider":
            return (
              <GenericTestimonialSlider
                key={i}
                data={block}
                lang={lang}
                prefetchedTestimonials={prefetchedTestimonials}
              />
            );

          case "our_clients":
          case "clients":
            return <GenericOurClients key={i} data={block} lang={lang} />;

          case "business_tabs":
            return (
              <GenericBusinessTabs
                key={i}
                data={block}
                lang={lang}
                prefetchedBusinessAreas={prefetchedBusinessAreas}
              />
            );

          case "image_cta_banner":
            return (
              <GenericImageCtaBanner
                key={i}
                data={block}
                lang={lang}
                containerWidthClass={imageCtaContainerWidthClass}
              />
            );

          case "news_section":
            return (
              <GenericHomeNews
                key={i}
                data={block}
                lang={lang}
                prefetchedPosts={prefetchedPosts}
              />
            );

          case "contact_form_section":
          case "contact_form":
            return (
              <GenericContactFormSection
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

          case "map_and_locations":
            return <GenericMapAndLocations key={i} data={block} lang={lang} />;

          case "employee_listing":
            return (
              <GenericEmployeeListing
                key={i}
                data={block}
                lang={lang}
                employees={prefetchedEmployees}
              />
            );

          case "supplier_listing":
            return (
              <GenericSupplierListing
                key={i}
                data={block}
                lang={lang}
                suppliers={prefetchedSuppliers}
              />
            );

          case "vacancies":
          case "vacancy_listing":
          case "vacancies_listing":
          case "career_listing":
            return (
              <GenericVacanciesListing
                key={i}
                data={block}
                lang={lang}
                vacancies={prefetchedVacancies || []}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
