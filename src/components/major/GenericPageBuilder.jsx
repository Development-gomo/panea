import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import { getAllBusinessAreas, getAllPosts, getCaseStudies } from "@/lib/api";

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

export default async function GenericPageBuilder({
  sections,
  lang = DEFAULT_LANG,
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
  const [prefetchedCases, prefetchedBusinessAreas, prefetchedPosts] = await Promise.all([
    needsCases ? getCaseStudies(lang) : null,
    needsBusinessAreas ? getAllBusinessAreas(lang) : null,
    needsPosts ? getAllPosts(lang) : null,
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
            return <GenericImageCtaBanner key={i} data={block} lang={lang} />;

          case "news_section":
            return (
              <GenericHomeNews
                key={i}
                data={block}
                lang={lang}
                prefetchedPosts={prefetchedPosts}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}