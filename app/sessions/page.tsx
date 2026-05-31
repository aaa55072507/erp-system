"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

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

    setSessions(data || []);

    // 人數統計
    const newCounts: Record<string, number> = {};

    for (const s of data || []) {
      const { count } = await supabase
        .from("session_members")
        .select("*", { count: "exact", head: true })
        .eq("session_id", s.id);

      newCounts[s.id] = count || 0;
    }

    setCounts(newCounts);
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1>🏐 場次管理</h1>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={loadSessions}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            🔄 重新整理
          </button>

          <Link href="/sessions/new">
            <button
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              ➕ 新增場次
            </button>
          </Link>
        </div>
      </div>

      {loading && <p>載入中...</p>}

      {!loading && sessions.length === 0 && (
        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          尚未建立場次
        </div>
      )}

      {/* Sessions list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sessions.map((s) => {
          const count = counts[s.id] || 0;

          return (
            <div
              key={s.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
                background: "#fff",
              }}
            >
              {/* Title */}
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                🏐 {s.title}
              </div>

              {/* Date & time */}
              <div style={{ marginTop: 6 }}>
                📅 {s.booking_date}
              </div>

              <div>
                🕒 {s.start_time} ~ {s.end_time}
              </div>

              {/* People */}
              <div style={{ marginTop: 6 }}>
                👥 {count} / {s.max_players}
              </div>

              {/* Price */}
              <div style={{ marginTop: 6 }}>
                💰 NT$ {s.price}
              </div>

              {/* Status */}
              <div style={{ marginTop: 6 }}>
                📌 {getStatus(s.status, count, s.max_players)}
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <Link href={`/sessions/${s.id}`}>
                  <button
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    ✏ 編輯
                  </button>
                </Link>

                <Link href={`/sessions/${s.id}/members`}>
                  <button
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    👥 名單
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}