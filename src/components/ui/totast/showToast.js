import { createApp, h } from "vue";
import Toast from "./Toast.vue";

export function showToast(content, action, delay = 20000) {
  const div = document.createElement("div");
  div.className = "show";
  document.body.appendChild(div);

  const app = createApp({
    render() {
      return h(Toast, {
        content,
        action,
        onClose: () => {
          div.classList.add("hide");
          setTimeout(() => {
            app.unmount();
            div.remove();
          }, 300);
        },
      });
    },
  });

  app.mount(div);

  setTimeout(() => {
    app.unmount();
    div.remove();
  }, delay);
}
