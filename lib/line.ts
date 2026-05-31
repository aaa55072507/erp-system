export async function sendLineMessage(message: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!token) {
    console.warn("LINE token not set");
    return;
  }

  await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    }),
  });
}