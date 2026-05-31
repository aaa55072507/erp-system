import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, message } = await req.json();

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 500 });
  }

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    }),
  });

  const data = await res.text();

  return NextResponse.json({ ok: true, data });
}