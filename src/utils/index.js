export function getMessageImages(message) {
  if (typeof message.content === "string") {
    return [];
  }
  const urls = [];
  for (const c of message.content) {
    if (c.type === "image_url") {
      urls.push(c.image_url?.url ?? "");
    }
  }
  return urls;
}
export function getMessageTextContent(message) {
  if (typeof message.content === "string") {
    return message.content;
  }
  for (const c of message.content) {
    if (c.type === "text") {
      return c.text ?? "";
    }
  }
  return "";
}
export function isVisionModel(model) {
  // Note: This is a better way using the TypeScript feature instead of `&&` or `||` (ts v5.5.0-dev.20240314 I've been using)

  const visionKeywords = ["vision", "claude-3", "gemini-1.5-pro", "gemini-1.5-flash", "gpt-4o"];
  const isGpt4Turbo = model.includes("gpt-4-turbo") && !model.includes("preview");

  return visionKeywords.some((keyword) => model.includes(keyword)) || isGpt4Turbo;
}

//去除不必要的标点符号和引号
export function trimTopic(topic) {
  return topic.replace(/^["“”*]+|["“”*]+$/g, "").replace(/[，。！？”“"、,.!?*]*$/, "");
}

/**
 * 将传入的对象或字符串格式化为一个易读的 JSON 字符串。
 *
 * @param {any} msg - 传入的对象或字符串。
 * @returns {string} 格式化后的 JSON 字符串，或者原字符串如果已经是 JSON 格式。
 */
export function prettyObject(msg) {
  // 保存原始输入的对象
  const obj = msg;

  // 如果 msg 不是字符串，将其转换为格式化的 JSON 字符串
  if (typeof msg !== "string") {
    msg = JSON.stringify(msg, null, "  "); // 使用缩进2个空格进行格式化
  }

  // 如果 msg 是空对象，返回其字符串表示形式
  if (msg === "{}") {
    return obj.toString();
  }

  // 如果 msg 字符串已经是以 "```json" 开头，直接返回原字符串
  if (msg.startsWith("```json")) {
    return msg;
  }

  // 返回格式化后的 JSON 字符串，包含代码块标记
  return ["```json", msg, "```"].join("\n");
}
