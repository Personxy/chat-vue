<template>
  <div :class="classes">
    <select :class="['select-with-icon-select']" v-bind="$attrs">
      <slot></slot>
    </select>
    <DownIcon class="select-with-icon-icon" />
  </div>
</template>

<script setup>
import DownIcon from "@/icons/down.vue";

const props = defineProps({
  className: String,
});

const classes = computed(() => ["select-with-icon", props.className]);
</script>

<style scoped lang="less">
.select-with-icon {
  position: relative;
  max-width: fit-content;

  .select-with-icon-select {
    height: 100%;
    border: var(--border-in-light);
    padding: 10px 35px 10px 10px;
    border-radius: 10px;
    appearance: none;
    cursor: pointer;
    background-color: var(--white);
    color: var(--black);
    text-align: center;
  }

  .select-with-icon-icon {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    pointer-events: none;
  }
}
</style>
