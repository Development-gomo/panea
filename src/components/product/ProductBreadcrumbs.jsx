import Link from "next/link";
import { DEFAULT_LANG, langHome, langHref } from "@/config";
import { stripHtmlWs as stripHtml } from "@/lib/htmlText";

export default function ProductBreadcrumbs({ product, lang = DEFAULT_LANG }) {
  const productName = stripHtml(product?.title?.rendered);

  const items = [
    {
      label: lang === "sv" ? "Hem" : "Home",
      href: langHome(lang),
    },
    {
      label: lang === "sv" ? "Webbshop" : "Webshop",
      href: langHref("/webshop", lang),
    },
    {
      label: productName,
    },
  ].filter((item) => item?.label);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-t border-[#D6CEC2] bg-[#F2EBE2]"
    >
      <ol className="web-width mx-auto flex min-h-11 items-center gap-2 px-6 text-[12px] leading-none text-[#596366]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition hover:text-(--color-body)"
                >
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
