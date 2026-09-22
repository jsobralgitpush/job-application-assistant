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
  currentCompany: [/current.?company/i, /current.?employer/i],
  currentTitle: [/current.?title/i, /job.?title/i, /current.?role/i],
  yearsExperience: [/years?.?(of)?.?experience/i, /experience.?years?/i],
  salaryExpectation: [/salary/i, /compensation/i, /expected.?pay/i],
  workAuthorization: [/work.?authorization/i, /authorized.?to.?work/i, /visa.?status/i],
};

function fieldText(field: Fillable): string {
  const labels = field.labels ? Array.from(field.labels).map((label) => label.textContent ?? "") : [];
  return [field.name, field.id, field.getAttribute("autocomplete") ?? "", field.getAttribute("aria-label") ?? "",
    field.getAttribute("placeholder") ?? "", ...labels].join(" ");
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
  const prototype = field instanceof HTMLSelectElement ? HTMLSelectElement.prototype
    : field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(field, value);
  for (const type of ["input", "change", "blur"]) field.dispatchEvent(new Event(type, { bubbles: true }));
}

function discoverRoots(root: Document | ShadowRoot): (Document | ShadowRoot)[] {
  const roots: (Document | ShadowRoot)[] = [root];
  for (const element of root.querySelectorAll<HTMLElement>("*")) {
    if (element.shadowRoot) roots.push(...discoverRoots(element.shadowRoot));
  }
  if (root instanceof Document) {
    for (const frame of root.querySelectorAll("iframe")) {
      try {
        if (frame.contentDocument) roots.push(...discoverRoots(frame.contentDocument));
      } catch {
        // Cross-origin frames are intentionally inaccessible.
      }
    }
  }
  return roots;
}

export function fillApplication(root: Document | ShadowRoot, profile: ApplicantProfile): number {
  let filled = 0;
  for (const currentRoot of discoverRoots(root)) {
    const fields = currentRoot.querySelectorAll<Fillable>("input:not([type=hidden]):not([type=file]), textarea, select");
    for (const field of fields) {
      if (field.disabled || field.readOnly || field.value.trim()) continue;
      const key = identifyField(field);
      const value = key ? profile[key] : "";
      if (!value) continue;
      setNativeValue(field, value);
      filled += 1;
    }
  }
  return filled;
}
