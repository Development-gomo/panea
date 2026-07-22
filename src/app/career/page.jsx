import CareerPage, {
  getCareerPage,
} from "@/components/major/CareerPage";
import { DEFAULT_LANG } from "@/config";
import { buildMetadataFromYoast } from "@/lib/seo";

export const revalidate = 3600;

export default function SwedishCareerPage() {
  return <CareerPage lang={DEFAULT_LANG} />;
}

export async function generateMetadata() {
  const page = await getCareerPage(DEFAULT_LANG);

  return buildMetadataFromYoast(page, {
    fallbackTitle: "Karriär | panea",
    lang: DEFAULT_LANG,
  });
}
