import { supabase } from "./supabase";
import { sendLine } from "./line";

export async function notify(getld): {
  type: "booking" | "waitlist" | "payment" | "cancel";
  message: string;
  session_id?: string;
  member_id?: string;
  lineUserId?: string;
}) {
  const { type, message, session_id, member_id, lineUserId } = getld;

  // 1️⃣ 寫入通知表
  await supabase.from("notifications").insert([
    {
      type,
      message,
      session_id: session_id || null,
      member_id: member_id || null,
      read: false,
    },
  ]);

  // 2️⃣ LINE 推播（如果有 userId）
  if (lineUserId) {
    await sendLine(lineUserId, message);
  }
}