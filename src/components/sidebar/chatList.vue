<template>
  <div class="chat-list">
    <div
      class="chat-item"
      :class="route.path === '/chat' && chatStore.currentSessionIndex == index ? 'chat-item-selected' : ''"
      @click="itemClick(index)"
      v-for="(item, index) in chatStore.sessions"
      :key="item.id">
      <!-- <div class="chat-item-narrow">
        <div class="chat-item-avatar no-dark">
          <MaskAvatar avatar="{props.mask.avatar}" model="{props.mask.modelConfig.model}" />
        </div>
        <div class="chat-item-narrow-count"></div>
      </div> -->

      <div class="chat-item-title">{{ item.topic }}</div>
      <div class="chat-item-info">
        <div class="chat-item-count">{{ item.messages.length }} 条对话</div>
        <div class="chat-item-date">{{ new Date(item.lastUpdate).toLocaleString() }}</div>
      </div>

      <div class="chat-item-delete" @click.stop="deleteItem(index)">
        <deleteIcon />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useChatStore } from "@/stores/chat";
import deleteIcon from "@/icons/deleteIcon.vue";
import { useRoute, useRouter } from "vue-router";
const chatStore = useChatStore();
const route = useRoute();
const router = useRouter();

const deleteItem = (index) => {
  chatStore.deleteSession(index);
};
const itemClick = (index) => {
  router.push({ path: "/chat" });
  chatStore.selectSession(index);
};
</script>

<style scoped lang="less">
.chat-item {
  padding: 10px 14px;
  background-color: var(--white);
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: var(--card-shadow);
  transition: background-color 0.3s ease;
  cursor: pointer;
  user-select: none;
  border: 2px solid transparent;
  position: relative;
  content-visibility: auto;
}

.chat-item:hover {
  background-color: var(--hover-color);
}

.chat-item-selected {
  border-color: var(--primary);
}

.chat-item-title {
  font-size: 14px;
  font-weight: bolder;
  display: block;
  width: calc(100% - 15px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  animation: slide-in ease 0.3s;
}

.chat-item-delete {
  position: absolute;
  top: 4px;
  right: 0;
  transition: all ease 0.3s;
  opacity: 0;
  cursor: pointer;
}

.chat-item:hover > .chat-item-delete {
  opacity: 0.5;
  transform: translateX(-4px);
}

.chat-item:hover > .chat-item-delete:hover {
  opacity: 1;
}

.chat-item-info {
  display: flex;
  justify-content: space-between;
  color: rgb(166, 166, 166);
  font-size: 12px;
  margin-top: 8px;
  animation: slide-in ease 0.3s;
}

.chat-item-count,
.chat-item-date {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
