export interface ApplicantProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  website: string;
  currentCompany: string;
  currentTitle: string;
  yearsExperience: string;
  salaryExpectation: string;
  workAuthorization: string;
}

export const EMPTY_PROFILE: ApplicantProfile = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedIn: "",
  website: "",
  currentCompany: "",
  currentTitle: "",
  yearsExperience: "",
  salaryExpectation: "",
  workAuthorization: "",
};

export const PROFILE_FIELDS = Object.keys(EMPTY_PROFILE) as (keyof ApplicantProfile)[];
const PROFILE_KEY = "applicantProfile";

export async function getProfile(): Promise<ApplicantProfile> {
  const stored = await chrome.storage.local.get(PROFILE_KEY);
  return { ...EMPTY_PROFILE, ...(stored[PROFILE_KEY] ?? {}) };
}

export async function saveProfile(profile: ApplicantProfile): Promise<void> {
  await chrome.storage.local.set({ [PROFILE_KEY]: profile });
}
