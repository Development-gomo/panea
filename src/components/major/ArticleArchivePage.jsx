import Footer from "@/components/major/Footer";
import GenericPageBuilder from "@/components/major/GenericPageBuilder";
import Header from "@/components/major/Header";
import ArticleArchivePosts from "@/components/sections/article/ArticleArchivePosts";
import GenericImageCtaBanner from "@/components/sections/generic/ImageCtaBanner";
import GenericHero from "@/components/sections/generic/Hero";
import { DEFAULT_LANG } from "@/config";
import {
  getArticleArchivePosts,
  getMenu,
  getPageBySlug,
  getPostCategories,
  getThemeOptions,
} from "@/lib/api";
import { notFound } from "next/navigation";

export const ARTICLE_ARCHIVE_SLUGS = {
  sv: "artiklar",
  en: "article",
};

export async function getArticleArchivePage(lang = DEFAULT_LANG) {
  const slug = ARTICLE_ARCHIVE_SLUGS[lang] || ARTICLE_ARCHIVE_SLUGS.en;
  return getPageBySlug(slug, lang);
}

function findLayoutBlock(value, layoutName) {
  if (!value) return null;

  if (Array.isArray(value)) {
    const matchingBlock = value.find(
      (item) => item?.acf_fc_layout === layoutName
    );

    if (matchingBlock) return matchingBlock;

    for (const item of value) {
      const nestedBlock = findLayoutBlock(item, layoutName);
      if (nestedBlock) return nestedBlock;
    }

    return null;
  }

  if (typeof value !== "object") return null;
  if (value.acf_fc_layout === layoutName) return value;

  const directBlock = value[layoutName];
  if (directBlock && typeof directBlock === "object") {
    return Array.isArray(directBlock) ? directBlock[0] || null : directBlock;
  }

  for (const nestedValue of Object.values(value)) {
    const nestedBlock = findLayoutBlock(nestedValue, layoutName);
    if (nestedBlock) return nestedBlock;
  }

  return null;
}

export default async function ArticleArchivePage({ lang = DEFAULT_LANG }) {
  const [page, menu, themeOptions, posts, categories] = await Promise.all([
    getArticleArchivePage(lang),
    getMenu(lang),
    getThemeOptions(lang),
    getArticleArchivePosts(lang),
    getPostCategories(lang),
  ]);

  if (!page) notFound();

  const sections =
    page?.acf?.generic_page_builder ||
    page?.acf?.article_page_builder ||
    page?.acf?.articles_page_builder ||
    page?.acf?.page_builder ||
    [];
  const heroData =
    findLayoutBlock(page?.acf, "banner") ||
    findLayoutBlock(page?.acf, "hero") ||
    findLayoutBlock(page?.acf, "hero_section") ||
    findLayoutBlock(page?.acf, "hero_banner");
  const imageCtaData = findLayoutBlock(page?.acf, "image_cta_banner");
  const contentSections = sections.filter(
    (block) =>
      ![
        "hero_banner",
        "banner",
        "hero",
        "hero_section",
        "article_listing",
        "articles_listing",
        "news_section",
        "image_cta_banner",
      ].includes(block?.acf_fc_layout)
  );
  const archiveSlug =
    ARTICLE_ARCHIVE_SLUGS[lang] || ARTICLE_ARCHIVE_SLUGS.en;

  return (
    <>
      <Header
        lang={lang}
        currentSlug={archiveSlug}
        entryType="pages"
        entryId={page?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main id="article-archive" className="overflow-x-clip">
        <GenericHero
          data={heroData}
          pageTitle={lang === "sv" ? "Artiklar" : "Articles"}
          scrollTargetId="article-archive-grid"
        />
        <GenericPageBuilder sections={contentSections} lang={lang} />
        <ArticleArchivePosts
          lang={lang}
          posts={Array.isArray(posts) ? posts : []}
          categories={Array.isArray(categories) ? categories : []}
        />
        <GenericImageCtaBanner
          data={imageCtaData}
          lang={lang}
          containerWidthClass="web-width px-6"
          sectionSpacingClass="pt-[60px] pb-[120px]"
        />
      </main>
      <Footer lang={lang} currentSlug={archiveSlug} />
    </>
  );
}
