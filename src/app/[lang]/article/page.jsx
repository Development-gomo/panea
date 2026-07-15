import ArticleArchivePage, {
  getArticleArchivePage,
} from "@/components/major/ArticleArchivePage";
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

export default async function LocalizedArticlesPage({ params }) {
  const lang = await getLanguage(params);
  return <ArticleArchivePage lang={lang} />;
}

export async function generateMetadata({ params }) {
  const lang = await getLanguage(params);
  const page = await getArticleArchivePage(lang);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Articles | panea",
    lang,
  });
}
