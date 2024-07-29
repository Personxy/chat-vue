<template>
  <div class="chat-body" ref="scrollRef" @mousedown="$emit('bodyClick')" @touchstart="onTouchStart">
    <template v-for="(message, i) in messages" :key="message.id">
      <div :class="message.role === 'user' ? 'chat-message-user' : 'chat-message'">
        <div class="chat-message-container">
          <div class="chat-message-header">
            <div class="chat-message-avatar">
              <div class="chat-message-edit">
                <!-- <IconButton
                  icon="EditIcon"
                  @click="async () => {
                    const newMessage = await showPrompt(Locale.Chat.Actions.Edit, getMessageTextContent(message), 10);
                    let newContent = newMessage;
                    const images = getMessageImages(message);
                    if (images.length > 0) {
                      newContent = [{ type: 'text', text: newMessage }];
                      for (let i = 0; i < images.length; i++) {
                        newContent.push({ type: 'image_url', image_url: { url: images[i] } });
                      }
                    }
                    updateMessageContent(message.id, newContent);
                  }"
                /> -->
              </div>
              <!-- <Avatar v-if="message.role === 'user'" :avatar="config.avatar" />
              <Avatar v-else-if="['system'].includes(message.role)" avatar="2699-fe0f" /> -->
              <!-- <MaskAvatar v-else :avatar="session.mask.avatar" :model="message.model || session.mask.modelConfig.model" /> -->
            </div>
            <!-- <div v-if="showActions(i, message)" class="chat-message-actions">
              <div class="chat-input-actions">
                <ChatAction
                  v-if="message.streaming"
                  text="Locale.Chat.Actions.Stop"
                  icon="StopIcon"
                  @click="() => onUserStop(message.id ?? i)"
                />
                <template v-else>
                  <ChatAction text="Locale.Chat.Actions.Retry" icon="ResetIcon" @click="() => onResend(message)" />
                  <ChatAction text="Locale.Chat.Actions.Delete" icon="DeleteIcon" @click="() => onDelete(message.id ?? i)" />
                  <ChatAction text="Locale.Chat.Actions.Pin" icon="PinIcon" @click="() => onPinMessage(message)" />
                  <ChatAction text="Locale.Chat.Actions.Copy" icon="CopyIcon" @click="() => copyToClipboard(getMessageTextContent(message))" />
                </template>
              </div>
            </div> -->
          </div>
          <div v-if="message.preview || message.streaming" class="chat-message-status">正在输入…</div>
          <div class="chat-message-item">
            <markdown
              :content="getMessageTextContent(message)"
              :loading="
                (message.preview || message.streaming) && message.content.length === 0 && message.role !== 'user'
              "
              @contextmenu="(e) => onRightClick(e, message)"
              :fontSize="config.fontSize" />
            <img
              v-if="getMessageImages(message).length === 1"
              class="chat-message-item-image"
              :src="getMessageImages(message)[0]"
              alt="" />
            <div
              v-else-if="getMessageImages(message).length > 1"
              class="chat-message-item-images"
              :style="{ '--image-count': getMessageImages(message).length }">
              <img
                v-for="(image, index) in getMessageImages(message)"
                :key="index"
                class="chat-message-item-image-multi"
                :src="image"
                alt="" />
            </div>
          </div>
          <div class="chat-message-action-date">
            {{ i < context.length ? "预设提示词" : message.date.toLocaleString() }}
          </div>
        </div>
      </div>
      <!-- <ClearContextDivider v-if="i === clearContextIndex - 1" /> -->
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { CHAT_PAGE_SIZE } from "@/utils/constants";
import { createMessage, useChatStore, BOT_HELLO } from "@/stores/chat";
import { useConfig } from "@/stores/config";
import { getMessageTextContent, getMessageImages } from "@/utils/index";
import markdown from "@/components/chat/markdown.vue";
import { useMobileScreen } from "@/hooks";
const emit = defineEmits();
const onTouchStart = (e) => {
  emit("bodyClick");
};
const session = useChatStore().currentSession();
console.log(session, "session");
const config = useConfig();
const isLoading = ref(false);
const context = ref([]);
const isMobileScreen = useMobileScreen();
const renderMessages = computed(() => {
  console.log(config, "config");
  const messages = [
    // ...context.value,
    ...session.messages,
    ...(isLoading.value
      ? [
          {
            ...createMessage({
              role: "assistant",
              content: "……",
            }),
            preview: false,
          },
        ]
      : []),
    ...[
      // {
      //   ...createMessage({
      //     role: "user",
      //     content: props.userInput,
      //   }),
      //   preview: false,
      // },
    ],
    // ...(userInput.length > 0 && props.config.sendPreviewBubble
    //   ? [{
    //       ...createMessage({
    //         role: "user",
    //         content: props.userInput,
    //       }),
    //       preview: false,
    //     }]
    //   : [])
  ];
  console.log(messages, "messages");
  return messages;
});
const msgRenderIndex = ref(Math.max(0, renderMessages.length - CHAT_PAGE_SIZE));
console.log(msgRenderIndex.value, "msgRenderIndex");
const messages = computed(() => {
  const endRenderIndex = Math.min(msgRenderIndex + 3 * CHAT_PAGE_SIZE, renderMessages.length);

  return renderMessages.value.slice();
});
const onRightClick = (e, message) => {};
</script>

