import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";

const BusinessAreaHero = dynamic(() => import("../sections/business-area/Hero"));

export default function BusinessAreaBuilder({
  sections,
  lang = DEFAULT_LANG,
}) {
  if (!sections) return null;

  return (
    <>
      {sections.map((block, i) => {
        switch (block.acf_fc_layout) {
          case "banner":
          case "hero":
          case "hero_section":
          case "business_area_hero":
            return <BusinessAreaHero key={i} data={block} lang={lang} />;

          default:
            return null;
        }
      })}
    </>
  );
}
