<script setup>
import { userAccess } from "@/stores/access.js";
import { onMounted } from "vue";
import { useConfig } from "@/stores/config";
const accessStore = userAccess();
const appConfig = useConfig();
onMounted(() => {
  accessStore.init();
  appConfig.init();
});

const updateTheme = () => {
  document.documentElement.classList.remove("light", "dark");

  if (appConfig.theme === "dark") {
    document.documentElement.className = "dark";
  } else if (appConfig.theme === "light") {
    document.documentElement.className = "light";
  }

  // const metaDescriptionDark = document.querySelector('meta[name="theme-color"][media*="dark"]');
  // const metaDescriptionLight = document.querySelector('meta[name="theme-color"][media*="light"]');

  // if (appConfig.theme === "auto") {
  //   metaDescriptionDark?.setAttribute("content", "#151515");
  //   metaDescriptionLight?.setAttribute("content", "#fafafa");
  // } else {
  //   const themeColor = getComputedStyle(document.documentElement).getPropertyValue("--theme-color");
  //   metaDescriptionDark?.setAttribute("content", themeColor);
  //   metaDescriptionLight?.setAttribute("content", themeColor);
  // }
  console.log(2);
};
watch(() => appConfig.theme, updateTheme, { immediate: true });
</script>

<template>
  <div class="app">
    <RouterView />
  </div>
</template>

<style scoped lang="less"></style>
