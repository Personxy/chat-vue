<template>
  <div class="selector" @click="onClose" v-if="modelValue">
    <div class="selector-content">
      <List>
        <ListItem
          v-for="(item, i) in items"
          :key="i"
          :title="item"
          :class="{ 'selector-item': true, selected: defaultSelectedValue === item }"
          @click="handleSelection(item)">
          <template v-if="defaultSelectedValue === item">
            <div style="height: 10px; width: 10px; background-color: var(--primary); border-radius: 10px"></div>
          </template>
        </ListItem>
      </List>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import List from "./List.vue";
import ListItem from "./ListItem.vue";

const props = defineProps({
  items: Array,
  defaultSelectedValue: null,
  onSelection: Function,

  multiple: Boolean,
});
const modelValue = defineModel();
const onClose = () => {
  modelValue.value = false;
};
const handleSelection = (value) => {
  if (props.onSelection) {
    props.onSelection(value);
  }
};
</script>

<style scoped lang="less">
.selector {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  box-sizing: content-box;
  &-content {
    .list {
      max-height: 90vh;
      overflow-x: hidden;
      overflow-y: auto;

      .list-item {
        cursor: pointer;
        background-color: var(--white);

        &:hover {
          filter: brightness(0.95);
        }

        &:active {
          filter: brightness(0.9);
        }
      }
    }
  }
}
</style>
