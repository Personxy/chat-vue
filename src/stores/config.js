import { defineStore } from "pinia";
import { DEFAULT_SIDEBAR_WIDTH, DEFAULT_MODELS } from "@/utils/constants";

export const SubmitKey = {
  Enter: "Enter",
  CtrlEnter: "Ctrl + Enter",
  ShiftEnter: "Shift + Enter",
  AltEnter: "Alt + Enter",
  MetaEnter: "Meta + Enter",
};
export const Theme = {
  Auto: "auto",
  Dark: "dark",
  Light: "light",
};
export const themeMaping = {
  auto: "自动主题",
  light: "亮色模式",
  dark: "深色模式",
};
export const DEFAULT_CONFIG = {
  lastUpdate: Date.now(), // timestamp, to merge state
  submitKey: SubmitKey.Enter,
  avatar: "1f603",
  fontSize: 14,
  theme: Theme.Light,
  // tightBorder: !!config?.isApp,
  sendPreviewBubble: true,
  enableAutoGenerateTitle: true,
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  disablePromptHint: false,
  dontShowMaskSplashScreen: false, // dont show splash screen when create chat
  hideBuiltinMasks: false, // dont add builtin masks
  customModels: "",
  models: DEFAULT_MODELS,

  modelConfig: {
    model: "gpt-3.5-turbo",
    providerName: "OpenAI",
    temperature: 0.5,
    top_p: 1,
    max_tokens: 4000,
    presence_penalty: 0,
    frequency_penalty: 0,
    sendMemory: true,
    historyMessageCount: 4,
    compressMessageLengthThreshold: 1000,
    enableInjectSystemPrompts: true,
    // template: config?.template ?? DEFAULT_INPUT_TEMPLATE,
  },
};
export const useConfig = defineStore("configStore", {
  state: () => {
    return {
      ...DEFAULT_CONFIG,
    };
  },
  actions: {
    init() {
      const savedState = localStorage.getItem("configStore");
      if (savedState) {
        Object.assign(this, JSON.parse(savedState));
      } else {
        localStorage.setItem("configStore", JSON.stringify(this.$state));
      }
      console.log(this);
    },
  },
  persist: true,
});
