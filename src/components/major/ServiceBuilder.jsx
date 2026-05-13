//src/components/major/ServiceBuilder.jsx

import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import { getAllServices, getCaseStudies } from "@/lib/api";

const ServiceHero = dynamic(() => import("../sections/service/ServiceHero"));
const RealtedCase = dynamic(() => import("../sections/service/RealtedCase"));
const ServiceOverview = dynamic(() => import("../sections/service/Overview"));
const RelatedServices = dynamic(() => import("../sections/service/RelatedServices"));
const Faq = dynamic(() => import("../sections/service/Faq"));
const WhyChoose = dynamic(() => import("../sections/service/WhyChoose"));
const OurApproach = dynamic(() => import("../sections/service/OurApproach"));
const OurServicesSection = dynamic(() => import("../sections/service/OurServicesSection"));
const KeyProblemSection = dynamic(() => import("../sections/service/KeyProblemSection"));

async function prefetchServiceData(sections, lang) {
  if (!sections) return {};
  const needs = { services: false, cases: false };
  for (const block of sections) {
    if (block.acf_fc_layout === "services_section") needs.services = true;
    if (block.acf_fc_layout === "casestudies_section") needs.cases = true;
  }
  const [services, cases] = await Promise.all([
    needs.services ? getAllServices(lang) : null,
    needs.cases ? getCaseStudies(lang) : null,
  ]);
  return { services, cases };
}

export default async function ServicePageBuilder({ sections, lang = DEFAULT_LANG }) {
  if (!sections) return null;

  const prefetched = await prefetchServiceData(sections, lang);

  return (
    <>
      {sections.map((block, i) => {
        switch (block.acf_fc_layout) {
          case "hero_section":
            return <ServiceHero key={i} data={block} lang={lang} />;
          case "overview_section":
            return <ServiceOverview key={i} data={block} lang={lang} />;
          case "casestudies_section":
            return <RealtedCase key={i} data={block} lang={lang} prefetchedCases={prefetched.cases} />;
          case "services_section":
            return <RelatedServices key={i} data={block} lang={lang} prefetchedServices={prefetched.services} />;
          case "faq_section":
            return <Faq key={i} data={block} lang={lang} />;
          case "why_choose_section":
            return <WhyChoose key={i} data={block} lang={lang} />;
          case "our_approach_section":
            return <OurApproach key={i} data={block} lang={lang} />;
          case "our_services_section":
            return <OurServicesSection key={i} data={block} lang={lang} />;
          case "key_problem_section":
            return <KeyProblemSection key={i} data={block} lang={lang} />;
          default:
            return null;
        }
      })}
    </>
  );
}