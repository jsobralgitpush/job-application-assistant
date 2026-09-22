chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "FILL_APPLICATION") return;
  sendResponse({ message: "Autofill engine arrives in the next feature PR." });
});
