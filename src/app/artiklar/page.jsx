import ArticleArchivePage, {
  getArticleArchivePage,
} from "@/components/major/ArticleArchivePage";
import { DEFAULT_LANG } from "@/config";
import {
  archiveSeoOptions,
  buildFaqSchema,
  buildMetadataFromYoast,
  buildSchemaFromYoast,
} from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 3600;

export default async function ArticlesPage() {
  const page = await getArticleArchivePage(DEFAULT_LANG);
  const { path } = archiveSeoOptions("articles", DEFAULT_LANG);

  return (
    <>
      <JsonLd data={buildSchemaFromYoast(page, { path })} />
      <JsonLd data={buildFaqSchema(page, { path, lang: DEFAULT_LANG })} />
      <ArticleArchivePage lang={DEFAULT_LANG} />
    </>
  );
}

export async function generateMetadata() {
  const page = await getArticleArchivePage(DEFAULT_LANG);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Artiklar - Panea",
    lang: DEFAULT_LANG,
    ...archiveSeoOptions("articles", DEFAULT_LANG),
  });
}
