import { fillApplication } from "./autofill";
import { getProfile } from "./profile";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "FILL_APPLICATION") return;
  void getProfile().then((profile) => {
    const count = fillApplication(document, profile);
    sendResponse({
      count,
      message: count === 1 ? "Filled 1 field." : `Filled ${count} fields.`,
    });
  });
  return true;
});
