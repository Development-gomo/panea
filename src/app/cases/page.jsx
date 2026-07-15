import CaseStudiesArchivePage, {
  getCaseStudiesArchivePage,
} from "@/components/major/CaseStudiesArchivePage";
import { DEFAULT_LANG } from "@/config";
import { buildMetadataFromYoast } from "@/lib/seo";

export const revalidate = 3600;

export default function CasesPage() {
  return <CaseStudiesArchivePage lang={DEFAULT_LANG} />;
}

export async function generateMetadata() {
  const page = await getCaseStudiesArchivePage(DEFAULT_LANG);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Case studies | panea",
    lang: DEFAULT_LANG,
  });
}
