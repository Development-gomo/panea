import Footer from "@/components/major/Footer";
import GenericPageBuilder from "@/components/major/GenericPageBuilder";
import Header from "@/components/major/Header";
import GenericHero from "@/components/sections/generic/Hero";
import { DEFAULT_LANG } from "@/config";
import {
  getMenu,
  getPageBySlug,
  getThemeOptions,
} from "@/lib/api";
import { notFound } from "next/navigation";

export const CAREER_PAGE_SLUGS = {
  sv: "karriar",
  en: "career",
};

export async function getCareerPage(lang = DEFAULT_LANG) {
  const slug = CAREER_PAGE_SLUGS[lang] || CAREER_PAGE_SLUGS.en;
  return getPageBySlug(slug, lang);
}

function getBanner(acf = {}, sections = []) {
  if (acf.banner && typeof acf.banner === "object") {
    return Array.isArray(acf.banner) ? acf.banner[0] || null : acf.banner;
  }

  return sections.find((block) => block?.acf_fc_layout === "banner") || null;
}

function mapCareerFaqFields(block) {
  if (
    !["faq", "faq_section", "faqs", "frequently_asked_questions"].includes(
      block?.acf_fc_layout
    )
  ) {
    return block;
  }

  const nestedFields =
    block.faq_fields && typeof block.faq_fields === "object"
      ? block.faq_fields
      : {};
  const fields = { ...block, ...nestedFields };
  const ctaLink = fields.cta_link || fields.link || {};

  return {
    ...fields,
    acf_fc_layout: "faq",
    text_above_title:
      fields.text_above_title || fields.pre_title || fields.subtitle || "",
    title: fields.title || fields.heading || "",
    cta_text:
      fields.cta_text || fields.button_text || ctaLink.title || "",
    cta_url: fields.cta_url || fields.button_url || ctaLink.url || "",
    "q&a":
      fields["q&a"] ||
      fields.q_a ||
      fields.qa ||
      fields.faqs ||
      fields.faq_items ||
      fields.items ||
      [],
  };
}

function mapCareerCounterFields(block) {
  if (
    !["counter_section", "feature_counter", "home_counter", "counters"].includes(
      block?.acf_fc_layout
    )
  ) {
    return block;
  }

  const nestedFields =
    block.counter_fields && typeof block.counter_fields === "object"
      ? block.counter_fields
      : {};
  const fields = { ...block, ...nestedFields };
  const counterRows =
    fields.counters ||
    fields.counter_data ||
    fields.counter_items ||
    fields.stats ||
    [];

  return {
    ...fields,
    acf_fc_layout: "counter_section",
    text_above_title:
      fields.text_above_title || fields.pre_title || fields.subtitle || "",
    title: fields.title || fields.heading || "",
    image: fields.image || fields.section_image || null,
    content:
      fields.content || fields.description || fields.body_content || "",
    image_position: fields.image_position || fields.position || "",
    counters: Array.isArray(counterRows)
      ? counterRows.map((row) => {
          const item = row?.counter_data || row || {};

          return {
            ...item,
            number: item.number ?? item.value ?? item.count ?? "",
            suffix: item.suffix || item.symbol || "",
            short_text:
              item.short_text || item.label || item.text || item.title || "",
          };
        })
      : [],
  };
}

function mapCareerTestimonialFields(block) {
  if (
    !["testimonial", "testimonials", "testimonial_slider"].includes(
      block?.acf_fc_layout
    )
  ) {
    return block;
  }

  const nestedFields =
    block.testimonial_fields && typeof block.testimonial_fields === "object"
      ? block.testimonial_fields
      : {};
  const fields = { ...block, ...nestedFields };

  return {
    ...fields,
    acf_fc_layout: "testimonial",
    text_above_title:
      fields.text_above_title || fields.pre_title || fields.subtitle || "",
    title: fields.title || fields.heading || "",
    clients_testimonial:
      fields.clients_testimonial ||
      fields.testimonials ||
      fields.select_testimonials ||
      [],
  };
}

function mapCareerVacanciesFields(block) {
  const layout = String(block?.acf_fc_layout || "").toLowerCase();
  const isVacanciesLayout =
    [
      "vacancies",
      "vacancy",
      "vacancy_section",
      "vacancy_listing",
      "vacancies_section",
      "vacancies_listing",
      "career_listing",
      "career_vacancies",
      "jobs",
      "jobs_listing",
      "open_positions",
    ].includes(layout) ||
    layout.includes("vacanc") ||
    layout.includes("open_position") ||
    (layout.includes("career") && layout.includes("listing"));
  const hasVacancyFieldSignature = Object.prototype.hasOwnProperty.call(
    block || {},
    "short_description"
  );

  if (!isVacanciesLayout && !hasVacancyFieldSignature) {
    return block;
  }

  const nestedFields =
    block.vacancies_fields && typeof block.vacancies_fields === "object"
      ? block.vacancies_fields
      : {};
  const fields = { ...block, ...nestedFields };

  return {
    ...fields,
    acf_fc_layout: "vacancies_listing",
    anchor_id: "career-vacancies",
    text_above_title:
      fields.text_above_title || fields.pre_title || fields.subtitle || "",
    title: fields.title || fields.heading || "",
    short_description:
      fields.short_description || fields.description || fields.content || "",
    form_text_above_title: fields.form_text_above_title || "",
    form_title: fields.form_title || "",
    short_information_about_career:
      fields.short_information_about_career || "",
    select_form: fields.select_form || null,
  };
}

