<template>
  <div class="container">
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title">YangChat</div>
        <div class="sidebar-sub-title">羊羊专用chat</div>
        <div class="sidebar-logo">
          <img src="@/icons/yanglogo.png" alt="" class="logo" />
        </div>
      </div>
      <div class="sidebar-body">
        <chatList />
      </div>
      <div class="sidebar-tail">
        <div class="sidebar-actions">
          <!-- <div  class="sidebar-action mobile">
            <IconButton
              icon={<DeleteIcon />}
          
            />
          </div> -->
          <div class="sidebar-action">
            <RouterLink to="/settings">
              <IconButton :shadow="true">
                <template #icon>
                  <Setting />
                </template>
              </IconButton>
            </RouterLink>
          </div>
          <div class="sidebar-action">
            <a target="_blank" rel="noopener noreferrer" :href="REPO_URL">
              <IconButton :shadow="true">
                <template #icon>
                  <Github />
                </template>
              </IconButton>
            </a>
          </div>
        </div>
        <div>
          <IconButton text="新的聊天" @click="newChat" :shadow="true">
            <template #icon> <Add /> </template>
          </IconButton>
        </div>
      </div>
    </div>
    <div class="window-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import chatList from "@/components/sidebar/chatList.vue";
import IconButton from "@/components/ui/IconButton.vue";
import Setting from "@/icons/setting.vue";
import Github from "@/icons/github.vue";
import Add from "@/icons/add.vue";
import { REPO_URL } from "@/utils/constants";
import { useChatStore } from "@/stores/chat";

const chatStore = useChatStore();
console.log("chatStore", chatStore);
const newChat = () => {
  chatStore.newSession();
};
</script>

<style scoped lang="less">
@import "../assets/global.less";
@import "../assets/layout.less";
.sidebar-tail {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
}
</style>
