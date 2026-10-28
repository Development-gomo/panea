"use client";

import { DEFAULT_LANG } from "@/config";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  getCf7FormSchema,
  submitCf7Direct,
  submitCf7FormProxy,
} from "@/lib/api";
import NewsletterIcon from "../../../../public/newsletter-icon.svg";

function parsePipeOption(value = "") {
  const text = String(value);
  const separatorIndex = text.indexOf("|");

  if (separatorIndex === -1) {
    return {
      label: text.trim(),
      value: text.trim(),
      hasPipe: false,
    };
  }

  const label = text.slice(0, separatorIndex).trim();

  return {
    label,
    value: label,
    pipeValue: text.slice(separatorIndex + 1).trim(),
    hasPipe: true,
  };
}

function getSelectOption(option) {
  if (typeof option === "string" || typeof option === "number") {
    return parsePipeOption(option);
  }

  const rawLabel =
    option?.label ||
    option?.text ||
    option?.title ||
    option?.name ||
    "";
  const rawValue =
    option?.value ||
    option?.option_value ||
    option?.raw_value ||
    "";
  const parsedLabel = parsePipeOption(rawLabel);

  if (parsedLabel.hasPipe) {
    return parsedLabel;
  }

  if (rawValue) {
    const parsedValue = parsePipeOption(rawValue);

    return {
      label: parsedLabel.label || parsedValue.label,
      value: parsedValue.value,
    };
  }

  return parsedLabel;
}

function isFileField(field) {
  return String(field?.type || "").replace("*", "") === "file";
}

// CF7 file tags carry options like "limit:5mb" and "filetypes:pdf|doc"; the
// schema may expose them as fields or inside the options array.
function getFileRules(field) {
  const opts = Array.isArray(field?.options) ? field.options.map(String) : [];
  const findOpt = (name) =>
    opts.find((o) => o.startsWith(`${name}:`))?.slice(name.length + 1);

  const rawTypes = field?.filetypes || findOpt("filetypes") || "";
  const extensions = (Array.isArray(rawTypes) ? rawTypes : String(rawTypes).split("|"))
    .map((t) => t.trim().toLowerCase().replace(/^\./, ""))
    .filter(Boolean);

  const rawLimit = String(field?.limit || findOpt("limit") || "").toLowerCase();
  const match = rawLimit.match(/^(\d+(?:\.\d+)?)\s*(kb|mb)?$/);
  const multiplier = { kb: 1024, mb: 1024 * 1024 }[match?.[2]] || 1;
  const maxBytes = match ? Number(match[1]) * multiplier : 0;

  return { extensions, maxBytes, limitLabel: rawLimit };
}

function Field({ field, value, setValue, error, variant = "default", lang = DEFAULT_LANG }) {
  const isSolution = variant === "solution";
  const common = isSolution
    ? "w-full border-0 border-b bg-transparent px-0 py-3 text-sm text-white outline-none placeholder:text-white/55 " +
      (error ? "border-red-400" : "border-white/25 focus:border-white/55")
    : "w-full rounded-md border px-4 py-3 text-sm outline-none " +
      (error ? "border-red-500" : "border-black/15 focus:border-black/30");
  const labelClass = isSolution
    ? "text-sm font-medium text-white/60"
    : "text-sm font-medium";
  const errorClass = isSolution ? "text-xs text-red-300" : "text-xs text-red-600";

  const label = field.label || field.key;
  const hasPlaceholder = Boolean(field.placeholder);
  const visibleLabelClass = hasPlaceholder ? "sr-only" : labelClass;

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <label className={visibleLabelClass}>
          {label} {field.required ? "*" : ""}
        </label>
        <textarea
          className={common + " min-h-[90px]"}
          value={value || ""}
          placeholder={field.placeholder || ""}
          onChange={(e) => setValue(field.key, e.target.value)}
        />
        {error ? <p className={errorClass}>{error}</p> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-2">
        <label className={visibleLabelClass}>
          {label} {field.required ? "*" : ""}
        </label>
        <select
          className={common}
          value={value || ""}
          onChange={(e) => setValue(field.key, e.target.value)}
        >
          <option value="" className="bg-[#f2ebe2] text-[#1e2e31]">
            {field.placeholder || "Select"}
          </option>
          {(field.options || []).map((opt, idx) => {
            const option = getSelectOption(opt);

            return (
              <option
                key={`${option.value}-${idx}`}
                value={option.value}
                className="bg-[#f2ebe2] text-[#1e2e31]"
              >
                {option.label}
              </option>
            );
          })}
        </select>
        {error ? <p className={errorClass}>{error}</p> : null}
      </div>
    );
  }

  if (isFileField(field)) {
    const { extensions } = getFileRules(field);
    const inputId = `cf7-file-${field.key}`;
    const isSv = lang === "sv";

    // The native file input's button and "No file chosen" text follow the
    // browser's language, so it is hidden and replaced with translated UI.
    return (
      <div className="space-y-2">
        <span className={labelClass}>
          {label} {field.required ? "*" : ""}
        </span>
        <label
          htmlFor={inputId}
          className={common + " flex cursor-pointer items-center gap-4"}
        >
          <span
            className={`shrink-0 rounded-sm px-3 py-1 text-xs font-normal  tracking-wide ${
              isSolution ? "bg-white/15 text-white" : "bg-black/10"
            }`}
          >
            {isSv ? "Ladda upp fil" : "Upload file"}
          </span>
          <span className={`truncate ${isSolution ? "text-white/55" : "text-black/55"}`}>
            {value?.name || (isSv ? "Ingen fil vald" : "No file chosen")}
          </span>
        </label>
        <input
          id={inputId}
          className="sr-only"
          type="file"
          name={field.key}
          accept={extensions.map((ext) => `.${ext}`).join(",") || undefined}
          onChange={(e) => setValue(field.key, e.target.files?.[0] || null)}
        />
        {error ? <p className={errorClass}>{error}</p> : null}
      </div>
    );
  }

  // default input: text/email/tel/url
  const type = ["email", "tel", "url"].includes(field.type)
    ? field.type
    : "text";

  return (
    <div className="space-y-2">
      <label className={visibleLabelClass}>
        {label} {field.required ? "*" : ""}
      </label>
      <input
        className={common}
        type={type}
        value={value || ""}
        placeholder={field.placeholder || ""}
        onChange={(e) => setValue(field.key, e.target.value)}
      />
      {error ? <p className={errorClass}>{error}</p> : null}
    </div>
  );
}

