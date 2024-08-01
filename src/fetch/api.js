import { ChatGPTApi } from "./platforms/openai";
import { ServiceProvider, ModelProvider } from "@/utils/constants";
export function getClientApi(provider) {
  switch (provider) {
    case ServiceProvider.Google:
      return new ClientApi(ModelProvider.GeminiPro);
    case ServiceProvider.Anthropic:
      return new ClientApi(ModelProvider.Claude);
    case ServiceProvider.Baidu:
      return new ClientApi(ModelProvider.Ernie);
    case ServiceProvider.ByteDance:
      return new ClientApi(ModelProvider.Doubao);
    case ServiceProvider.Alibaba:
      return new ClientApi(ModelProvider.Qwen);
    default:
      return new ClientApi(ModelProvider.GPT);
  }
}
export function getHeaders() {
  // const accessStore = useAccessStore.getState();
  // const chatStore = useChatStore.getState();
  const headers = {
    "Content-Type": "application/json",
    // Accept: "application/json",
  };

  // const clientConfig = getClientConfig();

  // function getConfig() {
  //   const modelConfig = chatStore.currentSession().mask.modelConfig;
  //   const isGoogle = modelConfig.providerName == ServiceProvider.Google;
  //   const isAzure = modelConfig.providerName === ServiceProvider.Azure;
  //   const isAnthropic = modelConfig.providerName === ServiceProvider.Anthropic;
  //   const isBaidu = modelConfig.providerName == ServiceProvider.Baidu;
  //   const isByteDance = modelConfig.providerName === ServiceProvider.ByteDance;
  //   const isAlibaba = modelConfig.providerName === ServiceProvider.Alibaba;
  //   const isEnabledAccessControl = accessStore.enabledAccessControl();
  //   const apiKey = isGoogle
  //     ? accessStore.googleApiKey
  //     : isAzure
  //     ? accessStore.azureApiKey
  //     : isAnthropic
  //     ? accessStore.anthropicApiKey
  //     : isByteDance
  //     ? accessStore.bytedanceApiKey
  //     : isAlibaba
  //     ? accessStore.alibabaApiKey
  //     : accessStore.openaiApiKey;
  //   return {
  //     isGoogle,
  //     isAzure,
  //     isAnthropic,
  //     isBaidu,
  //     isByteDance,
  //     isAlibaba,
  //     apiKey,
  //     isEnabledAccessControl,
  //   };
  // }

  // function getAuthHeader(): string {
  //   return isAzure ? "api-key" : isAnthropic ? "x-api-key" : "Authorization";
  // }

  // function getBearerToken(apiKey: string, noBearer: boolean = false): string {
  //   return validString(apiKey)
  //     ? `${noBearer ? "" : "Bearer "}${apiKey.trim()}`
  //     : "";
  // }

  // function validString(x: string): boolean {
  //   return x?.length > 0;
  // }
  // const {
  //   isGoogle,
  //   isAzure,
  //   isAnthropic,
  //   isBaidu,
  //   apiKey,
  //   isEnabledAccessControl,
  // } = getConfig();
  // // when using google api in app, not set auth header
  // if (isGoogle && clientConfig?.isApp) return headers;
  // // when using baidu api in app, not set auth header
  // if (isBaidu && clientConfig?.isApp) return headers;

  // const authHeader = getAuthHeader();

  // const bearerToken = getBearerToken(apiKey, isAzure || isAnthropic);

  // if (bearerToken) {
  //   headers[authHeader] = bearerToken;
  // } else if (isEnabledAccessControl && validString(accessStore.accessCode)) {
  //   headers["Authorization"] = getBearerToken(
  //     ACCESS_CODE_PREFIX + accessStore.accessCode,
  //   );
  // }

  return headers;
}
class ClientApi {
  constructor(provider = ModelProvider.GPT) {
    switch (provider) {
      case ModelProvider.GeminiPro:
        this.llm = new GeminiProApi();
        break;
      case ModelProvider.Claude:
        this.llm = new ClaudeApi();
        break;
      case ModelProvider.Ernie:
        this.llm = new ErnieApi();
        break;
      case ModelProvider.Doubao:
        this.llm = new DoubaoApi();
        break;
      case ModelProvider.Qwen:
        this.llm = new QwenApi();
        break;
      default:
        this.llm = new ChatGPTApi();
    }
  }
  config() {}

  prompts() {}

  masks() {}
  async share(messages, avatarUrl = null) {
    const msgs = messages
      .map((m) => ({
        from: m.role === "user" ? "human" : "gpt",
        value: m.content,
      }))
      .concat([
        {
          from: "human",
          value: "Share from [NextChat]: https://github.com/Yidadaa/ChatGPT-Next-Web",
        },
      ]);
    // 敬告二开开发者们，为了开源大模型的发展，请不要修改上述消息，此消息用于后续数据清洗使用
    // Please do not modify this message

    console.log("[Share]", messages, msgs);
    const clientConfig = getClientConfig();
    const proxyUrl = "/sharegpt";
    const rawUrl = "https://sharegpt.com/api/conversations";
    const shareUrl = clientConfig?.isApp ? rawUrl : proxyUrl;
    const res = await fetch(shareUrl, {
      body: JSON.stringify({
        avatarUrl,
        items: msgs,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const resJson = await res.json();
    console.log("[Share]", resJson);
    if (resJson.id) {
      return `https://shareg.pt/${resJson.id}`;
    }
  }
}
