<template>
  <button
    :class="buttonClass"
    @click="onClick"
    :title="title"
    :disabled="disabled"
    role="button"
    :tabindex="tabIndex"
    :autofocus="autoFocus">
    <div v-if="icon" :class="iconClass">
      <slot name="icon"></slot>
    </div>
    <div v-if="text" class="icon-button-text">{{ text }}</div>
  </button>
</template>

<script>
export default {
  name: "IconButton",
  props: {
    onClick: {
      type: Function,
      default: null,
    },
    icon: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: "",
    },
    bordered: {
      type: Boolean,
      default: false,
    },
    shadow: {
      type: Boolean,
      default: false,
    },
    className: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    tabIndex: {
      type: Number,
      default: null,
    },
    autoFocus: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    buttonClass() {
      return [
        "icon-button",
        { border: this.bordered },
        { shadow: this.shadow },
        this.className,
        "clickable",
        this.type,
      ];
    },
    iconClass() {
      return ["icon-button-icon", { "no-dark": this.type === "primary" }];
    },
  },
};
</script>

<style lang="less">
.icon-button {
  background-color: var(--white);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  user-select: none;
  outline: none;
  border: none;
  color: var(--black);

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &.primary {
    background-color: var(--primary);
    color: white;

    path {
      fill: white !important;
    }
  }

  &.danger {
    color: fade(red, 80%);
    border-color: fade(red, 50%);
    background-color: fade(red, 95%);

    &:hover {
      border-color: red;
      background-color: fade(red, 90%);
    }

    path {
      fill: red !important;
    }
  }

  &:hover,
  &:focus {
    border-color: var(--primary);
  }
}

.shadow {
  box-shadow: var(--card-shadow);
}

.border {
  border: var(--border-in-light);
}

.icon-button-icon {
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media only screen and (max-width: 600px) {
  .icon-button {
    padding: 16px;
  }
}

.icon-button-text {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:not(:first-child) {
    margin-left: 5px;
  }
}
</style>
