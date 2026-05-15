//src/components/major/PageBuilder.jsx

import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import { getAllServices, getCaseStudies, getAllPosts, getAllTeam, getThemeOptions } from "@/lib/api";

const Hero = dynamic(() => import("../sections/home/HomeHero"));
const AboutUs = dynamic(() => import("../sections/home/HomeAbout"));
const ServicesSlider = dynamic(() => import("../sections/home/HomeServices"));
const HomeCounter = dynamic(() => import("../sections/home/HomeCounter"));
const HomeCaseStudies = dynamic(() => import("../sections/home/HomeCaseStudies"));
const HomeNews = dynamic(() => import("../sections/home/HomeNews"));
const AskAI = dynamic(() => import("../sections/home/HomeAIAsk"));
const HomePartners = dynamic(() => import("../sections/home/HomePartners"));
const InnerHero = dynamic(() => import("../sections/inner-pages/InnerHero"));
const Overview = dynamic(() => import("../sections/inner-pages/Overview"));
const CollaborationSection = dynamic(() => import("../sections/inner-pages/CollaborationSection"));
const TeamSection = dynamic(() => import("../sections/inner-pages/Teams"));
const CoreValueSection = dynamic(() => import("../sections/inner-pages/CoreValue"));
const LargeContent = dynamic(() => import("../sections/inner-pages/LargeContent"));
const Connectform = dynamic(() => import("../sections/inner-pages/Cform"));
const CaseStudyListing = dynamic(() => import("../sections/inner-pages/CaseStusyListing"));
const ClientsLogoSlider = dynamic(() => import("../sections/clients/ClientsLogoSlider"));
const ImageCtaBanner = dynamic(() => import("../sections/home/ImageCtaBanner"));

// Detect which data the page needs and fetch it all in parallel (server-side)
async function prefetchSectionData(sections, lang) {
  if (!sections) return {};

  const needs = { services: false, cases: false, posts: false, team: false, clients: false };

  for (const block of sections) {
    if (block.acf_fc_layout === "services_section") needs.services = true;
    if (block.acf_fc_layout === "casestudies_section") needs.cases = true;
    if (block.acf_fc_layout === "case_study_listing") needs.cases = true;
    if (block.acf_fc_layout === "news_section") needs.posts = true;
    if (block.acf_fc_layout === "team_section") needs.team = true;
    if (block.acf_fc_layout === "clients_slider_section") needs.clients = true;
  }

  const [services, cases, posts, team, themeOpts] = await Promise.all([
    needs.services ? getAllServices(lang) : null,
    needs.cases ? getCaseStudies(lang) : null,
    needs.posts ? getAllPosts(lang) : null,
    needs.team ? getAllTeam(lang) : null,
    needs.clients ? getThemeOptions(lang) : null,
  ]);

  const clients = themeOpts?.clients?.client_images || [];
  const clientsTitle = themeOpts?.clients?.logo_slider_title || "";

  return { services, cases, posts, team, clients, clientsTitle };
}

export default async function PageBuilder({ sections, lang = DEFAULT_LANG }) {
  if (!sections) return null;

  const prefetched = await prefetchSectionData(sections, lang);

  return (
    <>
      {sections.map((block, i) => {
        switch (block.acf_fc_layout) {
          case "home_hero":
            return <Hero key={i} data={block} lang={lang} />;

          case "about_us_section":
            return <AboutUs key={i} data={block} lang={lang} />;

          case "services_section":
            return <ServicesSlider key={i} data={block} lang={lang} prefetchedServices={prefetched.services} />;

          case "counter_section":
            return <HomeCounter key={i} data={block} lang={lang} />;

          case "counter_section_main":
            return <HomeCounter key={i} data={block} lang={lang} />;

          case "casestudies_section":
            return <HomeCaseStudies key={i} data={block} lang={lang} prefetchedCases={prefetched.cases} />;
          
          case "case_study_listing":
            return <CaseStudyListing key={i} data={block} lang={lang} prefetchedCases={prefetched.cases} />;

          case "news_section":
            return <HomeNews key={i} data={block} lang={lang} prefetchedPosts={prefetched.posts} />;

          case "home_ask_ai_section":
            return <AskAI key={i} data={block} lang={lang} />;  

          case "home_partners_section":
            return <HomePartners key={i} data={block} lang={lang} />;

          case "hero_section":
            return <InnerHero key={i} data={block} lang={lang} />;

          case "overview_section":
            return <Overview key={i} data={block} lang={lang} />;

          case "collaboration_section":
            return <CollaborationSection key={i} data={block} lang={lang} />;

          case "team_section":
            return <TeamSection key={i} data={block} lang={lang} prefetchedTeam={prefetched.team} />;

          case "core_value_section":
            return <CoreValueSection key={i} data={block} lang={lang} />;

          case "large_content_section":
            return <LargeContent key={i} data={block} lang={lang} />;

          case "contact_form_section":
            return <Connectform key={i} data={block} lang={lang} />;

          case "clients_slider_section":
            return <ClientsLogoSlider key={i} clients={prefetched.clients} title={prefetched.clientsTitle} />;

          case "image_cta_banner":
            return <ImageCtaBanner key={i} data={block} lang={lang} />;

          default:
            return null;
        }
      })}
    </>
  );
}