<style scoped lang="less">
.chat-body {
  flex: 1;
  overflow: auto;
  overflow-x: hidden;
  padding: 20px;
  padding-bottom: 40px;
  position: relative;
  overscroll-behavior: none;
}

.chat-body-main-title {
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

@media only screen and (max-width: 600px) {
  .chat-body-title {
    text-align: center;
  }
}

.chat-message {
  display: flex;
  flex-direction: row;

  &:last-child {
    animation: slide-in ease 0.3s;
  }
}

.chat-message-user {
  display: flex;
  flex-direction: row-reverse;

  .chat-message-header {
    flex-direction: row-reverse;
  }
}

.chat-message-header {
  margin-top: 20px;
  display: flex;
  align-items: center;

  .chat-message-actions {
    display: flex;
    box-sizing: border-box;
    font-size: 12px;
    align-items: flex-end;
    justify-content: space-between;
    transition: all ease 0.3s;
    transform: scale(0.9) translateY(5px);
    margin: 0 10px;
    opacity: 0;
    pointer-events: none;

    .chat-input-actions {
      display: flex;
      flex-wrap: nowrap;
    }
  }
}

.chat-message-container {
  max-width: var(--message-max-width);
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &:hover {
    .chat-message-edit {
      opacity: 0.9;
    }

    .chat-message-actions {
      opacity: 1;
      pointer-events: all;
      transform: scale(1) translateY(0);
    }
  }
}

.chat-message-user > .chat-message-container {
  align-items: flex-end;
}

.chat-message-avatar {
  position: relative;

  .chat-message-edit {
    position: absolute;
    height: 100%;
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all ease 0.3s;

    button {
      padding: 7px;
    }
  }

  /* Specific styles for iOS devices */
  @media screen and (max-device-width: 812px) and (-webkit-min-device-pixel-ratio: 2) {
    @supports (-webkit-touch-callout: none) {
      .chat-message-edit {
        top: -8%;
      }
    }
  }
}

.chat-message-status {
  font-size: 12px;
  color: #aaa;
  line-height: 1.5;
  margin-top: 5px;
}

.chat-message-item {
}
:deep(.github-markdown-body) {
  box-sizing: border-box;
  max-width: 100%;
  margin-top: 10px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 10px;
  font-size: 14px;
  user-select: text;
  word-break: break-word;
  border: var(--border-in-light);
  position: relative;
  transition: all ease 0.3s;
}
:deep(.github-markdown-body blockquote),
:deep(.github-markdown-body details),
:deep(.github-markdown-body dl),
:deep(.github-markdown-body ol),
:deep(.github-markdown-body p),
:deep(.github-markdown-body pre),
:deep(.github-markdown-body table),
:deep(.github-markdown-body ul) {
  margin-bottom: 0 !important;
}
.chat-message-item-image {
  width: 100%;
  margin-top: 10px;
}

.chat-message-item-images {
  width: 100%;
  display: grid;
  justify-content: left;
  grid-gap: 10px;
  grid-template-columns: repeat(var(--image-count), auto);
  margin-top: 10px;
}

.chat-message-item-image-multi {
  object-fit: cover;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
@color: #888;
@alpha: 0.2;
.chat-message-item-image,
.chat-message-item-image-multi {
  box-sizing: border-box;
  border-radius: 10px;
  border: rgba(@color, @alpha) 1px solid;
}

@media only screen and (max-width: 600px) {
  @calc-image-width: calc(100vw / 3 * 2 / var(--image-count));

  .chat-message-item-image-multi {
    width: @calc-image-width;
    height: @calc-image-width;
  }

  .chat-message-item-image {
    max-width: calc(100vw / 3 * 2);
  }
}

@media screen and (min-width: 600px) {
  @max-image-width: calc(calc(1200px - var(--sidebar-width)) / 3 * 2 / var(--image-count));
  @image-width: calc(calc(var(--window-width) - var(--sidebar-width)) / 3 * 2 / var(--image-count));

  .chat-message-item-image-multi {
    width: @image-width;
    height: @image-width;
    max-width: @max-image-width;
    max-height: @max-image-width;
  }

  .chat-message-item-image {
    max-width: calc(calc(1200px - var(--sidebar-width)) / 3 * 2);
  }
}

.chat-message-action-date {
  font-size: 12px;
  opacity: 0.2;
  white-space: nowrap;
  transition: all ease 0.6s;
  color: var(--black);
  text-align: right;
  width: 100%;
  box-sizing: border-box;
  padding-right: 10px;
  pointer-events: none;
  z-index: 1;
}

.chat-message-user > .chat-message-container > .chat-message-item {
  background-color: var(--second);

  &:hover {
    min-width: 0;
  }
}
</style>
