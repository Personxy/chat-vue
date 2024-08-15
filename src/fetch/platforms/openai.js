import { userAccess } from "@/stores/access";
import { useChatStore } from "@/stores/chat";
import { useConfig } from "@/stores/config";
import { isVisionModel, getMessageTextContent, prettyObject } from "@/utils/index";
import { getHeaders } from "@/fetch/api";
import { REQUEST_TIMEOUT_MS, OpenaiPath } from "@/utils/constants";
import { fetchEventSource, EventStreamContentType } from "@microsoft/fetch-event-source";
export class ChatGPTApi {
  disableListModels = true;

  path(path) {
    const accessStore = userAccess();

    let baseUrl = accessStore.openaiUrl;

    // const isAzure = path.includes("deployments");
    // if (accessStore.useCustomConfig) {
    //   if (isAzure && !accessStore.isValidAzure()) {
    //     throw Error(
    //       "incomplete azure config, please check it in your settings page",
    //     );*/
    //   }

    //   baseUrl = isAzure ? accessStore.azureUrl : accessStore.openaiUrl;
    // }

    // if (baseUrl.length === 0) {
    //   const isApp = !!getClientConfig()?.isApp;
    //   const apiPath = isAzure ? ApiPath.Azure : ApiPath.OpenAI;
    //   baseUrl = isApp ? DEFAULT_API_HOST + "/proxy" + apiPath : apiPath;
    // }

    // if (baseUrl.endsWith("/")) {
    //   baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    // }
    // if (
    //   !baseUrl.startsWith("http") &&
    //   !isAzure &&
    //   !baseUrl.startsWith(ApiPath.OpenAI)
    // ) {
    //   baseUrl = "https://" + baseUrl;
    // }

    console.log("[Proxy Endpoint] ", baseUrl, path);

    return [baseUrl, path].join("/");
  }

  extractMessage(res) {
    return res.choices?.at(0)?.message?.content ?? "";
  }

