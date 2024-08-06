<template>
  <div :class="['list-item', className]" @click="onClick">
    <div class="list-header">
      <div v-if="icon" class="list-icon">
        <slot name="icon"></slot>
      </div>
      <div class="list-item-title">
        <div>{{ title }}</div>
        <div v-if="subTitle" class="list-item-sub-title">{{ subTitle }}</div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  subTitle: String,
  icon: Object,
  className: String,
  onClick: Function,
});
</script>

<style scoped lang="less">
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 40px;
  border-bottom: var(--border-in-light);
  padding: 10px 20px;
  animation: slide-in ease 0.6s;
  box-sizing: content-box;
  .list-header {
    display: flex;
    align-items: center;

    .list-icon {
      margin-right: 10px;
    }

    .list-item-title {
      font-size: 14px;
      font-weight: bolder;
    }

    .list-item-sub-title {
      font-size: 12px;
      font-weight: normal;
    }
  }
}
</style>
