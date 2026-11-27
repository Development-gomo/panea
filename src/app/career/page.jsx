import CareerPage, {
  getCareerPage,
} from "@/components/major/CareerPage";
import { DEFAULT_LANG } from "@/config";
import {
  archiveSeoOptions,
  buildFaqSchema,
  buildMetadataFromYoast,
  buildSchemaFromYoast,
} from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 3600;

export default async function SwedishCareerPage() {
  const page = await getCareerPage(DEFAULT_LANG);
  const { path } = archiveSeoOptions("career", DEFAULT_LANG);

  return (
    <>
      <JsonLd data={buildSchemaFromYoast(page, { path })} />
      <JsonLd data={buildFaqSchema(page, { path, lang: DEFAULT_LANG })} />
      <CareerPage lang={DEFAULT_LANG} />
    </>
  );
}

export async function generateMetadata() {
  const page = await getCareerPage(DEFAULT_LANG);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Karriär - Panea",
    lang: DEFAULT_LANG,
    ...archiveSeoOptions("career", DEFAULT_LANG),
  });
}
