// src/components/major/CasestudyBuilder.jsx

import { DEFAULT_LANG } from "@/config";
import { getRecentCaseStudies, getTestimonialsByIds } from "@/lib/api";
import CaseHero from "../sections/case-study/CaseHero";
import AboutTheProject from "../sections/case-study/AboutTheProject";
import ProjectSteps from "../sections/case-study/ProjectSteps";
import CaseStudyOurApproach from "../sections/case-study/OurApproach";
import ProjectGallery from "../sections/case-study/ProjectGallery";
import ProjectAchive from "../sections/case-study/ProjectAchive";
import CaseStudySection from "../sections/case-study/CaseStudySection";
import CaseStudyImageCtaBanner from "../sections/case-study/ImageCtaBanner";
import CaseStudyTestimonialSlider from "../sections/case-study/TestimonialSlider";

function selectedPosts(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function postId(item) {
  return typeof item === "object" ? item?.ID || item?.id : item;
}

function isTestimonialBlock(block) {
  return ["testimonial", "testimonials", "testimonial_slider"].includes(
    block?.acf_fc_layout
  );
}

function isProjectAchiveBlock(block) {
  return [
    "project_achive",
    "projectachive",
    "project_achive_section",
    "project_achieve",
    "project_achieved",
    "project_archive",
    "project_achievement",
    "project_achievements",
  ].includes(block?.acf_fc_layout);
}

function collectTestimonialIds(sections) {
  return sections
    .filter(isTestimonialBlock)
    .flatMap((block) => selectedPosts(block?.clients_testimonial))
    .map((item) => Number(postId(item)))
    .filter(Boolean);
}

export default async function CaseStudyBuilder({
  sections,
  lang = DEFAULT_LANG,
  caseStudyTitle = "",
  currentSlug = "",
}) {
  if (!sections) return null;

  const needsCases = sections.some(
    (block) => block?.acf_fc_layout === "case_study_section"
  );
  const testimonialIds = collectTestimonialIds(sections);
  const [prefetchedCases, prefetchedTestimonials] = await Promise.all([
    needsCases ? getRecentCaseStudies(lang) : [],
    testimonialIds.length ? getTestimonialsByIds(testimonialIds, lang) : [],
  ]);
  const galleryIndex = sections.findIndex(
    (block) => block?.acf_fc_layout === "project_gallery"
  );
  const testimonialBlocks = sections.filter(isTestimonialBlock);
  const projectAchiveBlocks = sections.filter(isProjectAchiveBlock);
  const isMovedBlock = (block) =>
    isTestimonialBlock(block) || isProjectAchiveBlock(block);
  const orderedSections =
    galleryIndex === -1 ||
    (!testimonialBlocks.length && !projectAchiveBlocks.length)
      ? sections
      : [
          ...sections.slice(0, galleryIndex + 1).filter((block) => !isMovedBlock(block)),
          ...projectAchiveBlocks,
          ...testimonialBlocks,
          ...sections.slice(galleryIndex + 1).filter((block) => !isMovedBlock(block)),
        ];

  return (
    <>
      {orderedSections.map((block, i) => {
        switch (block.acf_fc_layout) {
          case "hero_banner":
            return (
              <CaseHero
                key={i}
                data={block}
                lang={lang}
                pageTitle={caseStudyTitle}
              />
            );
          case "about_the_project":
            return (
              <AboutTheProject
                key={i}
                data={block}
              />
            );
          case "our_process":
            return <ProjectSteps key={i} data={block} />;
          case "our_approach":
            return <CaseStudyOurApproach key={i} data={block} />;
          case "project_gallery":
            return <ProjectGallery key={i} data={block} />;
          case "project_achive":
            return <ProjectAchive key={i} data={block} />;
          case "case_study_section":
            return (
              <CaseStudySection
                key={i}
                data={block}
                lang={lang}
                prefetchedCases={prefetchedCases}
                currentSlug={currentSlug}
              />
            );
          case "image_cta_banner":
            return (
              <CaseStudyImageCtaBanner key={i} data={block} lang={lang} />
            );
          case "testimonial":
          case "testimonials":
          case "testimonial_slider":
            return (
              <CaseStudyTestimonialSlider
                key={i}
                data={block}
                prefetchedTestimonials={prefetchedTestimonials}
              />
            );
          default:
            if (Array.isArray(block?.steps_content)) {
              return <ProjectSteps key={i} data={block} />;
            }
            if (Array.isArray(block?.gallery_images)) {
              return <ProjectGallery key={i} data={block} />;
            }
            return null;
        }
      })}
    </>
  );
}
