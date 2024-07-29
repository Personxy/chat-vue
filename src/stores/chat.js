import { defineStore } from "pinia";
import { nanoid } from "nanoid";
import { useConfig } from "./config";
import { DEFAULT_SYSTEM_TEMPLATE, SUMMARIZE_MODEL } from "@/utils/constants";
import { estimateTokenLength } from "@/utils/token";
import { getMessageTextContent, trimTopic } from "@/utils/index";
import { getClientApi } from "@/fetch/api";
import { ChatControllerPool } from "@/fetch/controller";
import { prettyObject } from "@/utils/index";
const DEFAULT_TOPIC = "新的聊天";

function createEmptySession() {
  const config = useConfig();
  const message = createMessage({
    role: "assistant",
    content: "有什么可以帮你的吗",
  });
  return {
    id: nanoid(),
    topic: DEFAULT_TOPIC,
    memoryPrompt: "",
    messages: [message],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
    currentUserInput: "",
    currentSessionModel: "gpt-3.5-turbo",
    modelConfig: config.modelConfig,
    // mask: createEmptyMask(),
  };
}

const DEFAULT_CHAT_STATE = {
  sessions: [createEmptySession()],
  currentSessionIndex: 0,
};

export const useChatStore = defineStore("chatStore", {
  state: () => {
    return {
      ...DEFAULT_CHAT_STATE,
    };
  },
  actions: {
    currentSession() {
      let index = this.currentSessionIndex;
      const sessions = this.sessions;
      if (index < 0 || index >= sessions.length) {
        index = Math.min(sessions.length - 1, Math.max(0, index));
        this.currentSessionIndex = index;
      }
      const session = sessions[index];
      return session;
    },
    setCurrentUserInput(value) {
      this.currentSession().currentUserInput = value;
    },
    fillTemplateWith(input, modelConfig) {
      return input;
    },

    getMemoryPrompt() {
      const session = this.currentSession();

      if (session.memoryPrompt.length) {
        return {
          role: "system",
          content: (content) => "这是历史聊天总结作为前情提要：" + content,
          date: "",
        };
      }
    },
    getMessagesWithMemory() {
      const session = this.currentSession();
      const modelConfig = session.modelConfig;
      const clearContextIndex = session.clearContextIndex ?? 0;
      const messages = session.messages.slice();
      const totalMessageCount = session.messages.length;

      // in-context prompts
      // const contextPrompts = session.mask.context.slice();

      // system prompts, to get close to OpenAI Web ChatGPT
      const shouldInjectSystemPrompts =
        modelConfig.enableInjectSystemPrompts && session.modelConfig.model.startsWith("gpt-");

      var systemPrompts = [
        {
          role: "system",
          content: this.fillTemplateWith("", {
            ...modelConfig,
            template: DEFAULT_SYSTEM_TEMPLATE,
          }),
        },
      ];
      // systemPrompts = shouldInjectSystemPrompts
      //   ? [
      //       createMessage({
      //         role: "system",
      //         content: fillTemplateWith("", {
      //           ...modelConfig,
      //           template: DEFAULT_SYSTEM_TEMPLATE,
      //         }),
      //       }),
      //     ]
      //   : [];
      if (shouldInjectSystemPrompts) {
        console.log("[Global System Prompt] ", systemPrompts.at(0)?.content ?? "empty");
      }
      const memoryPrompt = this.getMemoryPrompt();
      // long term memory
      const shouldSendLongTermMemory =
        modelConfig.sendMemory && session.memoryPrompt && session.memoryPrompt.length > 0;
      //  &&
      // session.lastSummarizeIndex > clearContextIndex;
      const longTermMemoryPrompts = shouldSendLongTermMemory && memoryPrompt ? [memoryPrompt] : [];
      const longTermMemoryStartIndex = session.lastSummarizeIndex;

      // short term memory
      const shortTermMemoryStartIndex = Math.max(0, totalMessageCount - modelConfig.historyMessageCount);

      // lets concat send messages, including 4 parts:
      // 0. system prompt: to get close to OpenAI Web ChatGPT
      // 1. long term memory: summarized memory messages
      // 2. pre-defined in-context prompts
      // 3. short term memory: latest n messages
      // 4. newest input message
      const memoryStartIndex = shouldSendLongTermMemory
        ? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
        : shortTermMemoryStartIndex;
      // and if user has cleared history messages, we should exclude the memory too.
      const contextStartIndex = Math.max(clearContextIndex ?? 0, memoryStartIndex);
      const maxTokenThreshold = modelConfig.max_tokens;

      // get recent messages as much as possible
      const reversedRecentMessages = [];
      for (
        let i = totalMessageCount - 1, tokenCount = 0;
        i >= contextStartIndex && tokenCount < maxTokenThreshold;
        i -= 1
      ) {
        const msg = messages[i];
        if (!msg || msg.isError) continue;
        tokenCount += estimateTokenLength(getMessageTextContent(msg));
        reversedRecentMessages.push(msg);
      }
      // concat all messages
      const recentMessages = [
        ...systemPrompts,
        ...longTermMemoryPrompts,
        // ...contextPrompts,
        ...reversedRecentMessages.reverse(),
      ];

      return recentMessages;
    },
    updateCurrentSession(updater) {
      const sessions = this.sessions;
      const index = this.currentSessionIndex;
      updater(sessions[index]);
    },
    sendMessage(content, attachImages) {
      const that = this;
      const session = this.currentSession();
      const modelConfig = session.modelConfig;

      const userContent = this.fillTemplateWith(content, modelConfig);
      console.log("[User Input] after template: ", userContent);

      let mContent = userContent;

      if (attachImages && attachImages.length > 0) {
        mContent = [
          {
            type: "text",
            text: userContent,
          },
        ];
        mContent = mContent.concat(
          attachImages.map((url) => {
            return {
              type: "image_url",
              image_url: {
                url: url,
              },
            };
          })
        );
      }
      let userMessage = createMessage({
        role: "user",
        content: mContent,
      });

      const botMessage = createMessage({
        role: "assistant",
        streaming: true,
        model: modelConfig.model,
      });
      const recentMessages = this.getMessagesWithMemory();
      const sendMessages = recentMessages.concat(userMessage);
      const messageIndex = this.currentSession().messages.length + 1;
      this.updateCurrentSession((session) => {
        const savedUserMessage = {
          ...userMessage,
          content: mContent,
        };
        session.messages = session.messages.concat([savedUserMessage, botMessage]);
      });
      const api = getClientApi(modelConfig.providerName);
      api.llm.chat({
        messages: sendMessages,
        config: { ...modelConfig, stream: true },
        onUpdate(message) {
          botMessage.streaming = true;
          if (message) {
            botMessage.content = message;
          }
          that.updateCurrentSession((session) => {
            session.messages = session.messages.concat();
          });
        },
        onFinish(message) {
          botMessage.streaming = false;
          if (message) {
            botMessage.content = message;
            that.onNewMessage(botMessage);
          }
          ChatControllerPool.remove(session.id, botMessage.id);
        },
        onError(error) {
          const isAborted = error.message.includes("aborted");
          botMessage.content +=
            "\n\n" +
            prettyObject({
              error: true,
              message: error.message,
            });
          botMessage.streaming = false;
          userMessage.isError = !isAborted;
          botMessage.isError = !isAborted;
          that.updateCurrentSession((session) => {
            session.messages = session.messages.concat();
          });
          ChatControllerPool.remove(session.id, botMessage.id ?? messageIndex);

          console.error("[Chat] failed ", error);
        },
        onController(controller) {
          // collect controller for stop/retry
          ChatControllerPool.addController(session.id, botMessage.id ?? messageIndex, controller);
        },
      });
    },
    onNewMessage(message) {
      this.updateCurrentSession((session) => {
        session.messages = session.messages.concat();
        session.lastUpdate = Date.now();
      });
      // this.updateStat(message);
      // this.summarizeSession();
    },
    summarizeSession() {
      const config = useConfig();
      const session = this.currentSession();
      const modelConfig = session.modelConfig;
      const that = this;
      const api = getClientApi(modelConfig.providerName);

      // remove error messages if any
      const messages = session.messages;

      // should summarize topic after chating more than 50 words
      const SUMMARIZE_MIN_LEN = 50;
      if (
        config.enableAutoGenerateTitle &&
        session.topic === DEFAULT_TOPIC &&
        this.countMessages(messages) >= SUMMARIZE_MIN_LEN
      ) {
        const topicMessages = messages.concat(
          createMessage({
            role: "user",
            content:
              "使用四到五个字直接返回这句话的简要主题，不要解释、不要标点、不要语气词、不要多余文本，不要加粗，如果没有主题，请直接返回“闲聊”",
          })
        );
        api.llm.chat({
          messages: topicMessages,
          config: {
            model: this.getSummarizeModel(session.modelConfig.model),
            stream: false,
          },
          onFinish(message) {
            that.updateCurrentSession(
              (session) => (session.topic = message.length > 0 ? trimTopic(message) : DEFAULT_TOPIC)
            );
          },
        });
      }
      const summarizeIndex = Math.max(session.lastSummarizeIndex, session.clearContextIndex ?? 0);
      let toBeSummarizedMsgs = messages.filter((msg) => !msg.isError).slice(summarizeIndex);

      const historyMsgLength = this.countMessages(toBeSummarizedMsgs);

      if (historyMsgLength > modelConfig?.max_tokens ?? 4000) {
        const n = toBeSummarizedMsgs.length;
        toBeSummarizedMsgs = toBeSummarizedMsgs.slice(Math.max(0, n - modelConfig.historyMessageCount));
      }
      const memoryPrompt = this.getMemoryPrompt();
      if (memoryPrompt) {
        // add memory prompt
        toBeSummarizedMsgs.unshift(memoryPrompt);
      }

      const lastSummarizeIndex = session.messages.length;

      console.log("[Chat History] ", toBeSummarizedMsgs, historyMsgLength, modelConfig.compressMessageLengthThreshold);

      if (historyMsgLength > modelConfig.compressMessageLengthThreshold && modelConfig.sendMemory) {
        /** Destruct max_tokens while summarizing
         * this param is just shit
         **/
        const { max_tokens, ...modelcfg } = modelConfig;
        api.llm.chat({
          messages: toBeSummarizedMsgs.concat(
            createMessage({
              role: "system",
              content: "简要总结一下对话内容，用作后续的上下文提示 prompt，控制在 200 字以内",
              date: "",
            })
          ),
          config: {
            ...modelcfg,
            stream: true,
            model: that.getSummarizeModel(session.modelConfig.model),
          },
          onUpdate(message) {
            session.memoryPrompt = message;
          },
          onFinish(message) {
            console.log("[Memory] ", message);
            that.updateCurrentSession((session) => {
              session.lastSummarizeIndex = lastSummarizeIndex;
              session.memoryPrompt = message; // Update the memory prompt for stored it in local storage
            });
          },
          onError(err) {
            console.error("[Summarize] ", err);
          },
        });
      }
    },

    countMessages(msgs) {
      return msgs.reduce((pre, cur) => pre + estimateTokenLength(getMessageTextContent(cur)), 0);
    },
    getSummarizeModel(currentModel) {
      // if it is using gpt-* models, force to use 3.5 to summarize
      if (currentModel.startsWith("gpt")) {
        // const configStore = useConfig()
        // const accessStore = userAccess()
        // const allModel = collectModelsWithDefaultModel(
        //   configStore.models,
        //   [configStore.customModels, accessStore.customModels].join(","),
        //   accessStore.defaultModel,
        // );
        // const summarizeModel = allModel.find(
        //   (m) => m.name === SUMMARIZE_MODEL && m.available,
        // );
        // return summarizeModel?.name ?? currentModel;
        return SUMMARIZE_MODEL;
      }
      if (currentModel.startsWith("gemini")) {
        return GEMINI_SUMMARIZE_MODEL;
      }
      return currentModel;
    },
  },
  persist: true,
});

export function createMessage(override) {
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: "user",
    content: "",
    ...override,
  };
}

export const BOT_HELLO = createMessage({
  role: "assistant",
  content: "有什么可以帮你的吗",
});
