"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Session = {
  id: string;
  title: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
};

type SessionMember = {
  id: string;
  status: "registered" | "waitlist";
  payment_status: "unpaid" | "paid";
};

export default function SuccessPage() {
  const { id } = useParams();

  const [session, setSession] = useState<Session | null>(null);
  const [sm, setSm] = useState<SessionMember | null>(null);

  async function loadData() {
    const { data: sessionData } = await supabase
      .from("sessions")
      .select("*")
      .if (!id) return;
       eq("id", id)
      .maybeSingle()

    const { data: smData } = await supabase
      .from("session_members")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    setSession(sessionData);
    setSm(smData);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (!session || !sm) {
    return <p style={{ padding: 20 }}>載入中...</p>;
  }

  const isWaitlist = sm.status === "waitlist";
  const isPaid = sm.payment_status === "paid";

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>🎉 報名成功</h1>

      <h2>{session.title}</h2>

      <div style={{ lineHeight: 1.8, marginTop: 10 }}>
        📅 {session.booking_date} <br />
        🕒 {session.start_time} ~ {session.end_time} <br />
        💰 {session.price} 元 <br />
      </div>

      {/* 狀態 */}
      <div
        style={{
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
          background: isWaitlist ? "#fff3cd" : "#d4edda",
        }}
      >
        {isWaitlist ? "⏳ 目前為候補名單" : "✅ 已成功報名"}
      </div>

      {/* 付款區 */}
      <div style={{ marginTop: 20 }}>
        <h3>💰 付款資訊</h3>

        {isPaid ? (
          <div style={{ color: "green" }}>✔ 已付款完成</div>
        ) : (
          <>
            <div>請完成付款後保留名額：</div>

            <div style={{ marginTop: 10 }}>
              🏦 轉帳帳號：123-456-789（示意） <br />
              💳 金額：{session.price} 元
            </div>

            <div
              style={{
                marginTop: 10,
                padding: 10,
                background: "#f5f5f5",
                borderRadius: 8,
              }}
            >
              ⚠️ 請備註姓名 + 場次
            </div>
          </>
        )}
      </div>

      {/* LINE 提示 */}
      <div
        style={{
          marginTop: 30,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        📢 請加入 LINE 群組以確認名單與臨時通知
      </div>

      <button
        style={{
          marginTop: 20,
          width: "100%",
          padding: 12,
          borderRadius: 8,
          background: "#06c755",
          color: "white",
          border: "none",
        }}
      >
        加入 LINE 群組
      </button>
    </div>
  );
}