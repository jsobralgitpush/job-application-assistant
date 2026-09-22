import type { ApplicantProfile } from "./profile";

type ProfileKey = keyof ApplicantProfile;
type Fillable = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const SIGNALS: Record<ProfileKey, RegExp[]> = {
  fullName: [/full.?name/i, /applicant.?name/i, /^name$/i, /your.?name/i],
  email: [/e-?mail/i],
  phone: [/phone/i, /mobile/i, /telephone/i, /tel\b/i],
  location: [/location/i, /city/i, /address.?level2/i],
  linkedIn: [/linkedin/i],
  website: [/portfolio/i, /personal.?site/i, /website/i, /github/i],
};

function fieldText(field: Fillable): string {
  const labels = field.labels ? Array.from(field.labels).map((label) => label.textContent ?? "") : [];
  return [
    field.name,
    field.id,
    field.getAttribute("autocomplete") ?? "",
    field.getAttribute("aria-label") ?? "",
    field.getAttribute("placeholder") ?? "",
    ...labels,
  ].join(" ");
}

export function identifyField(field: Fillable): ProfileKey | null {
  const text = fieldText(field);
  let best: { key: ProfileKey; score: number } | null = null;

  for (const [key, patterns] of Object.entries(SIGNALS) as [ProfileKey, RegExp[]][]) {
    const score = patterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { key, score };
  }

  if (field instanceof HTMLInputElement) {
    if (field.type === "email") return "email";
    if (field.type === "tel") return "phone";
    if (field.type === "url" && !best) return "website";
  }
  return best?.key ?? null;
}

function setNativeValue(field: Fillable, value: string): void {
  const prototype = field instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  field.dispatchEvent(new Event("blur", { bubbles: true }));
}

export function fillApplication(root: ParentNode, profile: ApplicantProfile): number {
  const fields = root.querySelectorAll<Fillable>("input:not([type=hidden]):not([type=file]), textarea, select");
  let filled = 0;
  for (const field of fields) {
    if (field.disabled || ("readOnly" in field && field.readOnly) || field.value.trim()) continue;
    const key = identifyField(field);
    const value = key ? profile[key] : "";
    if (!value) continue;
    setNativeValue(field, value);
    filled += 1;
  }
  return filled;
}
