// Case studies picked per casestudies_slider block via the ACF
// "select_casestudy" Post Object field. ACF returns false when empty, an
// ID / post object for a single pick, or an array when multiple is enabled.

const CASE_STUDY_SLIDER_LAYOUTS = ["casestudies_slider", "case_studies_slider"];

export function getSelectedCaseStudyIds(block) {
  const selected = block?.select_casestudy;
  if (!selected) return [];

  return (Array.isArray(selected) ? selected : [selected])
    .map((item) => Number(typeof item === "object" ? item?.ID || item?.id : item))
    .filter(Boolean);
}

export function collectSelectedCaseStudyIds(sections = []) {
  return sections
    .filter((block) => CASE_STUDY_SLIDER_LAYOUTS.includes(block?.acf_fc_layout))
    .flatMap(getSelectedCaseStudyIds);
}

// Selected cases in the editor's order; falls back to the default list when
// nothing is selected or none of the selected cases could be resolved.
export function pickSliderCases(block, selectedCases, fallbackCases) {
  const ids = getSelectedCaseStudyIds(block);
  if (!ids.length || !Array.isArray(selectedCases)) return fallbackCases;

  const byId = new Map(selectedCases.map((item) => [Number(item?.id), item]));
  const picked = ids.map((id) => byId.get(id)).filter(Boolean);

  return picked.length ? picked : fallbackCases;
}
