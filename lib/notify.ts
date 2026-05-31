import { supabase } from "./supabase";

type NotifyType = "booking" | "waitlist" | "payment";

export async function createNotification(params: {
  type: NotifyType;
  message: string;
  session_id?: string;
  member_id?: string;
}) {
  const { type, message, session_id, member_id } = params;

  await supabase.from("notifications").insert([
    {
      type,
      message,
      session_id: session_id || null,
      member_id: member_id || null,
      read: false,
    },
  ]);
}