import axios from "axios";
import OpenAI from "openai";
const openaiApiKey = "sk-dkYkojVEJL80d33aF94518A39c944dD887A20b08A6883282";
const openai = new OpenAI({
  //gptsapi 会帮我们做openai的请求转发
  baseURL: "https://api.xiaoai.plus/v1",
  apiKey: `Bearer ${openaiApiKey}`,
});
export default async (req, res) => {
  // const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10 * 60 * 1000);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log(openaiApiKey, "openaiApiKey");
    const response = await axios.post("https://api.xiaoai.plus/v1/chat/completions", req.body, {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
        signal: controller.signal,
        "Cache-Control": "no-store",
        redirect: "manual",
        // @ts-ignore
        duplex: "half",
      },
    });
    res.status(200).json(response.data);
    console.log(response.data, "response.data");
    // const { method } = req;

    // switch (method) {
    //   case "POST":
    //     if (req.query.endpoint === "chat") {
    //       // Handle POST to /api/generate?endpoint=chat
    //       const content = req.body.message;
    //       chatHistory.push({ role: "user", content: content });
    //       res.status(200).json({ success: true });
    //     } else if (req.query.endpoint === "reset") {
    //       // Handle POST to /api/generate?endpoint=reset
    //       chatHistory = [{ role: "system", content: "You are a helpful assistant." }];
    //       res.status(200).json({ success: true });
    //     } else {
    //       res.status(404).json({ error: "Not Found" });
    //     }
    //     break;
    //   case "GET":
    //     if (req.query.endpoint === "history") {
    //       res.status(200).json(chatHistory);
    //     } else if (req.query.endpoint === "stream") {
    //       // Set headers for Server-Sent Events
    //       res.setHeader("Content-Type", "text/event-stream");
    //       res.setHeader("Cache-Control", "no-cache");
    //       res.setHeader("Connection", "keep-alive");

    //       try {
    //         const stream = await openai.beta.chat.completions.stream({
    //           model: "gpt-3.5-turbo",
    //           messages: chatHistory,
    //           stream: true,
    //         });

    //         for await (const chunk of stream) {
    //           const message = chunk.choices[0]?.delta?.content || "";
    //           res.write(`data: ${JSON.stringify(message)}\n\n`);
    //         }

    //         // After the stream ends, get the final chat completion
    //         const chatCompletion = await stream.finalChatCompletion();
    //       } catch (error) {
    //         res.write("event: error\ndata: " + JSON.stringify({ message: "Stream encountered an error" }) + "\n\n");
    //       }

    //       // When the client closes the connection, we stop the stream
    //       return new Promise((resolve) => {
    //         req.on("close", () => {
    //           resolve();
    //         });
    //       });
    //     } else {
    //       res.status(404).json({ error: "Not Found" });
    //     }
    //     break;
    //   default:
    //     res.setHeader("Allow", ["GET", "POST"]);
    //     res.status(405).end(`Method ${method} Not Allowed`);
    // }
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({ error: error.message });
  } finally {
    clearTimeout(timeoutId);
  }
};
