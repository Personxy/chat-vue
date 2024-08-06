<template>
  <div
    class="markdown-body"
    :style="{ fontSize: fontSize + 'px' }"
    @contextmenu="$emit('contextmenu')"
    @dblclick.capture="$emit('dblclickcapture')"
    dir="auto">
    <img src="@/icons/loading.svg" style="width: 16px; height: 16px" v-if="loading" />
    <VMdPreview :text="escapedContent" @copy-code-success="handleCopyCodeSuccess" />
  </div>
</template>

<script>
import { ref, computed } from "vue";
import VMdPreview from "@kangc/v-md-editor/lib/preview";
import "@kangc/v-md-editor/lib/style/preview.css";
import githubTheme from "@kangc/v-md-editor/lib/theme/github.js";
import "@kangc/v-md-editor/lib/theme/style/github.css";
// highlightjs
import hljs from "highlight.js";
import Prism from "prismjs";
import createCopyCodePlugin from "@kangc/v-md-editor/lib/plugins/copy-code/index";
import vuepressTheme from "@kangc/v-md-editor/lib/theme/vuepress.js";
import "@kangc/v-md-editor/lib/theme/style/vuepress.css";
VMdPreview.use(vuepressTheme, {
  Prism,
  // Hljs: hljs,
});
export default {
  name: "MarkdownEditor",
  components: {
    VMdPreview,
  },
  props: {
    content: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    fontSize: {
      type: Number,
      default: 14,
    },
  },
  setup(props) {
    const markdownContent = ref(props.content);

    function escapeDollarNumber(text) {
      return text.replace(/\$(?=\d)/g, "\\$");
    }

    const handleCopyCodeSuccess = () => {
      console.log(1);
    };
    function escapeBrackets(text) {
      const pattern = /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g;
      return text.replace(pattern, (match, codeBlock, squareBracket, roundBracket) => {
        if (codeBlock) return codeBlock;
        if (squareBracket) return `$$${squareBracket}$$`;
        if (roundBracket) return `$${roundBracket}$`;
        return match;
      });
    }

    const escapedContent = computed(() => {
      return escapeBrackets(escapeDollarNumber(props.content));
    });

    return {
      markdownContent,
      escapedContent,
      handleCopyCodeSuccess,
    };
  },
};
</script>

<style lang="less">
.v-md-pre-wrapper {
  .v-md-copy-code-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
    z-index: 999;
  }
}
</style>
