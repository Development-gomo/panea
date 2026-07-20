// src/app/[lang]/[slug]/page.jsx

import {
  getPageBySlug,
  getBusinessAreaBySlug,
  getCaseStudyBySlug,
  getPostBySlug,
  getCaseStudies,
  getSolutionBySlug,
  getAllSolutions,
  fetchWP,
  getMenu,
  getThemeOptions,
  getAllBusinessAreas,
  getAllProducts,
  getProductBrands,
  getProductCategories,
  getTeamMembersByIds,
  getProductBySlug,
  getRelatedProducts,
  getTestimonialsByIds,
  getMediaById,
} from "@/lib/api";
import { resolveParams } from "@/lib/params";
import PageBuilder from "@/components/major/PageBuilder";
import BusinessAreaBuilder from "@/components/major/BusinessAreaBuilder";
import CaseStudyBuilder from "@/components/major/CasestudyBuilder";
import SolutionBuilder from "@/components/major/SolutionBuilder";
import GenericPageBuilder from "@/components/major/GenericPageBuilder";
import WebshopPage from "@/components/product/webshop/WebshopPage";
import { ProductPage } from "@/components/product";
import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_LANG, SUPPORTED_LANGS, langHome } from "@/config";
import CalendarIcon from "../../../../public/p-calender-icon.png";
import TagIcon from "../../../../public/p-tag-icon.png";
import TimeIcon from "../../../../public/p-time-icon.png";
import ShareInstagramIcon from "../../../../public/p-share-ig.png";
import ShareFacebookIcon from "../../../../public/p-share-fb.png";
import ShareLinkedInIcon from "../../../../public/p-share-ln.png";
import ShareXIcon from "../../../../public/p-share-x.png";

export const revalidate = 3600;

