/**
 * Map a doctor's free-text role/specialty to a valid schema.org `MedicalSpecialty`
 * enum value (https://schema.org/MedicalSpecialty). The doctor's `specialties[]`
 * are free-text service names, which are NOT valid `medicalSpecialty` values —
 * Google's Rich Results test rejects them. This resolves one valid enum from the
 * role text; returns undefined when unknown so the field is omitted rather than
 * emitted with an invalid value.
 *
 * Rules are ordered by priority (most specific / primary specialty first), so a
 * "пластичний хірург, онколог, дерматолог" resolves to PlasticSurgery.
 */
const RULES: [RegExp, string][] = [
  [/пласт|plastic/i, "PlasticSurgery"],
  [/ендокрин|эндокрин|endocrin/i, "Endocrine"],
  [/гінеколог|гинеколог|акушер|gyn(a?e)?colog|obstetr/i, "Gynecologic"],
  [/гастроентеролог|гастроэнтеролог|gastroenterolog|дієтолог|диетолог|dietician|nutrition/i, "Gastroenterologic"],
  [/дерматолог|косметолог|dermatolog|cosmetolog/i, "Dermatologic"],
  [/уролог|андролог|urolog|androlog/i, "Urologic"],
  [/подолог|podolog|podiatr/i, "Podiatric"],
  [/узд|ультразвук|ultrasound|радіолог|радиолог|radiolog/i, "Radiography"],
  [/онколог|oncolog/i, "Oncologic"],
  [/кардіолог|кардиолог|cardiolog/i, "Cardiovascular"],
  [/терапевт|therapist|сімейн|семейн|family/i, "PrimaryCare"],
];

export function medicalSpecialtyFor(role: string): string | undefined {
  for (const [re, val] of RULES) if (re.test(role)) return val;
  return undefined;
}
