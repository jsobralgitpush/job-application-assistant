import "./ui.css";
import { getProfile, PROFILE_FIELDS, saveProfile, type ApplicantProfile } from "./profile";

const form = document.querySelector<HTMLFormElement>("#profile-form");
const status = document.querySelector<HTMLOutputElement>("#status");
if (!form || !status) throw new Error("Options page is missing required elements");

void getProfile().then((profile) => {
  for (const [key, value] of Object.entries(profile)) {
    const input = form.elements.namedItem(key);
    if (input instanceof HTMLInputElement) input.value = value;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const profile = Object.fromEntries(
    PROFILE_FIELDS.map((key) => [key, String(data.get(key) ?? "").trim()]),
  ) as unknown as ApplicantProfile;
  await saveProfile(profile);
  status.value = "Saved.";
  window.setTimeout(() => { status.value = ""; }, 1800);
});
