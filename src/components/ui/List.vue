<template>
  <div :id="id" class="list">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  id: String,
});
</script>

<style scoped lang="less">
.list {
  border: var(--border-in-light);
  border-radius: 10px;
  box-shadow: var(--card-shadow);
  margin-bottom: 20px;
  animation: slide-in ease 0.3s;
  background: var(--white);
}

.list .list-item:last-child {
  border: 0;
}
</style>
