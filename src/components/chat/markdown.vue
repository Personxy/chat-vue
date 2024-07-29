<template>
  <div
    class="markdown-body"
    :style="{ fontSize: fontSize + 'px' }"
    @contextmenu="$emit('contextmenu')"
    @dblclick.capture="$emit('dblclickcapture')"
    dir="auto">
    <img src="@/icons/loading.svg" style="width: 16px; height: 16px" v-if="loading" />
    <v-md-preview v-else :text="escapedContent" />
  </div>
</template>

<script>
import { ref, computed } from "vue";
import VMdPreview from "@kangc/v-md-editor/lib/preview";
import "@kangc/v-md-editor/lib/style/preview.css";
import githubTheme from "@kangc/v-md-editor/lib/theme/github.js";
import "@kangc/v-md-editor/lib/theme/style/github.css";
import createKatexPlugin from "@kangc/v-md-editor/lib/plugins/katex/cdn";
import createMermaidPlugin from "@kangc/v-md-editor/lib/plugins/mermaid/cdn";
import createHighlightLinesPlugin from "@kangc/v-md-editor/lib/plugins/highlight-lines/index";
import createCopyCodePlugin from "@kangc/v-md-editor/lib/plugins/copy-code/index";
import hljs from "highlight.js";
VMdPreview.use(githubTheme, {
  Hljs: hljs,
});
// .use(createKatexPlugin())
// .use(createMermaidPlugin())
// .use(createHighlightLinesPlugin())
// .use(createCopyCodePlugin());

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
    };
  },
};
</script>