function placeCountersFirst(sections) {
  const counterSections = sections.filter(
    (block) => block?.acf_fc_layout === "counter_section"
  );

  if (!counterSections.length) return sections;

  return [
    ...counterSections,
    ...sections.filter(
      (block) => block?.acf_fc_layout !== "counter_section"
    ),
  ];
}

function placeFaqBeforeImageCta(sections) {
  const faqSections = sections.filter(
    (block) => block?.acf_fc_layout === "faq"
  );
  const remainingSections = sections.filter(
    (block) => block?.acf_fc_layout !== "faq"
  );
  const imageCtaIndex = remainingSections.findIndex(
    (block) => block?.acf_fc_layout === "image_cta_banner"
  );

  if (!faqSections.length || imageCtaIndex === -1) return sections;

  return [
    ...remainingSections.slice(0, imageCtaIndex),
    ...faqSections,
    ...remainingSections.slice(imageCtaIndex),
  ];
}

function placeTestimonialsBeforeFaq(sections) {
  const testimonialSections = sections.filter(
    (block) => block?.acf_fc_layout === "testimonial"
  );
  const remainingSections = sections.filter(
    (block) => block?.acf_fc_layout !== "testimonial"
  );
  const faqIndex = remainingSections.findIndex(
    (block) => block?.acf_fc_layout === "faq"
  );

  if (!testimonialSections.length || faqIndex === -1) return sections;

  return [
    ...remainingSections.slice(0, faqIndex),
    ...testimonialSections,
    ...remainingSections.slice(faqIndex),
  ];
}

function placeVacanciesBeforeTestimonials(sections) {
  const vacancySections = sections.filter(
    (block) => block?.acf_fc_layout === "vacancies_listing"
  );
  const remainingSections = sections.filter(
    (block) => block?.acf_fc_layout !== "vacancies_listing"
  );
  const testimonialIndex = remainingSections.findIndex(
    (block) => block?.acf_fc_layout === "testimonial"
  );

  if (!vacancySections.length || testimonialIndex === -1) return sections;

  return [
    ...remainingSections.slice(0, testimonialIndex),
    ...vacancySections,
    ...remainingSections.slice(testimonialIndex),
  ];
}

function getTopLevelVacanciesSection(acf = {}, sections = []) {
  const hasVacanciesSection = sections.some(
    (block) => block?.acf_fc_layout === "vacancies_listing"
  );

  if (
    hasVacanciesSection ||
    (!acf.text_above_title && !acf.title && !acf.short_description)
  ) {
    return null;
  }

  return {
    acf_fc_layout: "vacancies_listing",
    anchor_id: "career-vacancies",
    text_above_title: acf.text_above_title || "",
    title: acf.title || "",
    short_description: acf.short_description || "",
    form_text_above_title: acf.form_text_above_title || "",
    form_title: acf.form_title || "",
    short_information_about_career:
      acf.short_information_about_career || "",
    select_form: acf.select_form || null,
  };
}

export default async function CareerPage({ lang = DEFAULT_LANG }) {
  const [page, menu, themeOptions] = await Promise.all([
    getCareerPage(lang),
    getMenu(lang),
    getThemeOptions(lang),
  ]);

  if (!page) notFound();

  const sections = Array.isArray(page?.acf?.generic_page_builder)
    ? page.acf.generic_page_builder
    : [];
  const banner = getBanner(page?.acf, sections);
  const mappedSections = sections
    .filter((block) => block?.acf_fc_layout !== "banner")
    .map(mapCareerCounterFields)
    .map(mapCareerVacanciesFields)
    .map(mapCareerTestimonialFields)
    .map(mapCareerFaqFields);
  const topLevelVacanciesSection = getTopLevelVacanciesSection(
    page?.acf,
    mappedSections
  );
  const contentSections = placeCountersFirst(
    placeVacanciesBeforeTestimonials(
      placeTestimonialsBeforeFaq(
        placeFaqBeforeImageCta(
          topLevelVacanciesSection
            ? [...mappedSections, topLevelVacanciesSection]
            : mappedSections
        )
      )
    )
  );
  const slug = CAREER_PAGE_SLUGS[lang] || CAREER_PAGE_SLUGS.en;

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType="pages"
        entryId={page.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main id="career-page" className="overflow-x-clip">
        <GenericHero
          data={banner}
          lang={lang}
          scrollTargetId="career-vacancies"
        />
        <div id="career-page-content" tabIndex={-1}>
          <GenericPageBuilder
            sections={contentSections}
            lang={lang}
            imageCtaContainerWidthClass="web-width px-6"
          />
        </div>
      </main>
      <Footer lang={lang} currentSlug={slug} />
    </>
  );
}
