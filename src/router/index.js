import { createRouter, createWebHistory } from "vue-router";
import { userAccess } from "@/stores/access";
import layout from "@/views/layout.vue";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/app/chat",
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("../views/authPage.vue"),
    },
    {
      path: "/app",
      component: layout,
      redirect: "/app/chat",
      name: "app",
      children: [
        {
          path: "/app/chat",
          name: "chat",
          component: () => import("../views/chat.vue"),
        },
        {
          path: "/app/setting",
          name: "setting",
          component: () => import("../views/setting.vue"),
        },
      ],
    },
  ],
});
router.beforeEach(async (to, from) => {
  const accessStore = userAccess();

  const isAuthenticated = accessStore.isAuth();
  console.log(isAuthenticated, "isAuthenticated");
  if (
    // 检查用户是否已登录
    !isAuthenticated &&
    // ❗️ 避免无限重定向
    to.name !== "auth"
  ) {
    return { name: "auth" };
  }
});
export default router;
