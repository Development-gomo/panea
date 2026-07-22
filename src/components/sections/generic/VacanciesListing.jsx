"use client";

import { useState } from "react";
import CareerApplicationModal from "./CareerApplicationModal";

function plainText(value = "") {
  if (value && typeof value === "object") {
    return plainText(value.rendered || value.raw || "");
  }

  return String(value).replace(/<[^>]*>/g, "").trim();
}

function vacancyFields(vacancy) {
  return {
    ...(vacancy?.acf || {}),
    ...(vacancy?.acf_fields || {}),
    ...(vacancy?.advanced_custom_fields || {}),
  };
}

function postId(value) {
  if (typeof value === "object") return value?.ID || value?.id || null;
  return value || null;
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M12 6.5c0 3-4 7-4 7s-4-4-4-7a4 4 0 1 1 8 0Z" />
      <circle cx="8" cy="6.5" r="1.4" />
    </svg>
  );
}

export default function VacanciesListing({ data, vacancies = [], lang = "sv" }) {
  const [openIndex, setOpenIndex] = useState(vacancies.length ? 0 : null);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const textAboveTitle = data?.text_above_title || "";
  const title = data?.title || "";
  const shortDescription = data?.short_description || "";
  const labels =
    lang === "sv"
      ? {
          apply: "Ansök nu",
          location: "Plats",
          employmentType: "Anställningsform",
          department: "Avdelning",
        }
      : {
          apply: "Apply now",
          location: "Location",
          employmentType: "Employment type",
          department: "Department",
        };
  const applyLabel = data?.apply_button_text || data?.cta_text || labels.apply;

  return (
    <section
      id={data?.anchor_id || undefined}
      tabIndex={data?.anchor_id ? -1 : undefined}
      className="w-full scroll-mt-24 bg-(--color-brand) pt-[120px] pb-0 outline-none"
    >
      <div className="web-width-sm mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          {textAboveTitle && (
            <p className="ff-larken mb-4 text-[16px] font-light leading-normal text-(--color-body)">
              {textAboveTitle}
            </p>
          )}

          {title && (
            <div
              className="section-heading h2 max-w-[920px] text-2xl font-regular leading-[1.3] text-(--color-body) md:text-3xl lg:text-[36px] [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}

          {shortDescription && (
            <div
              className="body-text mt-5 max-w-[920px] text-[16px] font-light leading-[1.5] text-(--color-body) [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: shortDescription }}
            />
          )}
        </div>

        {vacancies.length > 0 && (
          <div className="mt-12 overflow-hidden rounded-[5px] border border-(--color-body)/15 bg-white/30 md:mt-16">
            {vacancies.map((vacancy, index) => {
              const fields = vacancyFields(vacancy);
              const isOpen = openIndex === index;
              const vacancyTitle = plainText(vacancy?.title);
              const location = fields.location || "";
              const panelId = `career-vacancy-panel-${vacancy?.id || index}`;

              return (
                <article
                  key={vacancy?.id || `${vacancyTitle}-${index}`}
                  className="border-b border-(--color-body)/15 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full cursor-pointer items-center gap-6 px-6 py-6 text-left md:px-8"
                  >
                    <span className="flex-1 text-[16px] font-medium text-(--color-body)">
                      {vacancyTitle}
                    </span>
                    {location && (
                      <span className="flex shrink-0 items-center gap-1.5 text-[14px] font-light text-(--color-body)/75">
                        <LocationIcon />
                        {location}
                      </span>
                    )}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-(--color-body)/20 text-[16px] leading-none">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      className="grid gap-8 px-6 pb-8 md:grid-cols-[1fr_auto] md:px-8"
                    >
                      <div>
                        {fields.short_information_about_profile && (
                          <div
                            className="max-w-[680px] text-[15px] font-light leading-[1.55] text-(--color-body) [&_p]:mb-3 [&_p:last-child]:mb-0"
                            dangerouslySetInnerHTML={{
                              __html: fields.short_information_about_profile,
                            }}
                          />
                        )}

                        <dl className="mt-7 flex flex-wrap gap-x-12 gap-y-5">
                          {[
                            [labels.location, fields.location],
                            [labels.employmentType, fields.employment_type],
                            [labels.department, fields.department],
                          ].map(([label, value]) =>
                            value ? (
                              <div key={label}>
                                <dt className="mb-2 text-[10px] uppercase tracking-[0.12em] text-(--color-body)/45">
                                  {label}
                                </dt>
                                <dd className="text-[14px] font-medium text-(--color-body)">
                                  {value}
                                </dd>
                              </div>
                            ) : null
                          )}
                        </dl>
                      </div>

                      <button
                          type="button"
                          onClick={() => setSelectedVacancy(vacancy)}
                          className="inline-flex h-fit cursor-pointer items-center justify-center self-end rounded-full bg-(--color-body) px-8 py-4 text-[14px] font-medium leading-none text-white transition-opacity hover:opacity-80"
                        >
                          {applyLabel}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
      {selectedVacancy && (
        <CareerApplicationModal
          formId={Number(postId(data?.select_form)) || (lang === "en" ? 2658 : 2646)}
          lang={lang}
          vacancies={vacancies}
          selectedVacancy={selectedVacancy}
          textAboveTitle={data?.form_text_above_title || ""}
          title={data?.form_title || ""}
          shortInformation={data?.short_information_about_career || ""}
          onClose={() => setSelectedVacancy(null)}
        />
      )}
    </section>
  );
}
