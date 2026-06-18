 "use client";

import { useState } from "react";
import ProductTitle from "./ProductTitle";

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
      toText(value.value)
    );
  }

  return "";
}

function toHtml(value) {
  if (value === undefined || value === null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
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

function hasHtml(value) {
  return stripHtml(toHtml(value)).length > 0;
}

function getField(acf, keys) {
  for (const key of keys) {
    if (acf[key] !== undefined && acf[key] !== null && acf[key] !== "") {
      return acf[key];
    }
  }

  return "";
}

function getRepeaterLabel(item) {
  if (typeof item === "string" || typeof item === "number") return toText(item);
  if (!item || typeof item !== "object") return "";

  const preferredKeys = [
    "available_model",
    "available_models",
    "model",
    "model_name",
    "model_label",
    "title",
    "label",
    "name",
    "text",
    "litres",
    "liters",
    "liter",
  ];

  for (const key of preferredKeys) {
    const value = toText(item[key]);
    if (value) return value;
  }

  return toText(
    Object.values(item).find(
      (value) => typeof value === "string" || typeof value === "number"
    )
  );
}

function getRepeaterItems(acf, fieldName) {
  const value = acf[fieldName];

  if (Array.isArray(value)) return value.map(getRepeaterLabel).filter(Boolean);

  if (value && typeof value === "object") {
    return Object.values(value).map(getRepeaterLabel).filter(Boolean);
  }

  const rowCount = Number(value);
  if (Number.isInteger(rowCount) && rowCount > 0) {
    return Array.from({ length: rowCount }, (_, index) => {
      const prefix = `${fieldName}_${index}_`;
      const row = Object.fromEntries(
        Object.entries(acf)
          .filter(([key]) => key.startsWith(prefix))
          .map(([key, fieldValue]) => [key.replace(prefix, ""), fieldValue])
      );

      return getRepeaterLabel(row);
    }).filter(Boolean);
  }

  if (typeof value === "string" && value.includes(",")) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return toText(value) ? [toText(value)] : [];
}

function ProductButton({ label, variant = "primary" }) {
  if (!label) return null;

  const classes =
    variant === "primary"
      ? "border-(--color-body) text-(--color-body)"
      : "border-(--color-body) text-(--color-body)";

  return (
    <button
      type="button"
      className={`min-h-11 w-full cursor-pointer rounded-full border px-8 text-[14px] transition hover:border-black hover:bg-black hover:text-white sm:w-auto ${classes}`}
    >
      {label}
    </button>
  );
}

export default function ProductDetails({ product }) {
  const [activeModelIndex, setActiveModelIndex] = useState(null);
  const acf = getProductAcf(product);
  const productName = product?.title?.rendered;
  const articleNumber = toText(getField(acf, ["article_number"]));
  const shortInformation = toHtml(getField(acf, ["short_information"]));
  const keyFeatures = toHtml(getField(acf, ["key_features"]));
  const quoteButtonLabel = toText(getField(acf, ["request_a_quote_button_label"]));
  const serviceButtonLabel = toText(getField(acf, ["buy_service_agreements"]));
  const availableModels = getRepeaterItems(acf, "available_models");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ProductTitle title={productName} />

        {articleNumber && (
          <span className="inline-flex rounded-sm border border-[#C7C0B6] bg-[#F8F4EE] px-3 py-1 text-[11px] leading-none text-[#596366]">
            Article number - {articleNumber}
          </span>
        )}
      </div>

      {hasHtml(shortInformation) && (
        <div
          className="body-text max-w-[590px] [&>p]:mb-4 [&>p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: shortInformation }}
        />
      )}

      {availableModels.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[16px] font-semibold">Available models</h2>
          <div className="flex flex-wrap gap-2">
            {availableModels.map((model, index) => (
              <button
                type="button"
                key={`${model}-${index}`}
                onClick={() => setActiveModelIndex(index)}
                className={`inline-flex min-h-10 cursor-pointer items-center rounded-full px-4 text-[12px] transition hover:bg-black hover:text-white sm:px-6 ${
                  activeModelIndex === index
                    ? "bg-black text-white"
                    : "bg-[#B8D9DB] text-(--color-body)"
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </section>
      )}

      {hasHtml(keyFeatures) && (
        <section className="space-y-3">
          <h2 className="text-[16px] font-semibold">Key features</h2>
          <div
            className="body-text max-w-[590px] text-[14px] [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-5 [&>p]:mb-3 [&>p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: keyFeatures }}
          />
        </section>
      )}

      {(quoteButtonLabel || serviceButtonLabel) && (
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
          <ProductButton label={quoteButtonLabel} />
          <ProductButton label={serviceButtonLabel} variant="secondary" />
        </div>
      )}
    </div>
  );
}
