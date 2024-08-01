<template>
  <div class="chat-input-panel">
    <div class="chat-input-actions">
      <chatAction :onClick="handleActionClick">
        <template #icon>
          <!-- Your icon here -->
          <img src="@/icons/settings.svg" style="width: 16px; height: 16px" />
        </template>
        <template #text> 对话设置 </template>
      </chatAction>
      <chatAction :onClick="handleActionClick">
        <template #icon>
          <!-- Your icon here -->
          <img src="@/icons/image.svg" style="width: 16px; height: 16px" />
        </template>
        <template #text> 上传图片 </template>
      </chatAction>
      <chatAction :onClick="handleActionClick">
        <template #icon>
          <!-- Your icon here -->
          <img src="@/icons/dark.svg" style="width: 16px; height: 16px" />
        </template>
        <template #text> 深色模式 </template>
      </chatAction>
      <chatAction :onClick="handleActionClick">
        <template #icon>
          <!-- Your icon here -->
          <img src="@/icons/robot.svg" style="width: 16px; height: 16px" />
        </template>
        <template #text> {{ getCurrentModel() }} </template>
      </chatAction>
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

      <!-- <div className={styles["attach-images"]} v-if="attachImages.length>">
              {attachImages.map((image, index) => {
                return (
                  <div
                    key={index}
                    className={styles["attach-image"]}
                    style={{ backgroundImage: `url("${image}")` }}
                  >
                    <div className={styles["attach-image-mask"]}>
                      <DeleteImageButton
                        deleteImage={() => {
                          setAttachImages(
                            attachImages.filter((_, i) => i !== index),
                          );
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div> -->
      <el-button type="primary" class="chat-input-send" @click="doSubmit" :icon="Position"> 发送 </el-button>
    </label>
  </div>
</template>

<script setup>
import chatAction from "./chatAction.vue";
import { useMobileScreen } from "@/hooks";
import { Position } from "@element-plus/icons-vue";
import { useChatStore } from "@/stores/chat";

const inputRows = ref(2);
const autoFocus = useMobileScreen();
const isComposing = ref(false);
const attachImages = ref([]);
const config = ref({ fontSize: "14px" });

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
function getCurrentModel() {
  return "gpt-3.5-turbo";
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

  chatStore.sendMessage(userInput.value.trim());
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
const handlePaste = () => {};
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
</style>
