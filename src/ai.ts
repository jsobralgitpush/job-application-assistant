const API_URL = "https://api.openai.com/v1/responses";
const API_KEY = "openaiApiKey";
const CAREER_CONTEXT = "careerContext";

export interface AiSettings {
  apiKey: string;
  careerContext: string;
}

export async function getAiSettings(): Promise<AiSettings> {
  const [session, local] = await Promise.all([
    chrome.storage.session.get(API_KEY),
    chrome.storage.local.get(CAREER_CONTEXT),
  ]);
  return {
    apiKey: String(session[API_KEY] ?? ""),
    careerContext: String(local[CAREER_CONTEXT] ?? ""),
  };
}

export async function saveAiSettings(settings: AiSettings): Promise<void> {
  await Promise.all([
    settings.apiKey ? chrome.storage.session.set({ [API_KEY]: settings.apiKey }) : chrome.storage.session.remove(API_KEY),
    chrome.storage.local.set({ [CAREER_CONTEXT]: settings.careerContext }),
  ]);
}

function extractText(response: { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }): string {
  return (response.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "")
    .join("\n")
    .trim();
}

export async function generateAnswer(question: string, settings: AiSettings): Promise<string> {
  if (!settings.apiKey) throw new Error("Add an OpenAI API key in Profile settings for this browser session.");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-6-luna",
      instructions: "Write a truthful, concise job application answer in the language of the question. Never invent experience, credentials, dates, employers, or authorization. Return only the answer.",
      input: `Candidate context:\n${settings.careerContext || "No additional context provided."}\n\nApplication question:\n${question}`,
      max_output_tokens: 500,
    }),
  });
  const payload = await response.json() as { error?: { message?: string }; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (!response.ok) throw new Error(payload.error?.message ?? `OpenAI request failed (${response.status}).`);
  const answer = extractText(payload);
  if (!answer) throw new Error("OpenAI returned an empty answer.");
  return answer;
}
