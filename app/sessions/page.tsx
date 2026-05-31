"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Session = {
  id: string;
  title: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  max_players: number;
  status: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  async function loadSessions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("booking_date", { ascending: true });

    if (error) {
      console.error(error);
      alert("讀取失敗");
      setLoading(false);
      return;
    }

    const list = data || [];
    setSessions(list);

    // 🔥 改成並行查詢（修 performance）
    const results = await Promise.all(
      list.map(async (s) => {
        const { count } = await supabase
          .from("session_members")
          .select("*", { count: "exact", head: true })
          .eq("session_id", s.id);

        return { id: s.id, count: count || 0 };
      })
    );

    const map: Record<string, number> = {};
    results.forEach((r) => {
      map[r.id] = r.count;
    });

    setCounts(map);
    setLoading(false);
  }

  useEffect(() => {
    loadSessions();
  }, []);

  function getStatus(status: string, count: number, max: number) {
    if (status === "cancelled") return "⚫ 已取消";
    if (status === "completed") return "✅ 已完成";
    if (count >= max) return "🔴 滿團";
    if (count >= max * 0.7) return "🟡 即將滿";
    return "🟢 開放報名";
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>🏐 場次管理</h1>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadSessions}>🔄 重新整理</button>

          <Link href="/sessions/new">
            <button>➕ 新增場次</button>
          </Link>
        </div>
      </div>

      {loading && <p>載入中...</p>}

      {!loading && sessions.length === 0 && (
        <div style={{ padding: 20 }}>尚未建立場次</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sessions.map((s) => {
          const count = counts[s.id] || 0;

          return (
            <div key={s.id} style={{ border: "1px solid #ddd", padding: 16 }}>
              <div style={{ fontSize: 18 }}>🏐 {s.title}</div>

              <div>📅 {s.booking_date}</div>
              <div>🕒 {s.start_time} ~ {s.end_time}</div>

              <div>👥 {count} / {s.max_players}</div>
              <div>💰 NT$ {s.price}</div>

              <div>
                📌 {getStatus(s.status, count, s.max_players)}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Link href={`/sessions/${s.id}`}>
                  <button>✏ 編輯</button>
                </Link>

                <Link href={`/sessions/${s.id}/members`}>
                  <button>👥 名單</button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}