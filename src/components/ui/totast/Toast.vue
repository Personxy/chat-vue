<template>
  <div class="toast-container">
    <div class="toast-content">
      <span>{{ content }}</span>
      <button v-if="action" @click="handleAction" class="toast-action">
        {{ action.text }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  content: String,
  action: Object,
  onClose: Function,
});

const emit = defineEmits(["close"]);

const handleAction = () => {
  props.action?.onClick?.();
  emit("close");
};
</script>

<style scoped lang="less">
.toast-container {
  position: fixed;
  bottom: 5vh;
  left: 0;
  width: 100vw;
  display: flex;
  justify-content: center;
  pointer-events: none;

  .toast-content {
    max-width: 80vw;
    word-break: break-all;
    font-size: 14px;
    background-color: var(--white);
    box-shadow: var(--card-shadow);
    border: var(--border-in-light);
    color: var(--black);
    padding: 10px 20px;
    border-radius: 50px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    pointer-events: all;

    .toast-action {
      padding-left: 20px;
      color: var(--primary);
      opacity: 0.8;
      border: 0;
      background: none;
      cursor: pointer;
      font-family: inherit;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
