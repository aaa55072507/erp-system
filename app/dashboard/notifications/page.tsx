"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Notification = {
  id: string;
  type: "booking" | "waitlist" | "payment";
  message: string;
  read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "booking" | "waitlist" | "payment">("all");

  async function loadData() {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("載入失敗：" + error.message);
      return;
    }

    setNotifications(data || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      alert("更新失敗：" + error.message);
      return;
    }

    loadData();
  }

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>🔔 通知中心</h1>

      {/* 統計 */}
      <div style={{ marginBottom: 20 }}>
        📌 未讀：{unreadCount} 則
      </div>

      {/* 篩選 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "booking", "waitlist", "payment"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              background: filter === t ? "#333" : "#eee",
              color: filter === t ? "#fff" : "#000",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((n) => (
          <div
            key={n.id}
            style={{
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 8,
              background: n.read ? "#f8f8f8" : "#fff",
            }}
          >
            {/* 類型 */}
            <div style={{ fontSize: 12, opacity: 0.6 }}>
              {n.type.toUpperCase()}
            </div>

            {/* 訊息 */}
            <div style={{ marginTop: 4 }}>{n.message}</div>

            {/* 時間 */}
            <div style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>
              {new Date(n.created_at).toLocaleString()}
            </div>

            {/* 按鈕 */}
            {!n.read && (
              <button
                onClick={() => markAsRead(n.id)}
                style={{
                  marginTop: 8,
                  padding: "6px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                標記已讀
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}