export default function ContactForm({
  formId = 982,
  lang = DEFAULT_LANG,
  variant = "default",
  className = "",
  showTitle = false,
  formTitle = "",
  submitLabel = "Send Message",
}) {
  const [schema, setSchema] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  // File inputs can't be cleared through state, so bump this to remount them.
  const [resetKey, setResetKey] = useState(0);
  const [state, setState] = useState({
    loading: true,
    submitting: false,
    ok: false,
    msg: "",
  });

  const fields = useMemo(() => schema?.fields || [], [schema]);

  useEffect(() => {
    let alive = true;

    if (variant === "footer") {
      const footerField = {
        key: "your-email",
        type: "email",
        required: true,
        label: lang === "sv" ? "Emailadress" : "Email address",
        placeholder: lang === "sv" ? "Emailadress" : "Email address",
      };

      setSchema({
        fields: [footerField],
        hidden: {
          _wpcf7: String(formId),
          _wpcf7_locale: lang === "sv" ? "sv_SE" : "en_US",
          _wpcf7_unit_tag: `wpcf7-f${formId}-o1`,
          _wpcf7_container_post: "0",
          wpml_language: lang,
        },
      });
      setValues({ [footerField.key]: "" });
      setState({ loading: false, submitting: false, ok: false, msg: "" });

      return () => {
        alive = false;
      };
    }

    (async () => {
      try {
        setState({ loading: true, submitting: false, ok: false, msg: "" });
        const data = await getCf7FormSchema(formId, lang);
        if (!alive) return;

        setSchema(data);

        const initial = {};
        (data.fields || []).forEach((f) => (initial[f.key] = ""));
        setValues(initial);

        setState({ loading: false, submitting: false, ok: false, msg: "" });
      } catch (e) {
        setState({
          loading: false,
          submitting: false,
          ok: false,
          msg: "Failed to load form.",
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [formId, lang, variant]);

  function setValue(key, val) {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  }

  function validate() {
    const next = {};
    for (const f of fields) {
      if (isFileField(f)) {
        const file = values[f.key];
        if (!file) {
          if (f.required) {
            next[f.key] =
              lang === "sv" ? "Detta fält är obligatoriskt" : "This field is required";
          }
          continue;
        }

        const { extensions, maxBytes, limitLabel } = getFileRules(f);
        const ext = file.name.split(".").pop().toLowerCase();
        if (extensions.length && !extensions.includes(ext)) {
          next[f.key] =
            lang === "sv"
              ? `Filtypen stöds inte. Tillåtna: ${extensions.join(", ")}`
              : `File type not allowed. Allowed: ${extensions.join(", ")}`;
        } else if (maxBytes && file.size > maxBytes) {
          next[f.key] =
            lang === "sv"
              ? `Filen är för stor (max ${limitLabel})`
              : `File is too large (max ${limitLabel})`;
        }
        continue;
      }

      if (!f.required) continue;
      const v = (values[f.key] || "").toString().trim();
      if (!v) {
        next[f.key] =
          lang === "sv" ? "Detta fält är obligatoriskt" : "This field is required";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setState((s) => ({ ...s, submitting: true, ok: false, msg: "" }));

    if (!validate()) {
      setState((s) => ({
        ...s,
        submitting: false,
        ok: false,
        msg:
          lang === "sv"
            ? "Vänligen fyll i de obligatoriska fälten."
            : "Please fill required fields.",
      }));
      return;
    }

    // Transform payload to match backend expectations
    const transformedValues = Object.keys(values).reduce((acc, key) => {
      const value = values[key];
      acc[key] = value instanceof Blob ? value : value?.toString().trim();
      return acc;
    }, {});
    const hasFile = Object.values(transformedValues).some(
      (value) => value instanceof Blob,
    );

    try {
      let res;
      try {
        // Primary: direct CF7 submit
        res = await submitCf7Direct(
          formId,
          schema?.hidden || {},
          transformedValues,
        );
      } catch (directErr) {
        const directStatus = directErr?.cf7?.status;
        const directMessage = (directErr?.message || "").toLowerCase();
        const isNetworkError =
          directErr?.name === "TypeError" ||
          directMessage.includes("failed to fetch") ||
          directMessage.includes("networkerror");

        // The proxy sends JSON, so it can't carry file uploads.
        if (directStatus || !isNetworkError || hasFile) {
          throw directErr;
        }

        // Fallback: proxy submit (only if direct failed due to network/CORS)
        res = await submitCf7FormProxy(formId, {
          lang,
          values: transformedValues,
        });
      }

      const okMessage =
        res?.message ||
        res?.cf7?.message ||
        schema?.settings?.successMessage ||
        "Sent!";

      setState({
        loading: false,
        submitting: false,
        ok: true,
        msg: okMessage,
      });

      // Reset form values
      const reset = {};
      fields.forEach((f) => (reset[f.key] = ""));
      setValues(reset);
      setResetKey((k) => k + 1);
    } catch (err) {
      // If CF7 validation errors come back, map them
      const cf7 = err?.cf7;
      if (
        cf7?.status === "validation_failed" &&
        Array.isArray(cf7?.invalid_fields)
      ) {
        const next = {};
        cf7.invalid_fields.forEach((f) => {
          if (f?.field) next[f.field] = f?.message || "Invalid";
        });
        setErrors(next);
      }

      setState({
        loading: false,
        submitting: false,
        ok: false,
        msg: err?.message || err?.error || "Failed to send. Please try again.",
      });
    }
  }

  if (state.loading)
    return (
      <div
        className={`flex items-center gap-3 py-10 text-sm ${
          variant === "solution" ? "text-white/65" : "text-gray-500"
        }`}
      >
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-brand)]" />
        Loading form…
      </div>
    );

  if (variant === "footer") {
    const emailField =
      fields.find((field) => field.type === "email") || fields[0];
    const emailError = emailField ? errors[emailField.key] : "";

    return (
      <form onSubmit={onSubmit} className={className} noValidate>
        <div
          className={`mt-10 flex items-center justify-between border-b pb-4 ${
            emailError ? "border-red-300" : "border-white/20"
          }`}
        >
          {emailField && (
            <>
              <label htmlFor="footer-contact-email" className="sr-only">
                {emailField.label}
              </label>
              <input
                id="footer-contact-email"
                name={emailField.key}
                type="email"
                autoComplete="email"
                required
                value={values[emailField.key] || ""}
                onChange={(event) => setValue(emailField.key, event.target.value)}
                placeholder={emailField.placeholder}
                className="w-full bg-transparent text-white outline-none placeholder:text-white"
              />
            </>
          )}
          <button
            type="submit"
            disabled={state.submitting}
            aria-label={lang === "sv" ? "Prenumerera" : "Subscribe"}
            className="ml-4 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Image
              src={NewsletterIcon}
              alt=""
              width={14}
              height={14}
              className="h-[14px] w-[14px]"
            />
          </button>
        </div>

        {(emailError || state.msg) && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${state.ok ? "text-[#B8D1D1]" : "text-red-300"}`}
          >
            {emailError || state.msg}
          </p>
        )}
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`${variant === "solution" ? "space-y-8" : "space-y-5"} ${className}`}
    >
      {showTitle && (formTitle || schema?.title) ? (
        <h3 className="ff-larken mb-10 text-center text-[28px] font-light leading-tight text-white md:text-[34px]">
          {formTitle || schema?.title}
        </h3>
      ) : null}

      <div
        className={
          variant === "solution"
            ? "grid gap-x-4 gap-y-7 md:grid-cols-2"
            : "space-y-5"
        }
      >
        {fields.map((f) => (
          <div
            key={`${f.key}-${resetKey}`}
            className={variant === "solution" && f.type === "textarea" ? "md:col-span-2" : ""}
          >
            <Field
              field={f}
              value={values[f.key]}
              setValue={setValue}
              error={errors[f.key]}
              variant={variant}
              lang={lang}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className={`cursor-pointer
                    relative inline-flex items-center justify-center select-none
                    px-6 py-4
                    overflow-hidden
                    border border-transparent transition-colors duration-300 hover:border-(--color-brand) hover:bg-(--color-body) hover:text-(--color-brand)
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      variant === "solution"
                        ? "mt-4 w-[164px] rounded-[50px] bg-white text-(--color-body)"
                        : "w-[170px] rounded-sm bg-(--color-brand) text-white"
                    }`}
      >
        <span
          className="
                      text-[16px] leading-none
                      whitespace-nowrap"
        >
          {state.submitting ? "Sending..." : submitLabel}
        </span>
      </button>

      {state.msg ? (
        <p
          className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}
        >
          {state.msg}
        </p>
      ) : null}
    </form>
  );
}
