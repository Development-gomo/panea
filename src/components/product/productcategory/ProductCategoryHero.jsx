import Image from "next/image";
import Link from "next/link";
import { DEFAULT_LANG, langHref } from "@/config";

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

function toText(value) {
  if (value === undefined || value === null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") return stripHtml(value);
  if (typeof value === "object") {
    return (
      toText(value.rendered) ||
      toText(value.title) ||
      toText(value.name) ||
      toText(value.label) ||
      toText(value.value)
    );
  }

  return "";
}

function toHtml(value) {
  if (value === undefined || value === null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    return (
      toHtml(value.rendered) ||
      toHtml(value.html) ||
      toHtml(value.value) ||
      toHtml(value.content) ||
      toText(value)
    );
  }

  return "";
}

function getImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;

  return (
    image.url ||
    image.source_url ||
    image.src ||
    image.sizes?.full ||
    image.sizes?.medium ||
    image.sizes?.large ||
    image.media_details?.sizes?.full?.source_url ||
    image.media_details?.sizes?.medium?.source_url ||
    image.media_details?.sizes?.large?.source_url ||
    ""
  );
}

function getCategoryAcf(category) {
  return {
    ...(category || {}),
    ...(category?.acf || {}),
    ...(category?.acf_fields || {}),
    ...(category?.advanced_custom_fields || {}),
    ...(category?.meta?.acf || {}),
  };
}

function getInfo(category) {
  const acf = getCategoryAcf(category);

  return {
    ...acf,
    ...(acf.product_category_information || {}),
    ...(acf.product_category_info || {}),
    ...(acf.category_information || {}),
  };
}

function getDescription(info, category) {
  return toHtml(
    info.description ||
    info.content ||
    info.text ||
    info.short_description ||
    category?.description ||
    ""
  );
}

function normalizeHref(url, lang) {
  const href = getLinkUrl(url);
  if (!href) return "";
  if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }

  return langHref(href.startsWith("/") ? href : `/${href}`, lang);
}

function getLinkUrl(value) {
  if (!value) return "";
  if (Array.isArray(value)) {
    return value.map(getLinkUrl).find(Boolean) || "";
  }
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value === "object") {
    return (
      getLinkUrl(value.url) ||
      getLinkUrl(value.href) ||
      getLinkUrl(value.link) ||
      getLinkUrl(value.value) ||
      getLinkUrl(value.guid?.rendered) ||
      getLinkUrl(value.guid)
    );
  }

  return "";
}

function getButton(info, lang) {
  const text = toText(info.cat_cta_label);
  const url = normalizeHref(info.cat_cta_link, lang);

  return {
    text,
    url,
  };
}

function getLogos(info) {
  const rows = info.client_logos || [];
  const list = Array.isArray(rows) ? rows : [rows];

  return list
    .map((row) => row?.logo)
    .map((logo) => ({
      ...logo,
      url: getImageUrl(logo),
      alt: logo?.alt || logo?.title || "",
    }))
    .filter((logo) => logo.url);
}

export default function ProductCategoryHero({
  category,
  lang = DEFAULT_LANG,
}) {
  const info = getInfo(category);
  const title = toText(info.title) || toText(info.heading) || toText(category?.name);
  const description = getDescription(info, category);
  const cat_button = getButton(info, lang);
  const logos = getLogos(info);

  return (
    <section className="bg-[#F2EBE2]">
      <div className="web-width mx-auto grid gap-10 px-6 pt-9 pb-[64px] lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] lg:items-start">
        <div className="max-w-[620px]">
          {title && (
            <h1 className="mb-5 text-[32px] font-normal leading-tight text-[#1E2E31] md:text-[40px]">
              {title}
            </h1>
          )}

          {description && (
            <div
              className="max-w-[560px] whitespace-pre-line text-[15px] leading-6 text-[#1E2E31]"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}

          {cat_button.text && cat_button.url && (
            <Link
              href={cat_button.url}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#1E2E31] px-9 text-[14px] leading-none text-white transition hover:bg-black"
            >
              {cat_button.text}
            </Link>
          )}
        </div>

        {logos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {logos.map((logo, index) => (
              <div
                key={`${logo.id || logo.url}-${index}`}
                className="relative flex h-[88px] items-center justify-center rounded-[7px] border border-[#CFC7BA] bg-[#F2EBE2] px-6"
              >
                <Image
                  src={logo.url}
                  alt={logo.alt}
                  width={110}
                  height={70}
                  sizes="110px"
                  className="h-[70px] w-[110px] object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
