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
    </div>
    <div class="window-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
</script>

<style scoped lang="less">
@import "../assets/global.less";
@import "../assets/layout.less";
</style>
