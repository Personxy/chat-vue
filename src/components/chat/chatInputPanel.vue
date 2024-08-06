<template>
  <div class="chat-input-panel">
    <div class="chat-input-actions">
      <chatAction @click="handleActionClick">
        <template #icon>
          <!-- Your icon here -->
          <img src="@/icons/settings.svg" style="width: 16px; height: 16px" />
        </template>
        <template #text> 对话设置 </template>
      </chatAction>
      <chatAction @click="uploadImages" v-show="isVisionModel(currentModel)">
        <template #icon>
          <!-- Your icon here -->
          <img src="@/icons/image.svg" style="width: 16px; height: 16px" v-show="imageLoading === false" />
          <img src="@/icons/loading.svg" style="width: 16px; height: 16px" v-show="imageLoading === true" />
        </template>
        <template #text> 上传图片 </template>
      </chatAction>
      <chatAction @click="themeClick">
        <template #icon>
          <!-- Your icon here -->
          <img src="@/icons/dark.svg" style="width: 16px; height: 16px" v-show="appConfig.theme === 'dark'" />
          <img src="@/icons/light.svg" style="width: 16px; height: 16px" v-show="appConfig.theme === 'light'" />
        </template>
        <template #text> {{ themeMaping[appConfig.theme] }} </template>
      </chatAction>
      <chatAction :onClick="modelClick">
        <template #icon>
          <!-- Your icon here -->
          <img src="@/icons/robot.svg" style="width: 16px; height: 16px" />
        </template>
        <template #text> {{ currentModel }} </template>
      </chatAction>
      <Selector
        v-model="showSelector"
        :items="openaiModelsList"
        :defaultSelectedValue="currentModel"
        :onSelection="handleSelection"
        :onClose="onClose" />
    </div>

    <label
      class="chat-input-panel-inner"
      :class="attachImages.length != 0 ? 'chat-input-panel-inner-attach' : ''"
      htmlFor="chat-input">
      <textarea
        id="chat-input"
        ref="inputRef"
        className="chat-input"
        placeholder="Enter 发送，Shift + Enter 换行，/ 触发补全，: 触发命令"
        v-model="userInput"
        @keydown="onInputKeyDown"
        @focus="scrollToBottom"
        @click="scrollToBottom"
        @paste="handlePaste"
        :rows="inputRows"
        :autoFocus="autoFocus"
        :style="{ fontSize: config.fontSize }" />

      <div class="attach-images" v-show="attachImages.length">
        <div
          class="attach-image"
          v-for="(image, index) in attachImages"
          :key="index"
          :style="{ backgroundImage: `url('${image}')` }">
          <div class="attach-image-mask">
            <div class="delete-image" @click="deleteImage(index)">
              <deleteIcon />
            </div>
          </div>
        </div>
      </div>
      <el-button type="primary" class="chat-input-send" @click="doSubmit" :icon="Position"> 发送 </el-button>
    </label>
  </div>
</template>

<script setup>
import chatAction from "./chatAction.vue";
import { useMobileScreen } from "@/hooks";
import { Position } from "@element-plus/icons-vue";
import { useChatStore } from "@/stores/chat";
import Selector from "@/components/ui/Selector.vue";
import { openaiModels } from "@/utils/constants";
import { useConfig } from "@/stores/config";
import { themeMaping } from "@/stores/config";
import deleteIcon from "@/icons/deleteIcon.vue";
import { compressImage } from "@/utils/index";
import { isVisionModel } from "@/utils/index";
const inputRows = ref(2);
const autoFocus = useMobileScreen();
const isComposing = ref(false);

const config = ref({ fontSize: "14px" });
const image = ref("path/to/your/image.jpg");

const onCompositionStart = () => {
  isComposing.value = true;
};
const onCompositionEnd = () => {
  isComposing.value = false;
};
onMounted(() => {
  window.addEventListener("compositionstart", onCompositionStart);
  window.addEventListener("compositionend", onCompositionEnd);
});

onUnmounted(() => {
  window.removeEventListener("compositionstart", onCompositionStart);
  window.removeEventListener("compositionend", onCompositionEnd);
});

function handleActionClick() {
  console.log("Chat action clicked");
}

const chatStore = useChatStore();

const userInput = computed({
  get() {
    return chatStore.currentSession.currentUserInput;
  },
  set(value) {
    chatStore.setCurrentUserInput(value);
  },
});

const doSubmit = () => {
  if (userInput.value.trim() === "") return;

  chatStore.sendMessage(userInput.value.trim(), attachImages.value);
  attachImages.value = [];
};
const shouldSubmit = (e) => {
  if (e.key !== "Enter") return false;
  if (e.key === "Enter" && (e.isComposing || isComposing.value)) {
    return false;
  } else {
    return true;
  }
};
function onInputKeyDown(e) {
  // if ArrowUp and no userInput, fill with last input
  if (e.key === "ArrowUp" && userInput.length <= 0 && !(e.metaKey || e.altKey || e.ctrlKey)) {
    setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
    e.preventDefault();
    return;
  }

  if (shouldSubmit(e)) {
    doSubmit(userInput);
    e.preventDefault();
  }
}
const scrollToBottom = () => {};

