// src/app/[lang]/[slug]/page.jsx

import {
  getPageBySlug,
  getBusinessAreaBySlug,
  getCaseStudyBySlug,
  getPostBySlug,
  getCaseStudySlugs,
  getSolutionBySlug,
  getAllSolutions,
  fetchWP,
  getMenu,
  getThemeOptions,
  getAllBusinessAreas,
  getAllProducts,
  getProductBrands,
  getProductCategories,
  getAllPosts,
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
import InsightAudioPlayerClient from "@/components/major/InsightAudioPlayerClient";
import WebshopPage from "@/components/product/webshop/WebshopPage";
import { ProductPage } from "@/components/product";
import BusinessAreaFAQ from "@/components/sections/business-area/FAQ";
import HomeNews from "@/components/sections/home/HomeNews";
import ImageCtaBanner from "@/components/sections/home/ImageCtaBanner";
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
import AuthorCallIcon from "../../../../public/p-author-call.png";
import AuthorEmailIcon from "../../../../public/p-author-email.png";
import AuthorLinkedInIcon from "../../../../public/p-author-ln.png";
import AuthorContactArrow from "../../../../public/p-author-contact.png";

export const revalidate = 3600;

export async function generateStaticParams() {
  const [pageResults, businessAreaResults, caseStudyResults, solutionResults, postResults] = await Promise.all([
    Promise.all(
      SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/pages?per_page=100&lang=${lang}`))
    ),
    Promise.all(SUPPORTED_LANGS.map((lang) => getAllBusinessAreas(lang))),
    Promise.all(SUPPORTED_LANGS.map((lang) => getCaseStudySlugs(lang))),
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
  const contentHtml = post?.content?.rendered;

  if (contentHtml) {
    return (
      <div
        className={insightContentClassName}
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

const insightContentClassName =
  "insight-wysiwyg max-w-none";

function getInsightFactPointBlocks(post) {
  const sections = post?.acf?.insight_page_builder;
  if (!Array.isArray(sections)) return [];

  return sections.filter((block) => block?.acf_fc_layout === "fact_points");
}

function getInsightFaqBlocks(post) {
  const sections = post?.acf?.insight_page_builder;
  if (!Array.isArray(sections)) return [];

  return sections.filter((block) => block?.acf_fc_layout === "faq");
}

function getInsightAuthorBlocks(post) {
  const sections = post?.acf?.insight_page_builder;
  if (!Array.isArray(sections)) return [];

  return sections.filter((block) => block?.acf_fc_layout === "select_author");
}

function getInsightSummaryBlock(post) {
  const sections = post?.acf?.insight_page_builder;
  if (!Array.isArray(sections)) return null;

  return sections.find((block) => block?.acf_fc_layout === "summary_block") || null;
}

function getInsightContentHtml(post) {
  return post?.content?.rendered || post?.excerpt?.rendered || "";
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

function getPostObjectId(value) {
  const item = selectedPost(value);
  if (!item) return null;
  if (typeof item === "string" || typeof item === "number") return Number(item);
  return Number(item?.ID || item?.id) || null;
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

function normalizeRepeaterRows(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
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

function getAuthorAcf(author) {
  return {
    ...(author?.acf || {}),
    ...(author?.acf_fields || {}),
    ...(author?.advanced_custom_fields || {}),
  };
}

function getAuthorTitle(author) {
  return getPlainText(
    author?.title?.rendered ||
      author?.title ||
      author?.post_title ||
      author?.name ||
      ""
  );
}

function getImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;

  return (
    image?.media_details?.sizes?.full?.source_url ||
    image?.media_details?.sizes?.large?.source_url ||
    image?.source_url ||
    image?.url ||
    ""
  );
}

function getAuthorImageUrl(author) {
  const acf = getAuthorAcf(author);

  return (
    author?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    getImageUrl(author?.featured_image) ||
    getImageUrl(author?.featured_image_url) ||
    getImageUrl(acf.featured_image) ||
    ""
  );
}

function normalizeExternalUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function getInsightAuthorIds(post) {
  return getInsightAuthorBlocks(post)
    .map((block) => getPostObjectId(block?.author))
    .filter(Boolean);
}

function getLatestNewsDetails(themeOptions) {
  return (
    themeOptions?.latest_news_details ||
    themeOptions?.single_post?.latest_news_details ||
    themeOptions?.single_post_page?.latest_news_details ||
    null
  );
}

function getSinglePostImageCtaBanner(themeOptions) {
  return (
    themeOptions?.image_cta_banner ||
    themeOptions?.single_post?.image_cta_banner ||
    themeOptions?.single_post_page?.image_cta_banner ||
    null
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
        <div className="relative mb-16 mt-10 aspect-[16/6.9] min-h-[260px] w-full overflow-hidden rounded-[10px] md:mt-12">
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
  const summaryDescription = summary.summary_description;
  const insightsTitle = getPlainText(summary.key_insights_title);
  const insightListHtml =
    typeof summary.key_insight_list === "string" ? summary.key_insight_list : "";
  const insightItems = insightListHtml
    ? []
    : normalizeListItems(summary.key_insight_list);
  const shareLinks = getShareLinks(post, lang);

  return (
    <aside className="rounded-[8px] bg-[#BFD9DA] px-7 py-7 text-(--color-body)">
      {summaryTitle && (
        <h2 className="mb-3 text-[18px] font-normal leading-tight">
          {summaryTitle}
        </h2>
      )}

      {summaryDescription && (
        <div
          className="insight-summary-richtext mb-10 text-[14px] leading-[1.55]"
          dangerouslySetInnerHTML={{ __html: summaryDescription }}
        />
      )}

      {(insightsTitle || insightListHtml || insightItems.length > 0) && (
        <div>
          {insightsTitle && (
            <h3 className="mb-4 text-[18px] font-normal leading-tight">
              {insightsTitle}
            </h3>
          )}

          {insightListHtml && (
            <div
              className="insight-summary-list text-[13px] leading-[1.5] [&_ol]:m-0 [&_ol]:list-none [&_ol]:p-0 [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0 [&_li]:border-b [&_li]:border-[rgba(30,46,49,0.30)] [&_li]:py-3 [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: insightListHtml }}
            />
          )}

          {insightItems.length > 0 && (
            <ul>
              {insightItems.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="border-b border-[#1E2E31]/30 py-3 text-[13px] leading-[1.5]"
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1E2E31] transition-opacity hover:opacity-75"
            >
              <Image src={link.icon} alt="" width={18} height={18} className="h-[18px] w-auto object-contain" />
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
    <InsightAudioPlayerClient
      audioUrl={audioUrl}
      title={lang === DEFAULT_LANG ? "Lyssna på artikeln" : "Listen to this article"}
    />
  );
}

function InsightFactPoints({ block }) {
  const title = getPlainText(block?.generic_title);
  const summary = block?.short_summary;
  const facts = normalizeRepeaterRows(block?.fact_points_list).filter(
    (item) =>
      getPlainText(item?.title) ||
      getPlainText(item?.description) ||
      getPlainText(item?.numbers) ||
      getPlainText(item?.fact_tag_line)
  );

  if (!title && !summary && facts.length === 0) return null;

  return (
    <section className="mt-16 rounded-[10px] bg-[#B8D1D1] p-6 text-(--color-body) md:p-10 xl:p-[60px]">
      <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex h-full flex-col">
          {title && (
            <h2 className="ff-larken mb-5 text-[16px] font-normal leading-[1.3]">
              {title}
            </h2>
          )}

          {summary && (
            <div
              className="insight-fact-richtext text-[16px] font-normal leading-[1.55]"
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          )}
        </div>

        {facts.map((item, index) => {
          const factTitle = getPlainText(item?.title);
          const description = item?.description;
          const numbers = getPlainText(item?.numbers);
          const tagLine = getPlainText(item?.fact_tag_line);

          return (
            <article
              key={`${factTitle || numbers || "fact"}-${index}`}
              className="flex h-full min-h-[280px] flex-col rounded-[10px] border border-[#1E2E31]/30 p-6"
            >
              {factTitle && (
                <h3 className="mb-4 text-[20px] font-medium leading-[1.25]">
                  {factTitle}
                </h3>
              )}

              {description && (
                <div
                  className="insight-fact-richtext text-[16px] font-normal leading-[1.55]"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}

              {(numbers || tagLine) && (
                <div className="mt-auto pt-8">
                  {numbers && (
                    <p className="ff-larken mb-2 text-[40px] font-normal leading-none md:text-[48px]">
                      {numbers}
                    </p>
                  )}
                  {tagLine && (
                    <p className="text-[14px] font-normal leading-[1.4]">
                      {tagLine}
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AuthorContactLink({ icon, href, children }) {
  if (!children || !href) return null;

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 border-b border-[#F2EBE2]/20 py-4 text-[#F2EBE2]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F2EBE2]">
        <Image
          src={icon}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 object-contain"
        />
      </span>
      <span className="min-w-0 flex-1 truncate text-[14px] leading-normal">
        {children}
      </span>
      <Image
        src={AuthorContactArrow}
        alt=""
        width={12}
        height={12}
        className="h-auto w-3 shrink-0 transition-transform group-hover:translate-x-1"
      />
    </a>
  );
}

function InsightAuthorSection({ block, authorById, lang }) {
  const selectedAuthor = selectedPost(block?.author);
  const authorId = getPostObjectId(block?.author);
  const author = authorById?.get(authorId) || selectedAuthor;

  if (!author || typeof author === "string" || typeof author === "number") {
    return null;
  }

  const acf = getAuthorAcf(author);
  const name = getAuthorTitle(author);
  const designation = getPlainText(acf.designation);
  const aboutAuthor = acf.about_author;
  const contactNumber = getPlainText(acf.contact_number);
  const email = getPlainText(acf.email_id);
  const linkedInUrl = getPlainText(acf.linkedin_url);
  const imageUrl = getAuthorImageUrl(author);
  const label = lang === DEFAULT_LANG ? "Om författaren" : "About the author";

  if (
    !name &&
    !designation &&
    !aboutAuthor &&
    !contactNumber &&
    !email &&
    !linkedInUrl &&
    !imageUrl
  ) {
    return null;
  }

  return (
    <section className="web-width-sm mx-auto px-6 pt-16">
      <div className="rounded-[10px] bg-[#1E2E31] p-6 text-[#F2EBE2] md:p-10 xl:p-[60px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_1px_minmax(260px,3fr)] lg:gap-12">
          <div className="grid gap-8 md:grid-cols-[200px_minmax(0,1fr)] md:items-start">
            {imageUrl && (
              <div className="relative h-[200px] w-[200px] overflow-hidden rounded-[6px]">
                <Image
                  src={imageUrl}
                  alt={name || "Author"}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
            )}

            <div>
              <p className="ff-larken mb-5 text-[16px] font-light leading-normal">
                {label}
              </p>

              {name && (
                <h2 className="mb-1 text-[30px] font-normal leading-[1.2]">
                  {name}
                </h2>
              )}

              {designation && (
                <p className="mb-5 text-[14px] leading-normal text-[#F2EBE2]/70">
                  {designation}
                </p>
              )}

              {aboutAuthor && (
                <div
                  className="insight-author-richtext max-w-[680px] text-[16px] leading-[1.5] text-[#F2EBE2]"
                  dangerouslySetInnerHTML={{ __html: aboutAuthor }}
                />
              )}
            </div>
          </div>

          <div className="hidden w-px bg-[#F2EBE2]/30 lg:block" />

          <div className="lg:pl-2">
            <AuthorContactLink
              icon={AuthorCallIcon}
              href={contactNumber ? `tel:${contactNumber.replace(/\s+/g, "")}` : ""}
            >
              {contactNumber}
            </AuthorContactLink>

            <AuthorContactLink
              icon={AuthorEmailIcon}
              href={email ? `mailto:${email}` : ""}
            >
              {email}
            </AuthorContactLink>

            <AuthorContactLink
              icon={AuthorLinkedInIcon}
              href={normalizeExternalUrl(linkedInUrl)}
            >
              {linkedInUrl ? "Linkedin" : ""}
            </AuthorContactLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function InsightPostContent({ post, lang, hasFeaturedImage }) {
  const factPointBlocks = getInsightFactPointBlocks(post);
  const hasSidebar = getInsightSummaryBlock(post) || post?.acf?.upload_audio_file;
  const hasFactPoints = factPointBlocks.length > 0;

  return (
    <section
      className={`web-width-sm mx-auto px-6 ${
        hasFactPoints ? "pb-0" : "pb-15 md:pb-30"
      } ${
        hasFeaturedImage ? "pt-0" : "pt-15 md:pt-30"
      }`}
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.95fr)] lg:items-start">
        <div className="min-w-0">
          <InsightPostBody post={post} />
        </div>

        {hasSidebar && (
          <div className="grid gap-6 lg:sticky lg:top-28">
            <InsightSummaryCard post={post} lang={lang} />
            <InsightAudioPlayer post={post} lang={lang} />
          </div>
        )}
      </div>

      {factPointBlocks.map((block, index) => (
        <InsightFactPoints key={index} block={block} />
      ))}
    </section>
  );
}

function InsightPostPage({
  post,
  lang,
  featuredImage,
  authorById,
  latestNewsDetails,
  latestPosts,
  imageCtaBanner,
}) {
  const hasFeaturedImage = Boolean(getFeaturedImageUrl(featuredImage));
  const faqBlocks = getInsightFaqBlocks(post);
  const authorBlocks = getInsightAuthorBlocks(post);

  return (
    <>
      <InsightPostBreadcrumbs post={post} lang={lang} />
      <InsightPostHero post={post} lang={lang} featuredImage={featuredImage} />
      <InsightPostContent post={post} lang={lang} hasFeaturedImage={hasFeaturedImage} />
      {faqBlocks.map((block, index) => (
        <BusinessAreaFAQ
          key={index}
          data={{
            ...block,
            faqs: block?.faq_data || [],
          }}
          lang={lang}
        />
      ))}
      {authorBlocks.map((block, index) => (
        <InsightAuthorSection
          key={index}
          block={block}
          authorById={authorById}
          lang={lang}
        />
      ))}
      <HomeNews
        data={latestNewsDetails || {}}
        lang={lang}
        prefetchedPosts={latestPosts}
      />
      <ImageCtaBanner data={imageCtaBanner} lang={lang} />
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
  const postAuthorIds = isPost ? getInsightAuthorIds(post) : [];
  const uniquePostAuthorIds = [...new Set(postAuthorIds)];
  const prefetchedPostAuthors = uniquePostAuthorIds.length
    ? await fetchWP(
        `/wp/v2/authors?include=${uniquePostAuthorIds.join(",")}&per_page=${uniquePostAuthorIds.length}&orderby=include&lang=${lang}&_embed&acf_format=standard`
      )
    : [];
  const postAuthorById = new Map(
    (Array.isArray(prefetchedPostAuthors) ? prefetchedPostAuthors : [])
      .filter((author) => author?.id)
      .map((author) => [Number(author.id), author])
  );
  const latestPostNews = isPost ? await getAllPosts(lang) : [];
  const latestNewsDetails = isPost ? getLatestNewsDetails(themeOptions) : null;
  const imageCtaBanner = isPost ? getSinglePostImageCtaBanner(themeOptions) : null;

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
          <InsightPostPage
            post={post}
            lang={lang}
            featuredImage={postFeaturedImage}
            authorById={postAuthorById}
            latestNewsDetails={latestNewsDetails}
            latestPosts={latestPostNews}
            imageCtaBanner={imageCtaBanner}
          />
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
          <BusinessAreaBuilder
            sections={businessAreaSections}
            lang={lang}
            businessAreaData={businessArea}
            processSteps={themeOptions?.process_steps}
          />
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
  const isWebshopSlug =
    slug === "webshop" || (lang === "sv" && slug === "webbshop");

  // Content-type priority must match SinglePage() above exactly — product
  // is resolved first there, so it must win here too. Otherwise a slug that
  // collides between a product and another content type would render the
  // product's page while reporting a different content type's SEO tags.
  const product = isWebshopSlug ? null : await getProductBySlug(slug, lang);
  const data = product ? null : await getPageBySlug(slug, lang);
  const businessArea = product || data ? null : await getBusinessAreaBySlug(slug, lang);
  const caseStudy = product || data || businessArea
    ? null
    : await getCaseStudyBySlug(slug, lang);
  const solution = product || data || businessArea || caseStudy
    ? null
    : await getSolutionBySlug(slug, lang);
  const post = product || data || businessArea || caseStudy || solution
    ? null
    : await getPostBySlug(slug, lang);

  return buildMetadataFromYoast(product || data || businessArea || caseStudy || solution || post, {
    fallbackTitle: slug ? `${slug} | panea` : "panea",
    lang,
  });
}
