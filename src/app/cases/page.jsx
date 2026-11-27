import CaseStudiesArchivePage, {
  getCaseStudiesArchivePage,
} from "@/components/major/CaseStudiesArchivePage";
import { DEFAULT_LANG } from "@/config";
import {
  archiveSeoOptions,
  buildFaqSchema,
  buildMetadataFromYoast,
  buildSchemaFromYoast,
} from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 3600;

export default async function CasesPage() {
  const page = await getCaseStudiesArchivePage(DEFAULT_LANG);
  const { path } = archiveSeoOptions("cases", DEFAULT_LANG);

  return (
    <>
      <JsonLd data={buildSchemaFromYoast(page, { path })} />
      <JsonLd data={buildFaqSchema(page, { path, lang: DEFAULT_LANG })} />
      <CaseStudiesArchivePage lang={DEFAULT_LANG} />
    </>
  );
}

export async function generateMetadata() {
  const page = await getCaseStudiesArchivePage(DEFAULT_LANG);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Case studies - Panea",
    lang: DEFAULT_LANG,
    ...archiveSeoOptions("cases", DEFAULT_LANG),
  });
}
