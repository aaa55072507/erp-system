"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Session = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  price: number;
  max_players: number;
  status: string;
};

export default function SessionPage({
  params,
}: {
  params: any;
}) {
  // 🔥 統一修正 ParamValue / string[]
  const rawId = params?.id;

  const sessionId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : String(rawId ?? "");

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  async function loadSession() {
    if (!sessionId) return;

    const { data } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    setSession(data || null);
  }

  async function loadCount() {
    if (!sessionId) return;

    const { count } = await supabase
      .from("session_members")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    setCount(count || 0);
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([loadSession(), loadCount()]);
      setLoading(false);
    }

    init();
  }, [sessionId]);

  async function joinSession() {
    const memberId = "demo-user";

    if (!sessionId) {
      alert("場次不存在");
      return;
    }

    const { error } = await supabase.from("session_members").insert({
      session_id: String(sessionId), // 🔥 強制 string（關鍵）
      member_id: memberId,
      status: "confirmed",
    });

    if (error) {
      alert("報名失敗：" + error.message);
      return;
    }

    alert("報名成功");
    loadCount();
  }

  if (loading) return <div style={{ padding: 20 }}>載入中...</div>;

  if (!session) return <div style={{ padding: 20 }}>找不到場次</div>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>{session.title}</h2>

      <div>🕒 {session.start_time} ~ {session.end_time}</div>
      <div>💰 ${session.price}</div>
      <div>👥 {count} / {session.max_players}</div>

      <button
        onClick={joinSession}
        style={{
          marginTop: 20,
          padding: 12,
          width: "100%",
          background: "#000",
          color: "#fff",
          borderRadius: 8,
          border: "none",
        }}
      >
        一鍵報名
      </button>
    </div>
  );
}