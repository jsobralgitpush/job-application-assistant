import "./ui.css";
import { getProfile, PROFILE_FIELDS, saveProfile, type ApplicantProfile } from "./profile";
import { getAiSettings, saveAiSettings } from "./ai";

const form = document.querySelector<HTMLFormElement>("#profile-form");
const status = document.querySelector<HTMLOutputElement>("#status");
const aiForm = document.querySelector<HTMLFormElement>("#ai-form");
const aiStatus = document.querySelector<HTMLOutputElement>("#ai-status");
if (!form || !status || !aiForm || !aiStatus) throw new Error("Options page is missing required elements");

void getProfile().then((profile) => {
  for (const [key, value] of Object.entries(profile)) {
    const input = form.elements.namedItem(key);
    if (input instanceof HTMLInputElement) input.value = value;
  }
});
void getAiSettings().then((settings) => {
  const key = aiForm.elements.namedItem("apiKey");
  const context = aiForm.elements.namedItem("careerContext");
  if (key instanceof HTMLInputElement) key.value = settings.apiKey;
  if (context instanceof HTMLTextAreaElement) context.value = settings.careerContext;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const profile = Object.fromEntries(PROFILE_FIELDS.map((key) => [key, String(data.get(key) ?? "").trim()])) as unknown as ApplicantProfile;
  await saveProfile(profile);
  status.value = "Saved.";
});
aiForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(aiForm);
  await saveAiSettings({ apiKey: String(data.get("apiKey") ?? "").trim(), careerContext: String(data.get("careerContext") ?? "").trim() });
  aiStatus.value = "AI settings saved.";
});
