import ArticleArchivePage, {
  getArticleArchivePage,
} from "@/components/major/ArticleArchivePage";
import { DEFAULT_LANG } from "@/config";
import { buildMetadataFromYoast } from "@/lib/seo";

export const revalidate = 3600;

export default function ArticlesPage() {
  return <ArticleArchivePage lang={DEFAULT_LANG} />;
}

export async function generateMetadata() {
  const page = await getArticleArchivePage(DEFAULT_LANG);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Artiklar | panea",
    lang: DEFAULT_LANG,
  });
}
