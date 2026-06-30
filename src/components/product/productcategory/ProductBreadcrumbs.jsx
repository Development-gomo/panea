import Link from "next/link";
import { DEFAULT_LANG, langHome, langHref } from "@/config";

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

function getTitle(entry) {
  return stripHtml(entry?.title?.rendered || entry?.title || entry?.name);
}

function getHomeLabel(lang) {
  return lang === "sv" ? "Hem" : "Home";
}

export default function ProductBreadcrumbs({
  category,
  webshopPage,
  lang = DEFAULT_LANG,
}) {
  const categoryName = stripHtml(category?.name);
  const webshopLabel = getTitle(webshopPage) || "Webshop";

  const items = [
    {
      label: getHomeLabel(lang),
      href: langHome(lang),
    },
    {
      label: webshopLabel,
      href: langHref("/webshop", lang),
    },
    {
      label: categoryName,
    },
  ].filter((item) => item?.label);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={lang === "sv" ? "Brödsmulor" : "Breadcrumb"}
      className="border-t border-[#D6CEC2] bg-[#F2EBE2]"
    >
      <ol className="web-width mx-auto flex min-h-11 items-center gap-2 px-6 text-[12px] leading-none text-[#596366]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-(--color-body)">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-(--color-body)" : ""}>
                  {item.label}
                </span>
              )}

              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
