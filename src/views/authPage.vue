<script setup>
import BotIcon from "../icons/botIcon.vue";
import { userAccess } from "../stores/access.js";
import { ref } from "vue";
import IconButton from "@/components/ui/IconButton.vue";
import { useRoute, useRouter } from "vue-router";
const accessStore = userAccess();
accessStore.resetCode();
const accessCode = ref(accessStore.accessCode);
const router = useRouter();
const gochat = () => {
  router.push({ name: "chat" });
};
const onConfirm = () => {
  if (accessStore.accessCode === import.meta.env.VITE_PASSWORD) {
    gochat();
  } else {
    ElMessage({
      message: "密码错误",
      type: "warning",
    });
  }
};
const updateAccessCode = () => {
  accessStore.setAccessCode(accessCode.value);
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-logo">
      <BotIcon />
    </div>

    <div class="auth-title">需要密码</div>
    <div class="auth-tips">管理员开启了密码验证，请在下方填入访问码</div>

    <input
      class="auth-input"
      type="password"
      placeholder="在此处填写访问码"
      @input="updateAccessCode"
      v-if="accessStore.needPassword"
      v-model="accessCode" />

    <!-- <div>
            <div class="auth-tips">{Locale.Auth.SubTips}</div>
          <input
            class="auth-input"
            type="password"
            placeholder={Locale.Settings.Access.OpenAI.ApiKey.Placeholder}
            value={accessStore.openaiApiKey}
            onChange={(e) => {
              accessStore.update(
                (access) => (access.openaiApiKey = e.currentTarget.value),
              );
            }}
          />
          </div>
           -->

    <div class="auth-actions">
      <el-button type="primary" @click="onConfirm">确认</el-button>
      <!-- <IconButton text="稍后再说" :onClick="gochat" /> -->
    </div>
  </div>
</template>

<style scoped lang="less">
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  flex-direction: column;

  .auth-logo {
    transform: scale(1.4);
  }

  .auth-title {
    font-size: 24px;
    font-weight: bold;
    line-height: 2;
  }

  .auth-tips {
    font-size: 14px;
  }

  .auth-input {
    margin: 3vh 0;
  }

  .auth-actions {
    display: flex;
    justify-content: center;
    flex-direction: column;

    button:not(:last-child) {
      margin-bottom: 10px;
    }
  }
}
</style>
