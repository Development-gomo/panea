"use client";

import { useMemo, useState } from "react";

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

function getProductAcf(product) {
  return {
    ...(product?.acf || {}),
    ...(product?.acf_fields || {}),
    ...(product?.advanced_custom_fields || {}),
    ...(product?.meta?.acf || {}),
  };
}

function toText(value) {
  if (value === undefined || value === null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") {
    return stripHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join(", ");
  }
  if (typeof value === "object") {
    return (
      toText(value.rendered) ||
      toText(value.title) ||
      toText(value.label) ||
      toText(value.name) ||
      toText(value.value) ||
      toText(value.text)
    );
  }

  return "";
}

function toHtml(value) {
  if (value === undefined || value === null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const items = value.map(toText).filter(Boolean);
    return items.length > 0
      ? `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`
      : "";
  }
  if (typeof value === "object") {
    return (
      toHtml(value.rendered) ||
      toHtml(value.value) ||
      toHtml(value.text) ||
      toHtml(value.content)
    );
  }

  return "";
}

function hasContent(value) {
  return stripHtml(toHtml(value)).length > 0;
}

function getField(source, keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== "") {
      return source[key];
    }
  }

  return "";
}

function getProductTabsGroup(acf) {
  const group = getField(acf, ["product_tabs"]);
  return group && typeof group === "object" && !Array.isArray(group) ? group : {};
}

function getGroupedField(acf, group, fieldName) {
  return getField(group, [fieldName]) || getField(acf, [`product_tabs_${fieldName}`, fieldName]);
}

function getFlattenedRepeater(acf, fieldName) {
  const rowCount = Number(acf[fieldName]);
  if (!Number.isInteger(rowCount) || rowCount <= 0) return [];

  return Array.from({ length: rowCount }, (_, index) => {
    const prefix = `${fieldName}_${index}_`;
    return Object.fromEntries(
      Object.entries(acf)
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, value]) => [key.replace(prefix, ""), value])
    );
  }).filter((row) => Object.keys(row).length > 0);
}

function getRepeaterItems(acf, group, fieldName) {
  const value = getGroupedField(acf, group, fieldName);

  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);

  const flattened =
    getFlattenedRepeater(group, fieldName).length > 0
      ? getFlattenedRepeater(group, fieldName)
      : getFlattenedRepeater(acf, `product_tabs_${fieldName}`);

  if (flattened.length > 0) return flattened;
  if (toText(value)) return [value];

  return [];
}

function getFileData(item) {
  if (!item) return null;
  if (typeof item === "string") return { label: item, href: "" };

  const file =
    item.product_sheet_file ||
    item.file ||
    item.material ||
    item.download ||
    item.download_file ||
    item.downloadable_file ||
    item.url ||
    item.link ||
    item;
  const href =
    typeof file === "string"
      ? file
      : file?.url || file?.href || file?.source_url || file?.link || "";
  const label =
    toText(item.product_sheet_label) ||
    toText(item.download_label) ||
    toText(item.file_label) ||
    toText(item.title) ||
    toText(item.label) ||
    toText(item.name) ||
    toText(file?.title) ||
    toText(file?.filename) ||
    toText(file?.name) ||
    href;

  return label ? { label, href } : null;
}

