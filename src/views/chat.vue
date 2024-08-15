<template>
  <div class="chat">
    <div class="window-header">
      <div class="window-header-title">
        <div class="window-header-main-title">{{ currentSession.topic }}</div>
        <div class="window-header-sub-title">共{{ currentSession.messages.length }} 条对话</div>
      </div>
    </div>
    <chatBody @bodyClick="bodyClick" />
    <chatInputPanel ref="inputPanel" />
  </div>
</template>

<script setup>
import chatBody from "@/components/chat/chatBody.vue";
import chatInputPanel from "@/components/chat/chatInputPanel.vue";
import { useChatStore } from "@/stores/chat";

const chatStore = useChatStore();
if (chatStore.sessions.length === 0) {
  chatStore.init();
}
const currentSession = computed(() => chatStore.currentSession);
const bodyClick = () => {};
</script>

<style scoped lang="less">
@import "../assets/windows.less";

.chat {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
}
</style>
