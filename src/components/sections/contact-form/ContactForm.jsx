"use client";

import { DEFAULT_LANG } from "@/config";
import { useEffect, useMemo, useState } from "react";
import {
  getCf7FormSchema,
  submitCf7Direct,
  submitCf7FormProxy,
} from "@/lib/api";
import Image from "next/image";
import ArrowSvg from "../../../../public/right-arrow.svg";

function Field({ field, value, setValue, error }) {
  const common =
    "w-full rounded-md border px-4 py-3 text-sm outline-none " +
    (error ? "border-red-500" : "border-black/15 focus:border-black/30");

  const label = field.label || field.key;

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {label} {field.required ? "*" : ""}
        </label>
        <textarea
          className={common + " min-h-[140px]"}
          value={value || ""}
          placeholder={field.placeholder || ""}
          onChange={(e) => setValue(field.key, e.target.value)}
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {label} {field.required ? "*" : ""}
        </label>
        <select
          className={common}
          value={value || ""}
          onChange={(e) => setValue(field.key, e.target.value)}
        >
          <option value="">{field.placeholder || "Select"}</option>
          {(field.options || []).map((opt, idx) => (
            <option key={idx} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  // default input: text/email/tel/url
  const type = ["email", "tel", "url"].includes(field.type)
    ? field.type
    : "text";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {field.required ? "*" : ""}
      </label>
      <input
        className={common}
        type={type}
        value={value || ""}
        placeholder={field.placeholder || ""}
        onChange={(e) => setValue(field.key, e.target.value)}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default function ContactForm({ formId = 982, lang = DEFAULT_LANG }) {
  const [schema, setSchema] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({
    loading: true,
    submitting: false,
    ok: false,
    msg: "",
  });

  const fields = useMemo(() => schema?.fields || [], [schema]);

  useEffect(() => {
    let alive = true;

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
  }, [formId, lang]);

  function setValue(key, val) {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  }

  function validate() {
    const next = {};
    for (const f of fields) {
      if (!f.required) continue;
      const v = (values[f.key] || "").toString().trim();
      if (!v) next[f.key] = "This field is required";
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
        msg: "Please fill required fields.",
      }));
      return;
    }

    // Transform payload to match backend expectations
    const transformedValues = Object.keys(values).reduce((acc, key) => {
      acc[key] = values[key]?.toString().trim();
      return acc;
    }, {});

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

        if (directStatus || !isNetworkError) {
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
      <div className="flex items-center gap-3 py-10 text-sm text-gray-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-brand)]" />
        Loading form…
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {fields.map((f) => (
        <Field
          key={f.key}
          field={f}
          value={values[f.key]}
          setValue={setValue}
          error={errors[f.key]}
        />
      ))}

      <button
        type="submit"
        disabled={state.submitting}
        className=" cursor-pointer
                    gap-3 group relative inline-flex items-center select-none
                    rounded-sm bg-(--color-brand) px-6 py-4 text-white
                    transition-all duration-300 hover:bg-(--color-brand)
                    w-[170px] overflow-hidden
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
      >
        <span className="relative w-2 h-2 flex items-center justify-center">
          <span
            className="absolute h-2 w-2 rounded-full bg-[#27E0C0]
                        transition-all duration-300 ease-out
                        group-hover:opacity-0 group-hover:-translate-x-1"
          ></span>
        </span>

        {/* TEXT (slides left on hover) */}
        <span
          className="
                      flex-1 text-[16px] leading-none
                      transition-all duration-300 ease-out 
                      group-hover:-translate-x-4
                      whitespace-nowrap"
        >
          {state.submitting ? "Sending…" : "Send Message"}
        </span>

        {/* RIGHT SLOT (arrow area, fixed width) */}
        <span className="relative w-4 flex items-center justify-center">
          <span
            className="
                        w-4 absolute text-[16px]
                        opacity-0 -translate-x-4
                        transition-all duration-300 ease-out
                        group-hover:opacity-100 group-hover:-translate-x-2
                      "
          >
            <Image src={ArrowSvg} alt="arrow" width={13} height={13} />
          </span>
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
