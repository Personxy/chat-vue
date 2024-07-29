export const CHAT_PAGE_SIZE = 15;
export const DEFAULT_SIDEBAR_WIDTH = 300;
export const SUMMARIZE_MODEL = "gpt-3.5-turbo";

export const REQUEST_TIMEOUT_MS = 60000;
const openaiModels = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-1106",
  "gpt-3.5-turbo-0125",
  "gpt-4",
  "gpt-4-0613",
  "gpt-4-32k",
  "gpt-4-32k-0613",
  "gpt-4-turbo",
  "gpt-4-turbo-preview",
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4-vision-preview",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-1106-preview",
];
export const OpenaiPath = {
  ChatPath: import.meta.env.VITE_API_BASE_URL,
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
};
export const ServiceProvider = {
  OpenAI: "OpenAI",
  Azure: "Azure",
  Google: "Google",
  Anthropic: "Anthropic",
  Baidu: "Baidu",
  ByteDance: "ByteDance",
  Alibaba: "Alibaba",
};
export const ModelProvider = {
  GPT: "GPT",
  GeminiPro: "GeminiPro",
  Claude: "Claude",
  Ernie: "Ernie",
  Doubao: "Doubao",
  Qwen: "Qwen",
};
export const DEFAULT_MODELS = [
  ...openaiModels.map((name) => ({
    name,
    available: true,
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
    },
  })),
];
// `;
export const DEFAULT_SYSTEM_TEMPLATE = `
You are ChatGPT, a large language model trained by {{ServiceProvider}}.
Knowledge cutoff: {{cutoff}}
Current model: {{model}}
Current time: {{time}}
Latex inline: \\(x^2\\) 
Latex block: $$e=mc^2$$
`;
