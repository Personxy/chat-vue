<template>
  <div class="chat">
    <div class="window-header">
      <div class="window-header-title">
        <div class="window-header-main-title">test</div>
        <div class="window-header-sub-title">共 2 条对话</div>
      </div>
    </div>
    <chatBody @bodyClick="bodyClick" />
    <chatInputPanel ref="inputPanel" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import chatBody from "@/components/chat/chatBody.vue";
import chatInputPanel from "@/components/chat/chatInputPanel.vue";
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
