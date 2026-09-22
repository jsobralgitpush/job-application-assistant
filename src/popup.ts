import "./ui.css";
import { getProfile } from "./profile";
import { generateAnswer, getAiSettings } from "./ai";

const status = document.querySelector<HTMLElement>("#status");
const fillButton = document.querySelector<HTMLButtonElement>("#fill");
const generateButton = document.querySelector<HTMLButtonElement>("#generate");
const settingsButton = document.querySelector<HTMLButtonElement>("#settings");
if (!status || !fillButton || !generateButton || !settingsButton) throw new Error("Popup is missing required elements");

async function activeTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
void getProfile().then((profile) => {
  const ready = Boolean(profile.fullName && profile.email);
  status.textContent = ready ? "Profile ready." : "Add your name and email before filling forms.";
  fillButton.disabled = !ready;
});
settingsButton.addEventListener("click", () => chrome.runtime.openOptionsPage());
fillButton.addEventListener("click", async () => {
  const tab = await activeTab();
  if (!tab.id) return;
  const response = await chrome.tabs.sendMessage(tab.id, { type: "FILL_APPLICATION" }).catch(() => null);
  status.textContent = response?.message ?? "This page is not available for autofill.";
});
generateButton.addEventListener("click", async () => {
  const tab = await activeTab();
  if (!tab.id) return;
  generateButton.disabled = true;
  status.textContent = "Generating a draft…";
  try {
    const target = await chrome.tabs.sendMessage(tab.id, { type: "GET_ACTIVE_QUESTION" });
    if (!target?.question) throw new Error("Focus a long-answer field on the application first.");
    const answer = await generateAnswer(target.question, await getAiSettings());
    await chrome.tabs.sendMessage(tab.id, { type: "FILL_AI_ANSWER", answer });
    status.textContent = "Draft inserted. Review it before submitting.";
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Could not generate an answer.";
  } finally {
    generateButton.disabled = false;
  }
});
