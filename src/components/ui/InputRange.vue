<template>
  <div :class="['input-range', className]">
    {{ title || value }}
    <input type="range" :title="title" :value="value" :min="min" :max="max" :step="step" @input="handleInputChange" />
  </div>
</template>

<script setup>
const props = defineProps({
  onChange: Function,
  title: String,
  value: Number,
  className: String,
  min: String,
  max: String,
  step: String,
});

const emit = defineEmits(["update:value"]);

const handleInputChange = (event) => {
  const newValue = Number(event.target.value);
  emit("update:value", newValue);
  if (props.onChange) {
    props.onChange(event);
  }
};
</script>

<style scoped lang="less">
.input-range {
  border: var(--border-in-light);
  border-radius: 10px;
  padding: 5px 10px 5px 10px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  max-width: 40%;

  input[type="range"] {
    max-width: calc(100% - 34px);
  }
}
</style>
