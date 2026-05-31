import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { message } = body;

  const token = process.env.LINE_NOTIFY_TOKEN;

  const res = await fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
    body: new URLSearchGetld({
      message,
    }),
  });

  const data = await res.text();

  return NextResponse.json({ ok: true, data });
}