  async chat(options) {
    console.log("[options]", options);
    const visionModel = isVisionModel(options.config.model);
    const messages = options.messages.map((v) => ({
      role: v.role,
      content: visionModel ? v.content : getMessageTextContent(v),
    }));

    const modelConfig = {
      ...useConfig().modelConfig,
      ...useChatStore().currentSession.modelConfig,
      ...{
        model: options.config.model,
        providerName: options.config.providerName,
      },
    };

    const requestPayload = {
      messages,
      stream: options.config.stream,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      presence_penalty: modelConfig.presence_penalty,
      frequency_penalty: modelConfig.frequency_penalty,
      top_p: modelConfig.top_p,
      // max_tokens: Math.max(modelConfig.max_tokens, 1024),
      // Please do not ask me why not send max_tokens, no reason, this param is just shit, I dont want to explain anymore.
    };

    // add max_tokens to vision model
    if (visionModel && modelConfig.model.includes("preview")) {
      requestPayload["max_tokens"] = Math.max(modelConfig.max_tokens, 4000);
    }

    console.log("[Request] openai payload: ", requestPayload);

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      let chatPath = "";
      // if (modelConfig.providerName === ServiceProvider.Azure) {
      //   // find model, and get displayName as deployName
      //   const { models: configModels, customModels: configCustomModels } = useAppConfig.getState();
      //   const { defaultModel, customModels: accessCustomModels, useCustomConfig } = useAccessStore.getState();
      //   const models = collectModelsWithDefaultModel(
      //     configModels,
      //     [configCustomModels, accessCustomModels].join(","),
      //     defaultModel
      //   );
      //   const model = models.find(
      //     (model) => model.name === modelConfig.model && model?.provider?.providerName === ServiceProvider.Azure
      //   );
      //   chatPath = this.path(
      //     Azure.ChatPath(
      //       model?.displayName ?? model?.name,
      //       useCustomConfig ? useAccessStore.getState().azureApiVersion : ""
      //     )
      //   );
      // } else {
      // chatPath = this.path(OpenaiPath.ChatPath);
      chatPath = "/api/openai";
      // chatPath = "http://localhost:3055/stream";
      // }
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(),
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      if (shouldStream) {
        let responseText = "";
        let remainText = "";
        let finished = false;

        // animate response to make it looks smooth
        function animateResponseText() {
          if (finished || controller.signal.aborted) {
            responseText += remainText;
            console.log("[Response Animation] finished");
            if (responseText?.length === 0) {
              options.onError?.(new Error("empty response from server"));
            }
            return;
          }

          if (remainText.length > 0) {
            const fetchCount = Math.max(1, Math.round(remainText.length / 60));
            const fetchText = remainText.slice(0, fetchCount);
            responseText += fetchText;
            remainText = remainText.slice(fetchCount);
            options.onUpdate?.(responseText, fetchText);
          }

          requestAnimationFrame(animateResponseText);
        }

        // start animaion
        animateResponseText();

        const finish = () => {
          if (!finished) {
            finished = true;
            options.onFinish(responseText + remainText);
          }
        };

        controller.signal.onabort = finish;
        console.log("[chatpath]", chatPath);
        fetchEventSource(chatPath, {
          ...chatPayload,
          async onopen(res) {
            clearTimeout(requestTimeoutId);
            const contentType = res.headers.get("content-type");
            console.log("[OpenAI] request response content type: ", contentType);

            if (contentType?.startsWith("text/plain")) {
              responseText = await res.clone().text();
              return finish();
            }

            if (!res.ok || !res.headers.get("content-type")?.startsWith(EventStreamContentType) || res.status !== 200) {
              const responseTexts = [responseText];
              let extraInfo = await res.clone().text();
              try {
                const resJson = await res.clone().json();
                extraInfo = prettyObject(resJson);
              } catch {}

              if (res.status === 401) {
                responseTexts.push(Locale.Error.Unauthorized);
              }

              if (extraInfo) {
                responseTexts.push(extraInfo);
              }

              responseText = responseTexts.join("\n\n");

              return finish();
            }
          },
          onmessage(msg) {
            if (msg.data === "[DONE]" || finished) {
              return finish();
            }
            const text = msg.data;
            try {
              const json = JSON.parse(text);
              const choices = json.choices;
              const delta = choices[0]?.delta?.content;
              const textmoderation = json?.prompt_filter_results;

              if (delta) {
                remainText += delta;
              }

              if (textmoderation && textmoderation.length > 0 && ServiceProvider.Azure) {
                const contentFilterResults = textmoderation[0]?.content_filter_results;
                console.log(
                  `[${ServiceProvider.Azure}] [Text Moderation] flagged categories result:`,
                  contentFilterResults
                );
              }
            } catch (e) {
              // console.error("[Request] parse error", text, msg);
            }
          },
          onclose() {
            finish();
          },
          onerror(e) {
            options.onError?.(e);
            throw e;
          },
          openWhenHidden: true,
        });
      } else {
        const res = await fetch(chatPath, chatPayload);

        clearTimeout(requestTimeoutId);

        const resJson = await res.json();
        const message = this.extractMessage(resJson);
        console.log("[nostream reponse] request response", message);
        options.onFinish(message);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e);
    }
  }
  async usage() {
    const formatDate = (d) =>
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate = formatDate(startOfMonth);
    const endDate = formatDate(new Date(Date.now() + ONE_DAY));

    const [used, subs] = await Promise.all([
      fetch(this.path(`${OpenaiPath.UsagePath}?start_date=${startDate}&end_date=${endDate}`), {
        method: "GET",
        headers: getHeaders(),
      }),
      fetch(this.path(OpenaiPath.SubsPath), {
        method: "GET",
        headers: getHeaders(),
      }),
    ]);

    if (used.status === 401) {
      throw new Error(Locale.Error.Unauthorized);
    }

    if (!used.ok || !subs.ok) {
      throw new Error("Failed to query usage from openai");
    }

    const response = await used.json();

    const total = await subs.json();

    if (response.error && response.error.type) {
      throw Error(response.error.message);
    }

    if (response.total_usage) {
      response.total_usage = Math.round(response.total_usage) / 100;
    }

    if (total.hard_limit_usd) {
      total.hard_limit_usd = Math.round(total.hard_limit_usd * 100) / 100;
    }

    return {
      used: response.total_usage,
      total: total.hard_limit_usd,
    };
  }

  async models() {
    if (this.disableListModels) {
      return DEFAULT_MODELS.slice();
    }

    const res = await fetch(this.path(OpenaiPath.ListModelPath), {
      method: "GET",
      headers: {
        ...getHeaders(),
      },
    });

    const resJson = await res.json();
    const chatModels = resJson.data?.filter((m) => m.id.startsWith("gpt-"));
    console.log("[Models]", chatModels);

    if (!chatModels) {
      return [];
    }

    return chatModels.map((m) => ({
      name: m.id,
      available: true,
      provider: {
        id: "openai",
        providerName: "OpenAI",
        providerType: "openai",
      },
    }));
  }
}
