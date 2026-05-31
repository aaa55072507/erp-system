import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { session_id, member_id } = body;

    // ❌ 防呆（避免 undefined 打 RPC）
    if (!session_id || !member_id) {
      return NextResponse.json(
        {
          success: false,
          error: "missing session_id or member_id",
        },
        { status: 400 }
      );
    }

    // 🚀 呼叫 DB RPC（核心邏輯在資料庫）
    const { data, error } = await supabase.rpc("cancel_session", {
      p_session_id: session_id,
      p_member_id: member_id,
    });

    // ❌ RPC 錯誤處理
    if (error) {
      console.error("RPC cancel_session error:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    // ✅ 成功回傳結果
    return NextResponse.json({
      success: true,
      result: data,
    });
  } catch (err: any) {
    console.error("cancel-session API crash:", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || "unknown error",
      },
      { status: 500 }
    );
  }
}import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { sendLineMessage } from "@/lib/line";

export async function POST(req: Request) {
  try {
    const { session_id, member_id } = await req.json();

    if (!session_id || !member_id) {
      return NextResponse.json(
        { success: false, error: "missing params" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("join_session", {
      p_session_id: session_id,
      p_member_id: member_id,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 🧠 LINE 通知（非阻塞，不影響主流程）
    try {
      const type = data?.type;

      if (type === "confirmed") {
        await sendLineMessage(`🏐 新報名成功：session ${session_id}`);
      }

      if (type === "waitlist") {
        await sendLineMessage(`⏳ 新候補加入：session ${session_id}`);
      }
    } catch (e) {
      console.warn("LINE notify failed", e);
    }

    return NextResponse.json({
      success: true,
      result: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}