export async function generateStaticParams() {
  const [pageResults, businessAreaResults, caseStudyResults, solutionResults, postResults] = await Promise.all([
    Promise.all(
      SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/pages?per_page=100&lang=${lang}`))
    ),
    Promise.all(SUPPORTED_LANGS.map((lang) => getAllBusinessAreas(lang))),
    Promise.all(SUPPORTED_LANGS.map((lang) => getCaseStudies(lang))),
    Promise.all(SUPPORTED_LANGS.map((lang) => getAllSolutions(lang))),
    Promise.all(
      SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/posts?per_page=100&lang=${lang}`))
    ),
  ]);

  const params = SUPPORTED_LANGS.flatMap((lang, i) =>
    [
      ...(Array.isArray(pageResults[i]) ? pageResults[i] : []),
      ...(Array.isArray(businessAreaResults[i]) ? businessAreaResults[i] : []),
      ...(Array.isArray(caseStudyResults[i]) ? caseStudyResults[i] : []),
      ...(Array.isArray(solutionResults[i]) ? solutionResults[i] : []),
      ...(Array.isArray(postResults[i]) ? postResults[i] : []),
    ].map((entry) => ({ lang, slug: entry.slug }))
  );

  const seen = new Set();
  return params.filter((param) => {
    const key = `${param.lang}/${param.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getBusinessAreaSections(acf = {}) {
  const builderFields = [
    acf.business_area_page_builder,
    acf.business_areas_page_builder,
    acf.page_builder,
  ];

  return (
    builderFields.find((sections) => Array.isArray(sections) && sections.length > 0) ||
    builderFields.find((sections) => Array.isArray(sections)) ||
    null
  );
}

function normalizeSelectedPosts(selected) {
  if (!selected) return [];
  return Array.isArray(selected) ? selected : [selected];
}

function collectWebshopTeamMemberIds(page) {
  const builder = page?.acf?.webshop_page_builder;
  if (!Array.isArray(builder)) return [];

  return builder
    .filter(
      (block) =>
        ["contact_form_section", "contact_form"].includes(
          block?.acf_fc_layout
        ) || block?.acf_fc_layout === "team_member_section"
    )
    .flatMap((block) => normalizeSelectedPosts(block.select_team_members))
    .map((item) => (typeof item === "object" ? item?.ID || item?.id : item))
    .filter(Boolean);
}

function InsightPostBody({ post }) {
  const sections = post?.acf?.insight_page_builder;
  const contentHtml = post?.content?.rendered;

  if (Array.isArray(sections) && sections.length > 0) {
    return sections.map((block, index) => {
      if (block?.acf_fc_layout !== "text_editor" || !block?.body_content) {
        return null;
      }

      return (
        <div
          key={index}
          className="max-w-none [&>p]:mb-6"
          dangerouslySetInnerHTML={{ __html: block.body_content }}
        />
      );
    });
  }

  if (contentHtml) {
    return (
      <div
        className="max-w-none [&>p]:mb-6"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

  return (
    <p className="text-center text-gray-500">Content will be available soon.</p>
  );
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, "").trim();
}

function decodeHtml(value = "") {
  return String(value)
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getPlainText(value = "") {
  if (value && typeof value === "object") {
    return getPlainText(value.rendered || value.raw || "");
  }

  return decodeHtml(stripHtml(value)).replace(/\s+/g, " ").trim();
}

function truncateText(value = "", maxLength = 46) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function getPostTitle(post) {
  return getPlainText(post?.title?.rendered || post?.title || "");
}

function getPostExcerpt(post) {
  return getPlainText(
    post?.excerpt?.rendered ||
      post?.acf?.excerpt ||
      post?.excerpt ||
      ""
  );
}

function getInsightTextBlocks(post) {
  const sections = post?.acf?.insight_page_builder;
  if (!Array.isArray(sections)) return [];

  return sections.filter(
    (block) => block?.acf_fc_layout === "text_editor" && block?.body_content
  );
}

function getInsightSummaryBlock(post) {
  const sections = post?.acf?.insight_page_builder;
  if (!Array.isArray(sections)) return null;

  return sections.find((block) => block?.acf_fc_layout === "summary_block") || null;
}

function getInsightContentHtml(post) {
  const sections = post?.acf?.insight_page_builder;
  const builderContent = Array.isArray(sections)
    ? sections
        .filter((block) => block?.acf_fc_layout === "text_editor")
        .map((block) => block?.body_content || "")
        .join(" ")
    : "";

  return builderContent || post?.content?.rendered || post?.excerpt?.rendered || "";
}

function getReadTime(post, lang) {
  const wordCount = getPlainText(getInsightContentHtml(post))
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  if (lang === DEFAULT_LANG) {
    return `${minutes} min läsning`;
  }

  return `${minutes} min${minutes === 1 ? "" : "s"} read`;
}

function formatPostDate(date, lang) {
  if (!date) return "";

  return new Intl.DateTimeFormat(lang === DEFAULT_LANG ? "sv-SE" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function selectedPost(value) {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

function normalizeListItems(value) {
  if (!value) return [];
  const rows = Array.isArray(value) ? value : [value];

  return rows
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return getPlainText(item);
      }

      return getPlainText(
        item?.key_insight ||
          item?.key_insight_item ||
          item?.insight ||
          item?.text ||
          item?.title ||
          item?.description ||
          ""
      );
    })
    .filter(Boolean);
}

function getFileUrl(file) {
  if (!file) return "";
  if (typeof file === "string") return file;
  return file.url || file.source_url || "";
}

function getPostObjectTitle(value) {
  const item = selectedPost(value);
  if (!item) return "";
  if (typeof item === "string" || typeof item === "number") return "";

  return getPlainText(
    item?.post_title ||
      item?.title?.rendered ||
      item?.title ||
      item?.name ||
      ""
  );
}

function getBusinessTag(post) {
  const directTag = getPostObjectTitle(post?.acf?.business_tag);
  if (directTag) return directTag;

  const sections = post?.acf?.insight_page_builder;
  if (!Array.isArray(sections)) return "";

  for (const block of sections) {
    if (block?.acf_fc_layout !== "select_business_area") continue;
    const tag = getPostObjectTitle(block?.business_tag);
    if (tag) return tag;
  }

  return "";
}

function getFeaturedImageUrl(image) {
  return (
    image?.media_details?.sizes?.full?.source_url ||
    image?.media_details?.sizes?.large?.source_url ||
    image?.source_url ||
    ""
  );
}

function getPostPath(slug, lang) {
  const langPrefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
  return `${langPrefix}/${slug}`;
}

function getShareUrl(post, lang) {
  const siteUrl = process.env.SITE_URL || "";
  return `${siteUrl}${getPostPath(post?.slug || "", lang)}`;
}

function getShareLinks(post, lang) {
  const shareUrl = getShareUrl(post, lang);
  const title = getPostTitle(post);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  return [
    {
      label: "Instagram",
      icon: ShareInstagramIcon,
      href: "https://www.instagram.com/",
    },
    {
      label: "Facebook",
      icon: ShareFacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      icon: ShareLinkedInIcon,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "X",
      icon: ShareXIcon,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];
}

function getInsightsHref(lang) {
  return lang === DEFAULT_LANG ? "/artiklar" : `/${lang}/article`;
}

function InsightPostBreadcrumbs({ post, lang }) {
  const title = getPostTitle(post);
  const labels =
    lang === DEFAULT_LANG
      ? { home: "Hem", insights: "Insikter" }
      : { home: "Home", insights: "Insights" };

  return (
    <nav
      className="web-width mx-auto px-6 pt-5 text-[12px] leading-none text-[#596366]"
      aria-label={lang === DEFAULT_LANG ? "Brodsmulor" : "Breadcrumb"}
    >
      <ol className="flex min-w-0 items-center gap-2">
        <li className="shrink-0">
          <Link href={langHome(lang)} className="transition-colors hover:text-(--color-body)">
            {labels.home}
          </Link>
        </li>
        <li className="shrink-0 text-[#8A9294]">/</li>
        <li className="shrink-0">
          <Link href={getInsightsHref(lang)} className="transition-colors hover:text-(--color-body)">
            {labels.insights}
          </Link>
        </li>
        {title && (
          <>
            <li className="shrink-0 text-[#8A9294]">/</li>
            <li
              className="min-w-0 truncate text-[#1E2E31]"
              title={title}
              aria-current="page"
            >
              {truncateText(title)}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

function InsightMetaItem({ icon, alt, children }) {
  if (!children) return null;

  return (
    <li className="flex min-w-0 items-center gap-2 text-[13px] leading-normal text-(--color-body)">
      <Image src={icon} alt={alt} width={18} height={18} className="h-[18px] w-[18px] shrink-0 object-contain" />
      <span className="min-w-0 truncate">{children}</span>
    </li>
  );
}

function InsightPostHero({ post, lang, featuredImage }) {
  const title = getPostTitle(post);
  const excerpt = getPostExcerpt(post);
  const date = formatPostDate(post?.date, lang);
  const businessTag = getBusinessTag(post);
  const readTime = getReadTime(post, lang);
  const categoryLabel = lang === DEFAULT_LANG ? "Artikel" : "Article";
  const imageUrl = getFeaturedImageUrl(featuredImage);

  return (
    <section className="web-width-sm mx-auto px-6 pt-14 md:pt-20">
      <div className="mx-auto max-w-[920px] text-center">
        <p className="mb-5 text-[14px] leading-none text-(--color-body)">
          {categoryLabel}
        </p>

        {title && (
          <h1 className="mx-auto max-w-[820px] text-[34px] font-normal leading-[1.18] text-(--color-body) md:text-[44px]">
            {title}
          </h1>
        )}

        {excerpt && (
          <p className="mx-auto mt-5 max-w-[780px] text-[15px] leading-[1.55] text-(--color-body)">
            {excerpt}
          </p>
        )}

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <InsightMetaItem icon={CalendarIcon} alt="">
            {date}
          </InsightMetaItem>
          <InsightMetaItem icon={TagIcon} alt="">
            {businessTag}
          </InsightMetaItem>
          <InsightMetaItem icon={TimeIcon} alt="">
            {readTime}
          </InsightMetaItem>
        </ul>
      </div>

      {imageUrl && (
        <div className="relative mt-10 aspect-[16/6.9] min-h-[260px] w-full overflow-hidden rounded-[10px] md:mt-12">
          <Image
            src={imageUrl}
            alt={title || "Post featured image"}
            fill
            priority
            sizes="(max-width: 767px) calc(100vw - 48px), 1280px"
            className="object-cover"
          />
        </div>
      )}
    </section>
  );
}

function InsightSummaryCard({ post, lang }) {
  const summary = getInsightSummaryBlock(post);
  if (!summary) return null;

  const summaryTitle = getPlainText(summary.summary_title);
  const summaryDescription = getPlainText(summary.summary_description);
  const insightsTitle = getPlainText(summary.key_insights_title);
  const insightItems = normalizeListItems(summary.key_insight_list);
  const shareLinks = getShareLinks(post, lang);

  return (
    <aside className="rounded-[8px] bg-[#BFD9DA] px-7 py-7 text-(--color-body)">
      {summaryTitle && (
        <h2 className="mb-4 text-[18px] font-normal leading-tight">
          {summaryTitle}
        </h2>
      )}

      {summaryDescription && (
        <p className="text-[14px] leading-[1.55]">{summaryDescription}</p>
      )}

      {(insightsTitle || insightItems.length > 0) && (
        <div className="mt-9">
          {insightsTitle && (
            <h3 className="mb-4 text-[18px] font-normal leading-tight">
              {insightsTitle}
            </h3>
          )}

          {insightItems.length > 0 && (
            <ul>
              {insightItems.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="border-b border-[#1E2E31]/20 py-4 first:pt-0 text-[13px] leading-[1.5]"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-8">
        <p className="mb-3 text-[18px] leading-tight">
          {lang === DEFAULT_LANG ? "Dela artikeln på" : "Share this article on"}
        </p>
        <div className="flex items-center gap-3">
          {shareLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-75"
            >
              <Image src={link.icon} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

function InsightAudioPlayer({ post, lang }) {
  const summary = getInsightSummaryBlock(post);
  const audioUrl = getFileUrl(
    summary?.upload_audio_file || post?.acf?.upload_audio_file
  );

  if (!audioUrl) return null;

  return (
    <section className="rounded-[6px] border border-[#1E2E31]/45 px-5 py-5">
      <h2 className="mb-4 text-[14px] font-normal leading-tight text-(--color-body)">
        {lang === DEFAULT_LANG ? "Lyssna på artikeln" : "Listen to this article"}
      </h2>
      <audio controls className="w-full">
        <source src={audioUrl} />
      </audio>
    </section>
  );
}

function InsightPostContent({ post, lang }) {
  const textBlocks = getInsightTextBlocks(post);
  const hasSidebar = getInsightSummaryBlock(post) || post?.acf?.upload_audio_file;

  return (
    <section className="web-width-sm mx-auto px-6 py-15 md:py-30">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.95fr)] lg:items-start">
        <div className="min-w-0">
          {textBlocks.length > 0 ? (
            textBlocks.map((block, index) => (
              <div
                key={index}
                className="max-w-none [&>h2]:mb-5 [&>h2]:mt-10 [&>h2:first-child]:mt-0 [&>h2]:text-[28px] [&>h2]:font-normal [&>h2]:leading-tight [&>p]:mb-5 [&>p]:text-[15px] [&>p]:leading-[1.65] [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:pl-5 [&>li]:mb-2"
                dangerouslySetInnerHTML={{ __html: block.body_content }}
              />
            ))
          ) : (
            <InsightPostBody post={post} />
          )}
        </div>

        {hasSidebar && (
          <div className="grid gap-6 lg:sticky lg:top-28">
            <InsightSummaryCard post={post} lang={lang} />
            <InsightAudioPlayer post={post} lang={lang} />
          </div>
        )}
      </div>
    </section>
  );
}

function InsightPostPage({ post, lang, featuredImage }) {
  return (
    <>
      <InsightPostBreadcrumbs post={post} lang={lang} />
      <InsightPostHero post={post} lang={lang} featuredImage={featuredImage} />
      <InsightPostContent post={post} lang={lang} />
    </>
  );
}

function getProductAcf(product) {
  return {
    ...(product?.acf || {}),
    ...(product?.acf_fields || {}),
    ...(product?.advanced_custom_fields || {}),
    ...(product?.meta?.acf || {}),
  };
}

function collectProductRelationIds(product, layouts, field) {
  const builder = getProductAcf(product).product_page_builder;
  if (!Array.isArray(builder)) return [];

  return builder
    .filter((block) => layouts.includes(block?.acf_fc_layout))
    .flatMap((block) => normalizeSelectedPosts(block[field]))
    .map((item) => (typeof item === "object" ? item?.ID || item?.id : item))
    .filter(Boolean);
}

export default async function SinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;
  const isWebshopSlug =
    slug === "webshop" || (lang === "sv" && slug === "webbshop");

  if (!slug) notFound();

  // Product pages now live at /:slug, so resolve them first. This avoids
  // sending a burst of unrelated content-type requests to WordPress for every
  // product request, which can be rate-limited in production.
  const product = isWebshopSlug ? null : await getProductBySlug(slug, lang);
  const [data, businessArea, caseStudy, solution, post, menu, themeOptions, products, productCategories, productBrands] = await Promise.all([
    product ? null : getPageBySlug(slug, lang),
    product ? null : getBusinessAreaBySlug(slug, lang),
    product ? null : getCaseStudyBySlug(slug, lang),
    product ? null : getSolutionBySlug(slug, lang),
    product ? null : getPostBySlug(slug, lang),
    getMenu(lang),
    getThemeOptions(lang),
    isWebshopSlug ? getAllProducts(lang) : null,
    isWebshopSlug ? getProductCategories(lang) : null,
    isWebshopSlug ? getProductBrands(lang) : null,
  ]);

  const entry = data || businessArea || caseStudy || solution || product || post;
  if (!entry) notFound();

  const isBusinessArea = !data && !!businessArea;
  const isCaseStudy = !data && !businessArea && !!caseStudy;
  const isSolution = !data && !businessArea && !caseStudy && !!solution;
  const isProduct =
    !data && !businessArea && !caseStudy && !solution && !!product;
  const isPost =
    !data && !businessArea && !caseStudy && !solution && !product && !!post;
  const acf = entry?.acf || {};
  const businessAreaSections = isBusinessArea ? getBusinessAreaSections(acf) : null;
  const genericSections = Array.isArray(acf.generic_page_builder)
    ? acf.generic_page_builder
    : acf.page_builder;
  const webshopTeamMemberIds =
    isWebshopSlug && data ? collectWebshopTeamMemberIds(data) : [];
  const prefetchedWebshopTeamMembers = webshopTeamMemberIds.length
    ? await getTeamMembersByIds(webshopTeamMemberIds, lang)
    : [];
  const productTestimonialIds = isProduct
    ? collectProductRelationIds(
        product,
        ["testimonial", "testimonials", "testimonial_slider"],
        "clients_testimonial"
      )
    : [];
  const productTeamMemberIds = isProduct
    ? collectProductRelationIds(
        product,
        ["contact_form_section", "contact_form", "team_member_section"],
        "select_team_members"
      )
    : [];
  const [relatedProducts, prefetchedTestimonials, prefetchedProductTeamMembers] =
    isProduct
      ? await Promise.all([
          getRelatedProducts(product, lang),
          productTestimonialIds.length
            ? getTestimonialsByIds(productTestimonialIds, lang)
            : [],
          productTeamMemberIds.length
            ? getTeamMembersByIds(productTeamMemberIds, lang)
            : [],
        ])
      : [[], [], []];
  const postFeaturedImage = isPost && post?.featured_media
    ? await getMediaById(post.featured_media)
    : null;

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType={
          isProduct
            ? "product"
            : isCaseStudy
            ? "case_study"
            : isSolution
              ? "solutions"
              : isPost
                ? "posts"
                : isBusinessArea
                  ? "business_areas"
                  : "pages"
        }
        entryId={entry?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        {isProduct ? (
          <ProductPage
            product={product}
            lang={lang}
            relatedProducts={relatedProducts}
            prefetchedTestimonials={prefetchedTestimonials}
            prefetchedTeamMembers={prefetchedProductTeamMembers}
          />
        ) : isCaseStudy ? (
          <CaseStudyBuilder
            sections={caseStudy?.acf?.case_study_builder}
            lang={lang}
            caseStudyTitle={caseStudy?.title?.rendered || caseStudy?.title || ""}
            currentSlug={slug}
          />
        ) : isSolution ? (
          <SolutionBuilder
            sections={solution?.acf?.solution_page_builder || null}
            lang={lang}
            solutionData={solution?.acf || {}}
          />
        ) : isPost ? (  
          <InsightPostPage post={post} lang={lang} featuredImage={postFeaturedImage} />
        ) : isWebshopSlug && data ? (
          <WebshopPage
            page={data}
            products={products || []}
            categories={productCategories || []}
            brands={productBrands || []}
            lang={lang}
            prefetchedTeamMembers={prefetchedWebshopTeamMembers}
          />
        ) : isBusinessArea ? (
          <BusinessAreaBuilder sections={businessAreaSections} lang={lang} businessAreaData={businessArea}/>
        ) : Array.isArray(acf.generic_page_builder) ? (
          <GenericPageBuilder sections={genericSections} lang={lang} />
        ) : (
          <PageBuilder sections={acf.page_builder} lang={lang} />
        )}
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
  const data = await getPageBySlug(slug, lang);
  const businessArea = data ? null : await getBusinessAreaBySlug(slug, lang);
  const caseStudy = data || businessArea ? null : await getCaseStudyBySlug(slug, lang);
  const solution = data || businessArea || caseStudy
    ? null
    : await getSolutionBySlug(slug, lang);
  const product = data || businessArea || caseStudy || solution
    ? null
    : await getProductBySlug(slug, lang);
  const post = data || businessArea || caseStudy || solution || product
    ? null
    : await getPostBySlug(slug, lang);

  return buildMetadataFromYoast(data || businessArea || caseStudy || solution || product || post, {
    fallbackTitle: slug ? `${slug} | panea` : "panea",
    lang,
  });
}
