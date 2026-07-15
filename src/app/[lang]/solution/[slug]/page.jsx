// src/app/[lang]/solution/[slug]/page.jsx

import Header from "@/components/major/Header";
import SolutionBuilder from "@/components/major/SolutionBuilder";
import Footer from "@/components/major/Footer";
import { resolveParams } from "@/lib/params";
import { getAllSolutions, getMenu, getSolutionBySlug, getThemeOptions } from "@/lib/api";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

export const revalidate = 3600;

export async function generateStaticParams() {
  const results = await Promise.all(
    SUPPORTED_LANGS.map((lang) => getAllSolutions(lang))
  );
  return SUPPORTED_LANGS.flatMap((lang, i) =>
    (Array.isArray(results[i]) ? results[i] : []).map((solution) => ({
      lang,
      slug: solution.slug,
    }))
  );
}

export default async function SolutionSinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) notFound();

  const [solution, menu, themeOptions] = await Promise.all([
    getSolutionBySlug(slug, lang),
    getMenu(lang),
    getThemeOptions(lang),
  ]);

  if (!solution) notFound();

  const sections = solution?.acf?.solution_page_builder || null;

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType="solutions"
        pathPrefix=""
        entryId={solution?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        <SolutionBuilder
          sections={sections}
          lang={lang}
          solutionData={solution?.acf || {}}
        />
      </main>
      <Footer lang={lang} currentSlug={slug} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);
  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) {
    return {
      title: "Solution | panea",
    };
  }

  const solution = await getSolutionBySlug(slug, lang);
  return buildMetadataFromYoast(solution, {
    fallbackTitle: `${slug} | panea`,
    lang,
  });
}
