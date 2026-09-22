import "./ui.css";
import { getProfile } from "./profile";

const status = document.querySelector<HTMLElement>("#status");
const fillButton = document.querySelector<HTMLButtonElement>("#fill");
const settingsButton = document.querySelector<HTMLButtonElement>("#settings");
if (!status || !fillButton || !settingsButton) throw new Error("Popup is missing required elements");

void getProfile().then((profile) => {
  const ready = Boolean(profile.fullName && profile.email);
  status.textContent = ready ? "Profile ready." : "Add your name and email before filling forms.";
  fillButton.disabled = !ready;
});

settingsButton.addEventListener("click", () => chrome.runtime.openOptionsPage());
fillButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) return;
  const response = await chrome.tabs.sendMessage(tab.id, { type: "FILL_APPLICATION" }).catch(() => null);
  status.textContent = response?.message ?? "This page is not available for autofill.";
});
