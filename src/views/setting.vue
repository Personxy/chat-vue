<template>
  <div class="window-header">
    <div class="window-header-title">
      <div class="window-header-main-title">设置</div>
      <div class="window-header-sub-title">所有设置选项</div>
    </div>
    <div class="window-actions">
      <div class="window-action-button">
        <IconButton @click="toChat" bordered>
          <template #icon>
            <close />
          </template>
        </IconButton>
      </div>
    </div>
  </div>
  <div class="settings">
    <List>
      <!-- <ListItem title={Locale.Settings.Avatar}>
            <Popover2
              onClose={() =>{setShowEmojiPicker(val=>val=false)} }
              content={
                <AvatarPicker
                  onEmojiClick={(avatar: string) => {
                    updateConfig((config) => (config.avatar = avatar));
                    setShowEmojiPicker(false);
                  }}
                />
              }
              open={showEmojiPicker}
            >
                <div
                className={styles.avatar}
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                }}
              >
                <Avatar avatar={config.avatar} />
              </div>
            </Popover2>
          
          </ListItem> -->

      <ListItem title="发送键">
        <Select :value="config.submitKey" @change="changeSubmitKey">
          <option :value="item" v-for="(item, index) in SubmitKey" :key="index">
            {{ item }}
          </option>
        </Select>
      </ListItem>

      <ListItem title="主题">
        <Select :value="config.theme" @change="changeTheme">
          <option v-for="(item, index) in Theme" :key="index" :value="item">
            {{ item }}
          </option>
        </Select>
      </ListItem>

      <!-- <ListItem title={Locale.Settings.Lang.Name}>
            <Select
              value={getLang()}
              onChange={(e) => {
                changeLang(e.target.value as any);
              }}
            >
              {AllLangs.map((lang) => (
                <option value={lang} key={lang}>
                  {ALL_LANG_OPTIONS[lang]}
                </option>
              ))}
            </Select>
          </ListItem>

          <ListItem
            title={Locale.Settings.FontSize.Title}
            subTitle={Locale.Settings.FontSize.SubTitle}
          >
            <InputRange
              title={`${config.fontSize ?? 14}px`}
              value={config.fontSize}
              min="12"
              max="40"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.fontSize = Number.parseInt(e.currentTarget.value)),
                )
              }
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.AutoGenerateTitle.Title}
            subTitle={Locale.Settings.AutoGenerateTitle.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.enableAutoGenerateTitle}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.enableAutoGenerateTitle = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>

          <ListItem
            title={Locale.Settings.SendPreviewBubble.Title}
            subTitle={Locale.Settings.SendPreviewBubble.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.sendPreviewBubble}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.sendPreviewBubble = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>
        </List>

        <SyncItems />

        <List>
          <ListItem
            title={Locale.Settings.Mask.Splash.Title}
            subTitle={Locale.Settings.Mask.Splash.SubTitle}
          >
            <input
              type="checkbox"
              checked={!config.dontShowMaskSplashScreen}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.dontShowMaskSplashScreen =
                      !e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>

          <ListItem
            title={Locale.Settings.Mask.Builtin.Title}
            subTitle={Locale.Settings.Mask.Builtin.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.hideBuiltinMasks}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.hideBuiltinMasks = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>
        </List>

        <List>
          <ListItem
            title={Locale.Settings.Prompt.Disable.Title}
            subTitle={Locale.Settings.Prompt.Disable.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.disablePromptHint}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.disablePromptHint = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>

          <ListItem
            title={Locale.Settings.Prompt.List}
            subTitle={Locale.Settings.Prompt.ListCount(
              builtinCount,
              customCount,
            )}
          >
            <IconButton
              icon={<EditIcon />}
              text={Locale.Settings.Prompt.Edit}
              onClick={() => setShowPromptModal(true)}
            />
          </ListItem>
        </List>

        <List id={SlotID.CustomModel}>
          {showAccessCode && (
            <ListItem
              title={Locale.Settings.Access.AccessCode.Title}
              subTitle={Locale.Settings.Access.AccessCode.SubTitle}
            >
              <PasswordInput
                value={accessStore.accessCode}
                type="text"
                placeholder={Locale.Settings.Access.AccessCode.Placeholder}
                onChange={(e) => {
                  accessStore.update(
                    (access) => (access.accessCode = e.currentTarget.value),
                  );
                }}
              />
            </ListItem>
          )}

          {!accessStore.hideUserApiKey && (
            <>
              {
                // Conditionally render the following ListItem based on clientConfig.isApp
                !clientConfig?.isApp && ( // only show if isApp is false
                  <ListItem
                    title={Locale.Settings.Access.CustomEndpoint.Title}
                    subTitle={Locale.Settings.Access.CustomEndpoint.SubTitle}
                  >
                    <input
                      type="checkbox"
                      checked={accessStore.useCustomConfig}
                      onChange={(e) =>
                        accessStore.update(
                          (access) =>
                            (access.useCustomConfig = e.currentTarget.checked),
                        )
                      }
                    ></input>
                  </ListItem>
                )
              }
              {accessStore.useCustomConfig && (
                <>
                  <ListItem
                    title={Locale.Settings.Access.Provider.Title}
                    subTitle={Locale.Settings.Access.Provider.SubTitle}
                  >
                    <Select
                      value={accessStore.provider}
                      onChange={(e) => {
                        accessStore.update(
                          (access) =>
                            (access.provider = e.target
                              .value as ServiceProvider),
                        );
                      }}
                    >
                      {Object.entries(ServiceProvider).map(([k, v]) => (
                        <option value={v} key={k}>
                          {k}
                        </option>
                      ))}
                    </Select>
                  </ListItem>

                  {accessStore.provider === ServiceProvider.OpenAI && (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.OpenAI.Endpoint.Title}
                        subTitle={
                          Locale.Settings.Access.OpenAI.Endpoint.SubTitle
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.openaiUrl}
                          placeholder={OPENAI_BASE_URL}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.openaiUrl = e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.OpenAI.ApiKey.Title}
                        subTitle={Locale.Settings.Access.OpenAI.ApiKey.SubTitle}
                      >
                        <PasswordInput
                          value={accessStore.openaiApiKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.OpenAI.ApiKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.openaiApiKey = e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                    </>
                  )}
                  {accessStore.provider === ServiceProvider.Azure && (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.Azure.Endpoint.Title}
                        subTitle={
                          Locale.Settings.Access.Azure.Endpoint.SubTitle +
                          Azure.ExampleEndpoint
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.azureUrl}
                          placeholder={Azure.ExampleEndpoint}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.azureUrl = e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Azure.ApiKey.Title}
                        subTitle={Locale.Settings.Access.Azure.ApiKey.SubTitle}
                      >
                        <PasswordInput
                          value={accessStore.azureApiKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.Azure.ApiKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.azureApiKey = e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Azure.ApiVerion.Title}
                        subTitle={
                          Locale.Settings.Access.Azure.ApiVerion.SubTitle
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.azureApiVersion}
                          placeholder="2023-08-01-preview"
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.azureApiVersion =
                                  e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                    </>
                  )}
                  {accessStore.provider === ServiceProvider.Google && (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.Google.Endpoint.Title}
                        subTitle={
                          Locale.Settings.Access.Google.Endpoint.SubTitle +
                          Google.ExampleEndpoint
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.googleUrl}
                          placeholder={Google.ExampleEndpoint}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.googleUrl = e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Google.ApiKey.Title}
                        subTitle={Locale.Settings.Access.Google.ApiKey.SubTitle}
                      >
                        <PasswordInput
                          value={accessStore.googleApiKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.Google.ApiKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.googleApiKey = e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Google.ApiVersion.Title}
                        subTitle={
                          Locale.Settings.Access.Google.ApiVersion.SubTitle
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.googleApiVersion}
                          placeholder="2023-08-01-preview"
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.googleApiVersion =
                                  e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                    </>
                  )}
                  {accessStore.provider === ServiceProvider.Anthropic && (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.Anthropic.Endpoint.Title}
                        subTitle={
                          Locale.Settings.Access.Anthropic.Endpoint.SubTitle +
                          Anthropic.ExampleEndpoint
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.anthropicUrl}
                          placeholder={Anthropic.ExampleEndpoint}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.anthropicUrl = e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Anthropic.ApiKey.Title}
                        subTitle={
                          Locale.Settings.Access.Anthropic.ApiKey.SubTitle
                        }
                      >
                        <PasswordInput
                          value={accessStore.anthropicApiKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.Anthropic.ApiKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.anthropicApiKey =
                                  e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Anthropic.ApiVerion.Title}
                        subTitle={
                          Locale.Settings.Access.Anthropic.ApiVerion.SubTitle
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.anthropicApiVersion}
                          placeholder={Anthropic.Vision}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.anthropicApiVersion =
                                  e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                    </>
                  )}
                  {accessStore.provider === ServiceProvider.Baidu && (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.Baidu.Endpoint.Title}
                        subTitle={
                          Locale.Settings.Access.Anthropic.Endpoint.SubTitle +
                          Baidu.ExampleEndpoint
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.baiduUrl}
                          placeholder={Baidu.ExampleEndpoint}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.baiduUrl = e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Baidu.ApiKey.Title}
                        subTitle={Locale.Settings.Access.Baidu.ApiKey.SubTitle}
                      >
                        <PasswordInput
                          value={accessStore.baiduApiKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.Baidu.ApiKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.baiduApiKey = e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Baidu.SecretKey.Title}
                        subTitle={
                          Locale.Settings.Access.Baidu.SecretKey.SubTitle
                        }
                      >
                        <PasswordInput
                          value={accessStore.baiduSecretKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.Baidu.SecretKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.baiduSecretKey = e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                    </>
                  )}

                  {accessStore.provider === ServiceProvider.ByteDance && (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.ByteDance.Endpoint.Title}
                        subTitle={
                          Locale.Settings.Access.ByteDance.Endpoint.SubTitle +
                          ByteDance.ExampleEndpoint
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.bytedanceUrl}
                          placeholder={ByteDance.ExampleEndpoint}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.bytedanceUrl = e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.ByteDance.ApiKey.Title}
                        subTitle={
                          Locale.Settings.Access.ByteDance.ApiKey.SubTitle
                        }
                      >
                        <PasswordInput
                          value={accessStore.bytedanceApiKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.ByteDance.ApiKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.bytedanceApiKey =
                                  e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                    </>
                  )}

                  {accessStore.provider === ServiceProvider.Alibaba && (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.Alibaba.Endpoint.Title}
                        subTitle={
                          Locale.Settings.Access.Alibaba.Endpoint.SubTitle +
                          Alibaba.ExampleEndpoint
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.alibabaUrl}
                          placeholder={Alibaba.ExampleEndpoint}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.alibabaUrl = e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Alibaba.ApiKey.Title}
                        subTitle={
                          Locale.Settings.Access.Alibaba.ApiKey.SubTitle
                        }
                      >
                        <PasswordInput
                          value={accessStore.alibabaApiKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.Alibaba.ApiKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.alibabaApiKey = e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {!shouldHideBalanceQuery && !clientConfig?.isApp ? (
            <ListItem
              title={Locale.Settings.Usage.Title}
              subTitle={
                showUsage
                  ? loadingUsage
                    ? Locale.Settings.Usage.IsChecking
                    : Locale.Settings.Usage.SubTitle(
                        usage?.used ?? "[?]",
                        usage?.subscription ?? "[?]",
                      )
                  : Locale.Settings.Usage.NoAccess
              }
            >
              {!showUsage || loadingUsage ? (
                <div />
              ) : (
                <IconButton
                  icon={<ResetIcon></ResetIcon>}
                  text={Locale.Settings.Usage.Check}
                  onClick={() => checkUsage(true)}
                />
              )}
            </ListItem>
          ) : null}

          <ListItem
            title={Locale.Settings.Access.CustomModel.Title}
            subTitle={Locale.Settings.Access.CustomModel.SubTitle}
          >
            <input
              type="text"
              value={config.customModels}
              placeholder="model1,model2,model3"
              onChange={(e) =>
                config.update(
                  (config) => (config.customModels = e.currentTarget.value),
                )
              }
            ></input>
          </ListItem>
        </List>

        <List>
          <ModelConfigList
            modelConfig={config.modelConfig}
            updateConfig={(updater) => {
              const modelConfig = { ...config.modelConfig };
              updater(modelConfig);
              config.update((config) => (config.modelConfig = modelConfig));
            }}
          />
        </List> -->
    </List>

    <List>
      <ListItem title="模型(model)">
        <Select :value="config.modelConfig.model" @change="(e) => (config.modelConfig.model = e.target.value)">
          <option v-for="(item, index) in openaiModelsList" :key="index">
            {{ item }}
          </option>
        </Select>
      </ListItem>
      <ListItem title="随机性 (temperature)" subTitle="与随机性类似，但不要和随机性一起更改">
        <InputRange  v-model:value="config.modelConfig.temperature" max="1" step="0.1" min="0"> </InputRange>
      </ListItem>
      <ListItem title="核采样 (top_p)" subTitle="值越大，回复越随机">
        <InputRange v-model:value="config.modelConfig.top_p" max="1" step="0.1" min="0" > </InputRange>
      </ListItem>
      <ListItem title="单次回复限制 (max_tokens)" subTitle="单次交互所用的最大 Token 数">
        <input
          type="number"
          min='1024'
          max='512000'
          v-model="config.modelConfig.max_tokens"
        ></input>
      </ListItem>
      <ListItem title="话题新鲜度 (presence_penalty)" subTitle="值越大，越有可能扩展到新话题">
        <InputRange v-model:value="config.modelConfig.presence_penalty" min="-2" max="2" step="0.1" > </InputRange>
      </ListItem>
      <ListItem title="频率惩罚度 (frequency_penalty)" subTitle="值越大，越有可能降低重复字词">
        <InputRange v-model:value="config.modelConfig.frequency_penalty"   min="-2" max="2" step="0.1" > </InputRange>
      </ListItem>
      <ListItem title="附带历史消息数" subTitle="每次请求携带的历史消息数">
        <InputRange v-model:value="config.modelConfig.historyMessageCount"  min="0"  max="64" step="1" > </InputRange>
      </ListItem>
      <ListItem title="附带历史消息数" subTitle="每次请求携带的历史消息数">
        <input
          type="number"
          min='500'
          max='4000'
          v-model="config.modelConfig.compressMessageLengthThreshold" 
        ></input>
      </ListItem>
    </List>
  </div>
</template>

<script setup>
import IconButton from "@/components/ui/IconButton.vue";
import close from "@/icons/close.vue";
import router from "@/router";
import List from "@/components/ui/List.vue";
import ListItem from "@/components/ui/ListItem.vue";
import Select from "@/components/ui/Select.vue";
import { useConfig, SubmitKey, Theme } from "@/stores/config";
import { openaiModels } from "@/utils/constants";
import InputRange from "@/components/ui/InputRange.vue";
const toChat = () => {
  router.push("/app/chat");
};
const config = useConfig();
const changeSubmitKey = (e) => {
  config.submitKey = e.target.value;
};
const changeTheme = (e) => {
  config.theme = e.target.value;
};
const openaiModelsList = ref(openaiModels);


onMounted(() => {});
</script>

<style lang="less">
@import "../assets/windows.less";
.settings {
  padding: 20px;
  overflow: auto;
}
</style>
