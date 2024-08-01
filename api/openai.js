import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
console.log(openaiApiKey, "openaiApiKey");
// export const config = {
//   runtime: "edge",
// };
//vercel 必须设置为强制使用stream流才能用stream
export const config = {
  supportsResponseStreaming: true,
};

export default (req, res) => {
  // const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10 * 60 * 1000);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    fetch("https://xa.blackbox.red/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(req.body),
      signal: controller.signal,
      redirect: "manual",
      // @ts-ignore
      duplex: "half",
    }).then((response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const push = () => {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              res.write("event: end\n");
              res.end();
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            console.log(chunk, "chunk");
            res.write(chunk);
            push(); // Read the next chunk
          })
          .catch((err) => {
            console.error("Stream reading error:", err);
            res.end();
          });
      };

      push();

      req.on("close", () => {
        controller.abort();
        res.end();
      });
    });
  } catch (error) {
    console.error(error);
    res.status(error.response ? error.response.status : 500).json({ error: error.message });
  } finally {
    clearTimeout(timeoutId);
  }
};