function SpecificationRows({ rows }) {
  const normalizedRows = rows
    .flatMap((row) => {
      if (typeof row === "string" || typeof row === "number") {
        return { label: toText(row), value: "" };
      }

      const label =
        toText(row?.specification_label) ||
        toText(row?.specification_name) ||
        toText(row?.product_specification) ||
        toText(row?.product_specification_label) ||
        toText(row?.spefications) ||
        toText(row?.title) ||
        toText(row?.name) ||
        toText(row?.specification) ||
        toText(row?.attribute) ||
        toText(row?.property);
      const value =
        toText(row?.specification_details) ||
        toText(row?.product_specification_details) ||
        toText(row?.details) ||
        toText(row?.detail) ||
        toText(row?.value) ||
        toText(row?.description) ||
        toText(row?.content) ||
        toText(row?.text);

      if (label || value) return { label, value };

      const entries = Object.entries(row || {})
        .filter(([key]) => !["details", "detail", "value"].includes(key))
        .map(([key, entryValue]) => ({
          label: key.replace(/_/g, " "),
          value: toText(entryValue),
        }))
        .filter((entry) => entry.value);

      return entries;
    })
    .filter((row) => row?.label || row?.value);

  if (normalizedRows.length === 0) return null;

  return (
    <div className="overflow-hidden text-[13px] text-[#62696B]">
      <div className="grid grid-cols-[38%_62%] gap-3 border-b border-[#D8D0C4] pb-3 text-[14px] font-medium text-(--color-body) sm:grid-cols-[42%_58%] sm:gap-0">
        <div>Specification</div>
        <div>Details</div>
      </div>

      <div className="divide-y divide-[#D8D0C4] text-[14px]">
        {normalizedRows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className="grid min-h-10 grid-cols-[38%_62%] items-start gap-3 py-3 sm:grid-cols-[42%_58%] sm:items-center sm:gap-0"
          >
            <div className="capitalize">{row.label}</div>
            <div className="break-words text-(--color-body)">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DownloadRows({ rows }) {
  const files = rows.map(getFileData).filter(Boolean);
  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-['Inter'] text-[20px] font-medium leading-normal text-[#1E2E31]">
        Download product sheet
      </h2>

      <ul className="w-full max-w-[330px] space-y-3">
        {files.map((file, index) => (
          <li key={`${file.label}-${index}`}>
            {file.href ? (
              <a
                href={file.href}
                download
                target="_blank"
                className="flex min-h-10 cursor-pointer items-center justify-between gap-4 rounded-sm border border-[#D8D0C4] bg-[#F8F4EE] px-4 font-['Inter'] text-[14px] font-normal leading-5 text-[#1E2E31] transition hover:border-(--color-body) hover:bg-white"
              >
                <span className="truncate">{file.label}</span>
                <span aria-hidden="true" className="shrink-0 text-[#62696B]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                </span>
              </a>
            ) : (
              <span className="flex min-h-10 cursor-pointer items-center justify-between gap-4 border border-[#D8D0C4] bg-[#F8F4EE] px-4 font-['Inter'] text-[14px] font-normal leading-5 text-[#1E2E31]">
                <span className="truncate">{file.label}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildTabs(product) {
  const acf = getProductAcf(product);
  const productTabs = getProductTabsGroup(acf);

  const overview = getGroupedField(acf, productTabs, "product_overview");
  const specifications = getRepeaterItems(acf, productTabs, "product_spefications");
  const downloads = getRepeaterItems(acf, productTabs, "downloadable_material");

  return [
    hasContent(overview)
      ? {
          id: "overview",
          label: "Overview",
          content: (
            <div
              className="body-text max-w-4xl [&>h2]:mb-4 [&>h2]:text-[20px] [&>h2]:font-semibold [&>p]:mb-6 [&>p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: toHtml(overview) }}
            />
          ),
        }
      : null,
    specifications.length > 0
      ? {
          id: "specifications",
          label: "Specifications",
          content: <SpecificationRows rows={specifications} />,
        }
      : null,
    downloads.length > 0
      ? {
          id: "downloadable-material",
          label: "Downloadable material",
          content: <DownloadRows rows={downloads} />,
        }
      : null,
  ].filter(Boolean);
}

export default function ProductTabs({ product }) {
  const tabs = useMemo(() => buildTabs(product), [product]);
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  if (tabs.length === 0) return null;

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content || tabs[0].content;

  return (
    <section className="bg-[#F2EBE2]">
      <div className="web-width mx-auto px-4 pt-[60px] pb-[60px] sm:px-6">
        <div className="overflow-hidden border border-[#D8D0C4] rounded-lg">
          <div className="flex overflow-x-auto border-b border-[#D8D0C4]">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative min-h-14 shrink-0 cursor-pointer px-5 text-left text-[13px] transition sm:px-8 sm:text-[14px] ${
                    isActive ? "text-(--color-body)" : "text-[#6D7476]"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-5 right-5 h-px bg-(--color-body) sm:left-8 sm:right-8" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="min-h-[290px] px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-9">
            {activeContent}
          </div>
        </div>
      </div>
    </section>
  );
}
