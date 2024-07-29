import { ref, computed } from "vue";
import { defineStore } from "pinia";

const DEFAULT_OPENAI_URL = "/api/openai";
const DEFAULT_ACCESS_STATE = {
  accessCode: "",
  useCustomConfig: false,
  provider: "OpenAI",
  needPassword: import.meta.env.VITE_NEEDPASSWORD,
  // openai
  openaiUrl: DEFAULT_OPENAI_URL,
  openaiApiKey: "",
  // server config
  needCode: true,
  hideUserApiKey: false,
  hideBalanceQuery: false,
  disableGPT4: false,
  disableFastLink: false,
  customModels: "",
  defaultModel: "",
};
export const userAccess = defineStore("accessStore", {
  state: () => {
    return {
      ...DEFAULT_ACCESS_STATE,
    };
  },
  actions: {
    setAccessCode(code) {
      this.accessCode = code;
    },
    resetCode() {
      this.accessCode = "";
    },
    init() {
      const savedState = localStorage.getItem("accessStore");
      if (savedState) {
        Object.assign(this, JSON.parse(savedState));
      }
    },
    isAuth() {
      return this.needPassword ? this.accessCode === import.meta.env.VITE_PASSWORD : true;
    },
  },
  persist: true,
});
