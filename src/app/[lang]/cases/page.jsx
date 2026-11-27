import CaseStudiesArchivePage, {
  getCaseStudiesArchivePage,
} from "@/components/major/CaseStudiesArchivePage";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";
import { resolveParams } from "@/lib/params";
import {
  archiveSeoOptions,
  buildFaqSchema,
  buildMetadataFromYoast,
  buildSchemaFromYoast,
} from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

async function getLanguage(params) {
  const resolved = resolveParams(await params);
  const lang = resolved?.lang || DEFAULT_LANG;

  if (!SUPPORTED_LANGS.includes(lang)) notFound();
  return lang;
}

export default async function LocalizedCasesPage({ params }) {
  const lang = await getLanguage(params);
  const page = await getCaseStudiesArchivePage(lang);
  const { path } = archiveSeoOptions("cases", lang);

  return (
    <>
      <JsonLd data={buildSchemaFromYoast(page, { path })} />
      <JsonLd data={buildFaqSchema(page, { path, lang: lang })} />
      <CaseStudiesArchivePage lang={lang} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const lang = await getLanguage(params);
  const page = await getCaseStudiesArchivePage(lang);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Case studies - Panea",
    lang,
    ...archiveSeoOptions("cases", lang),
  });
}
