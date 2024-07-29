<script setup>
import { userAccess } from "@/stores/access.js";
import { onMounted } from "vue";
const accessStore = userAccess();
onMounted(() => {
  accessStore.init();
});
</script>

<template>
  <div class="app">
    <RouterView />
  </div>
</template>

<style scoped lang="less"></style>