const currentModel = computed(() => {
  return chatStore.currentSession.modelConfig.model || "gpt-3.5-turbo";
});

const showSelector = ref(false);
const openaiModelsList = ref(openaiModels);
const modelClick = () => {
  console.log(showSelector.value, "showSelector");
  showSelector.value = !showSelector.value;
};
const onClose = () => {
  showSelector.value = false;
};
const handleSelection = (value) => {
  showSelector.value = false;
  console.log(showSelector.value, "showSelector");
  chatStore.updateCurrentSession((session) => {
    session.modelConfig.model = value;
  });
  console.log(value);
};

// 主题切换
const appConfig = useConfig();
const themeClick = () => {
  appConfig.theme = appConfig.theme === "dark" ? "light" : "dark";
};

// 图片上传
const attachImages = ref([]);
const imageLoading = ref(false);
const deleteImage = (index) => {
  attachImages.value.splice(index, 1);
};
const uploadImages = async () => {
  const images = [];
  images.push(...attachImages.value);

  images.push(
    ...(await new Promise((res, rej) => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/png, image/jpeg, image/webp, image/heic, image/heif";
      fileInput.multiple = true;
      fileInput.onchange = (event) => {
        imageLoading.value = true;
        const files = event.target.files;
        const imagesData = [];
        for (let i = 0; i < files.length; i++) {
          const file = event.target.files[i];
          compressImage(file, 256 * 1024)
            .then((dataUrl) => {
              imagesData.push(dataUrl);
              if (imagesData.length === 3 || imagesData.length === files.length) {
                imageLoading.value = false;
                res(imagesData);
              }
            })
            .catch((e) => {
              imageLoading.value = false;
              rej(e);
            });
        }
      };
      fileInput.click();
    }))
  );

  const imagesLength = images.length;
  if (imagesLength > 3) {
    images.splice(3, imagesLength - 3);
  }
  attachImages.value = images;
};

const handlePaste = async (event) => {
  console.log(event, "ev");
  const currentModel = chatStore.currentSession.modelConfig.model;
  if (!isVisionModel(currentModel)) {
    return;
  }
  const items = (event.clipboardData || window.clipboardData).items;
  for (const item of items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      event.preventDefault();
      const file = item.getAsFile();
      if (file) {
        const images = [];
        images.push(...attachImages.value);
        images.push(
          ...(await new Promise((res, rej) => {
            const imagesData = [];
            compressImage(file, 256 * 1024)
              .then((dataUrl) => {
                imagesData.push(dataUrl);

                res(imagesData);
              })
              .catch((e) => {
                rej(e);
              });
          }))
        );
        const imagesLength = images.length;

        if (imagesLength > 3) {
          images.splice(3, imagesLength - 3);
        }
        attachImages.value = images;
      }
    }
  }
};
</script>

<style scoped lang="less">
.chat-input-panel {
  position: relative;
  width: 100%;
  padding: 20px;
  padding-top: 10px;
  box-sizing: border-box;
  flex-direction: column;
  border-top: var(--border-in-light);
  box-shadow: var(--card-shadow);

  .chat-input-actions {
    display: flex;
    flex-wrap: wrap;
    .chat-input-action {
      &:not(:last-child) {
        margin-right: 5px;
      }
    }
  }
  .chat-input-panel-inner {
    cursor: text;
    display: flex;
    flex: 1;
    border-radius: 10px;
    border: var(--border-in-light);
  }

  .chat-input-panel-inner-attach {
    padding-bottom: 80px;
  }

  .chat-input-panel-inner:has(.chat-input:focus) {
    border: 1px solid var(--primary);
  }
}
.chat-input {
  height: 100%;
  width: 100%;
  border-radius: 10px;
  border: none;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.03);
  background-color: var(--white);
  color: var(--black);
  font-family: inherit;
  padding: 10px 90px 10px 14px;
  resize: none;
  outline: none;
  box-sizing: border-box;
  min-height: 68px;
}

.chat-input-send {
  background-color: var(--primary);
  color: white;

  position: absolute;
  right: 30px;
  bottom: 32px;
}

@media only screen and (max-width: 600px) {
  .chat-input {
    font-size: 16px;
  }

  .chat-input-send {
    bottom: 30px;
  }
}
.attach-images {
  position: absolute;
  left: 30px;
  bottom: 32px;
  display: flex;
}
@color: #888;
@alpha: 0.2;
.attach-image {
  cursor: default;
  width: 64px;
  height: 64px;
  border: rgba(@color, @alpha) 1px solid;
  border-radius: 5px;
  margin-right: 10px;
  background-size: cover;
  background-position: center;
  background-color: var(--white);

  .attach-image-mask {
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: all ease 0.2s;
  }

  .attach-image-mask:hover {
    opacity: 1;
  }

  .delete-image {
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    float: right;
    background-color: var(--white);
  }
}
</style>
