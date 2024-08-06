<template>
  <div
    :class="['chat-input-action', { clickable: true }]"
    @click="handleClick"
    @mouseenter="updateWidth"
    :style="{
      '--full-width': `${width.full}px`,
    }">
    <slot name="icon"></slot>
    <div ref="textRef" class="text">
      <slot name="text"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { onMounted } from "vue";
const props = defineProps({
  onClick: {
    type: Function,
    default: () => {},
  },
});

const textRef = ref(null);
const width = ref({ full: 16, icon: 16 });

function getWidth(dom) {
  return dom.getBoundingClientRect().width;
}
const handleClick = () => {
  if (props.onClick) {
    props.onClick();
  }
};

function updateWidth() {
  if (!textRef.value) return;
  const textWidth = getWidth(textRef.value);
  width.value = {
    full: textWidth + 16,
    icon: 16,
  };
}
</script>

<style scoped lang="less">
.chat-input-action {
  margin-bottom: 10px;
  display: flex;
  border-radius: 20px;
  font-size: 12px;
  background-color: var(--white);
  color: var(--black);
  border: var(--border-in-light);
  padding: 4px 10px;
  animation: slide-in ease 0.3s;
  box-shadow: var(--card-shadow);
  transition: width ease 0.3s;
  align-items: center;
  height: 16px;
  overflow: hidden;
  width: 16px;
  cursor: pointer;
  box-sizing: content-box;
  &:hover {
    --delay: 0.2s;
    width: var(--full-width);
    transition-delay: var(--delay);

    .text {
      transition-delay: var(--delay);
      opacity: 1;
      transform: translate(0);
    }
  }
}

.icon {
  width: 16px;
}
.text {
  white-space: nowrap;
  padding-left: 5px;
  opacity: 0;
  transform: translateX(-5px);
  transition: all ease 0.3s;
  pointer-events: none;
}
.text,
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
