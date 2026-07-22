"use client";

import { getCf7FormSchema, submitCf7Direct } from "@/lib/api";
import { useEffect, useRef, useState } from "react";

const EMPTY_VALUES = {
  "your-name": "",
  "your-phone": "",
  "your-email": "",
  "current-employment": "",
  "your-message": "",
};

function vacancyTitle(vacancy) {
  return String(vacancy?.title?.rendered || vacancy?.title || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export default function CareerApplicationModal({
  formId,
  lang,
  vacancies,
  selectedVacancy,
  textAboveTitle,
  title,
  shortInformation,
  onClose,
}) {
  const dialogRef = useRef(null);
  const [schema, setSchema] = useState(null);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [selectedJob, setSelectedJob] = useState(
    vacancyTitle(selectedVacancy)
  );
  const [cv, setCv] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState({ submitting: false, ok: false, message: "" });
  const isSv = lang === "sv";

  useEffect(() => {
    let active = true;
    getCf7FormSchema(formId, lang)
      .then((data) => active && setSchema(data))
      .catch(() =>
        active && setStatus({ submitting: false, ok: false, message: isSv ? "Formuläret kunde inte laddas." : "The form could not be loaded." })
      );
    return () => {
      active = false;
    };
  }, [formId, isSv, lang]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const setValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  async function submit(event) {
    event.preventDefault();
    const hasRequiredContactValues = [
      "your-name",
      "your-phone",
      "your-email",
      "current-employment",
    ].every((key) => values[key].trim());

    if (!hasRequiredContactValues || !selectedJob || !cv) {
      setStatus({ submitting: false, ok: false, message: isSv ? "Fyll i alla obligatoriska fält och bifoga ditt CV." : "Complete all required fields and attach your CV." });
      return;
    }

    if (cv.type !== "application/pdf" && !cv.name.toLowerCase().endsWith(".pdf")) {
      setStatus({
        submitting: false,
        ok: false,
        message: isSv
          ? "CV-filen måste vara i PDF-format."
          : "The CV must be a PDF file.",
      });
      return;
    }

    if (!accepted) {
      setStatus({ submitting: false, ok: false, message: isSv ? "Godkänn villkoren för att fortsätta." : "Please accept the terms to continue." });
      return;
    }

    setStatus({ submitting: true, ok: false, message: "" });
    try {
      const result = await submitCf7Direct(formId, schema?.hidden || {}, {
        ...values,
        "job-title": selectedJob,
        "your-cv": cv,
        "acceptance-956": accepted ? "1" : "",
      });
      setValues(EMPTY_VALUES);
      setCv(null);
      setAccepted(false);
      setStatus({ submitting: false, ok: true, message: result?.message || (isSv ? "Tack! Din ansökan har skickats." : "Thank you! Your application has been sent.") });
    } catch (error) {
      const invalidFieldMessage = error?.cf7?.invalid_fields
        ?.map((field) => field?.message)
        .filter(Boolean)
        .join(" ");
      setStatus({
        submitting: false,
        ok: false,
        message:
          invalidFieldMessage ||
          error?.message ||
          (isSv
            ? "Ansökan kunde inte skickas."
            : "The application could not be sent."),
      });
    }
  }

  const inputClass = "h-10 w-full rounded-[4px] border border-(--color-body)/18 bg-transparent px-4 text-[13px] outline-none transition-colors placeholder:text-(--color-body)/60 focus:border-(--color-body)/45";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-black/60 p-4 md:p-8"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="career-application-title"
        tabIndex={-1}
        className="relative my-auto w-full max-w-[600px] rounded-[14px] bg-[#F8F5EF] px-6 py-10 text-(--color-body) shadow-2xl outline-none md:px-8 md:py-8"
      >
        <button type="button" onClick={onClose} aria-label={isSv ? "Stäng" : "Close"} className="absolute right-5 top-5 flex h-9 w-9 cursor-pointer items-center justify-center text-[30px] font-light leading-none">
          ×
        </button>

        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C85A22]">
          {textAboveTitle}
        </p>
        <h2 className="ff-larken mt-5 text-[28px] font-normal leading-tight md:text-[28px]">
          {title}
        </h2>
        {shortInformation ? (
          <div
            className="mt-3 text-[12px] leading-[1.5] [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: shortInformation }}
          />
        ) : (
          <p className="mt-3 text-[12px] leading-[1.5]">
            {isSv ? "Fyll i dina kontaktuppgifter så återkommer vi med mer information." : "Fill in your contact information and we will tell you more."}
          </p>
        )}

        <form onSubmit={submit} className="mt-8" noValidate>
          <label className="mb-2 block text-[12px] font-medium">
            {isSv ? "Tjänsten du är intresserad av" : "Job title you are interested in"}
          </label>
          <select className={inputClass} value={selectedJob} onChange={(event) => setSelectedJob(event.target.value)} required>
            {vacancies.map((vacancy) => {
              const title = vacancyTitle(vacancy);
              return <option key={vacancy.id || title} value={title}>{title}</option>;
            })}
          </select>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className={inputClass} value={values["your-name"]} onChange={(event) => setValue("your-name", event.target.value)} placeholder={isSv ? "Namn*" : "Name*"} required />
            <input className={inputClass} type="tel" value={values["your-phone"]} onChange={(event) => setValue("your-phone", event.target.value)} placeholder={isSv ? "Telefon*" : "Phone*"} required />
            <input className={inputClass} type="email" value={values["your-email"]} onChange={(event) => setValue("your-email", event.target.value)} placeholder="E-mail*" required />
            <input className={inputClass} value={values["current-employment"]} onChange={(event) => setValue("current-employment", event.target.value)} placeholder={isSv ? "Nuvarande anställning*" : "Current employment*"} required />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-[12px]">
            <span className="font-medium">{isSv ? "Bifoga CV*" : "Attach CV*"}</span>
            <input
              id="career-cv-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                setCv(event.target.files?.[0] || null);
                setStatus((current) => ({ ...current, ok: false, message: "" }));
              }}
              className="sr-only"
              required
            />
            <label
              htmlFor="career-cv-upload"
              className="cursor-pointer rounded-[2px] border border-[#b9b9b9] bg-[#efefef] px-2.5 py-1 text-[12px] font-normal leading-none text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:bg-[#e5e5e5]"
            >
              {isSv ? "Välj fil" : "Choose file"}
            </label>
            <span className="max-w-[240px] truncate text-[11px] font-normal text-(--color-body)/70">
              {cv?.name || (isSv ? "Ingen fil vald" : "No file chosen")}
            </span>
          </div>

          <textarea className={`${inputClass} mt-6 h-20 resize-y py-4`} value={values["your-message"]} onChange={(event) => setValue("your-message", event.target.value)} placeholder={isSv ? "Meddelande" : "Message"} />

          <label className="mt-5 flex items-start gap-3 text-[11px] leading-[1.5]">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-(--color-body)"
              checked={accepted}
              onChange={(event) => {
                const isAccepted = event.target.checked;
                setAccepted(isAccepted);
                if (isAccepted) {
                  setStatus((current) => ({
                    ...current,
                    ok: false,
                    message: "",
                  }));
                }
              }}
              required
            />
            <span className="relative top-[2px]">{isSv ? "Jag accepterar att informationen jag lämnar behandlas och lagras av Panea." : "I accept that the information I provide will be processed and stored by Panea."}</span>
          </label>

          <button type="submit" disabled={status.submitting || !schema} className="mt-7 min-w-[130px] cursor-pointer rounded-[4px] bg-(--color-body) px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50">
            {status.submitting ? (isSv ? "Skickar…" : "Sending…") : isSv ? "Skicka" : "Send"}
          </button>

          {status.message && <p role="status" className={`mt-4 text-[13px] ${status.ok ? "text-green-700" : "text-red-700"}`}>{status.message}</p>}
        </form>
      </div>
    </div>
  );
}
