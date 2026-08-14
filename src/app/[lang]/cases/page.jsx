import CaseStudiesArchivePage, {
  getCaseStudiesArchivePage,
} from "@/components/major/CaseStudiesArchivePage";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";
import { resolveParams } from "@/lib/params";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export function generateStaticParams() {
  return SUPPORTED_LANGS.filter((lang) => lang !== DEFAULT_LANG).map((lang) => ({
    lang,
  }));
}

async function getLanguage(params) {
  const resolved = resolveParams(await params);
  const lang = resolved?.lang || DEFAULT_LANG;

  // Default language is served by the root /cases page (see src/app/cases/page.jsx).
  // Without this guard, /sv/cases would duplicate /cases as a second live URL.
  if (!SUPPORTED_LANGS.includes(lang) || lang === DEFAULT_LANG) notFound();
  return lang;
}

export default async function LocalizedCasesPage({ params }) {
  const lang = await getLanguage(params);
  return <CaseStudiesArchivePage lang={lang} />;
}

export async function generateMetadata({ params }) {
  const lang = await getLanguage(params);
  const page = await getCaseStudiesArchivePage(lang);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Case studies | panea",
    lang,
  });
}
