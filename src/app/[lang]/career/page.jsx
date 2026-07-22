import CareerPage, {
  getCareerPage,
} from "@/components/major/CareerPage";
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

  if (!SUPPORTED_LANGS.includes(lang) || lang === DEFAULT_LANG) notFound();
  return lang;
}

export default async function LocalizedCareerPage({ params }) {
  const lang = await getLanguage(params);
  return <CareerPage lang={lang} />;
}

export async function generateMetadata({ params }) {
  const lang = await getLanguage(params);
  const page = await getCareerPage(lang);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Career | panea",
    lang,
  });
}
