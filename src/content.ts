import { fillApplication } from "./autofill";
import { getProfile } from "./profile";

let answerTarget: HTMLTextAreaElement | HTMLInputElement | null = null;
document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (target instanceof HTMLTextAreaElement || (target instanceof HTMLInputElement && target.type === "text")) answerTarget = target;
});

function targetQuestion(): string {
  if (!answerTarget) return "";
  const label = answerTarget.labels ? Array.from(answerTarget.labels).map((item) => item.textContent ?? "").join(" ") : "";
  return [label, answerTarget.getAttribute("aria-label"), answerTarget.getAttribute("placeholder")]
    .filter(Boolean).join(" ").trim();
}
function setAnswer(value: string): void {
  if (!answerTarget) return;
  const prototype = answerTarget instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(answerTarget, value);
  answerTarget.dispatchEvent(new Event("input", { bubbles: true }));
  answerTarget.dispatchEvent(new Event("change", { bubbles: true }));
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "FILL_APPLICATION") {
    void getProfile().then((profile) => {
      const count = fillApplication(document, profile);
      sendResponse({ count, message: count === 1 ? "Filled 1 field." : `Filled ${count} fields.` });
    });
    return true;
  }
  if (message?.type === "GET_ACTIVE_QUESTION") sendResponse({ question: targetQuestion() });
  if (message?.type === "FILL_AI_ANSWER") {
    setAnswer(String(message.answer ?? ""));
    sendResponse({ success: true });
  }
});
