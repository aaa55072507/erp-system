import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const event = body.events?.[0];

    if (!event) {
      return NextResponse.json({ ok: true });
    }

    const userId = event.source.userId;

    if (!userId) {
      return NextResponse.json({ ok: true });
    }

    // 🔥 自動建立或更新 member
    await supabase.from("members").upsert({
      line_user_id: userId,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e }, { status: 500 });
  }
}