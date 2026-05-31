"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function EditSessionPage() {
  const params = useParams();
  const router = useRouter();

  // ✅ 安全處理 id（避免 string[] / undefined）
  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id ?? null;

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [price, setPrice] = useState(0);
  const [minPlayers, setMinPlayers] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  async function loadSession() {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert("載入失敗：" + error.message);
      setLoading(false);
      return;
    }

    setTitle(data?.title || "");
    setBookingDate(data?.booking_date || "");
    setStartTime(data?.start_time || "");
    setEndTime(data?.end_time || "");
    setSessionType(data?.session_type || "");
    setPrice(data?.price || 0);
    setMinPlayers(data?.min_players || 0);
    setMaxPlayers(data?.max_players || 0);
    setStatus(data?.status || "");
    setNotes(data?.notes || "");

    setLoading(false);
  }

  useEffect(() => {
    if (id) loadSession();
  }, [id]);

  async function handleUpdate() {
    if (!id) {
      alert("ID 不存在");
      return;
    }

    const { error } = await supabase
      .from("sessions")
      .update({
        title,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        session_type: sessionType,
        price,
        min_players: minPlayers,
        max_players: maxPlayers,
        status,
        notes,
      })
      .eq("id", id);

    if (error) {
      alert("更新失敗：" + error.message);
      return;
    }

    alert("更新成功");
    router.push("/sessions");
  }

  if (loading) return <p>載入中...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <h1>編輯場次</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label>標題</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>日期</label>
        <input
          type="date"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
        />

        <label>開始時間</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <label>結束時間</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <label>類型</label>
        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
        >
          <option value="dropin">臨打</option>
          <option value="season">季打</option>
          <option value="substitute">補位</option>
        </select>

        <label>費用</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />

        <label>最低人數</label>
        <input
          type="number"
          value={minPlayers}
          onChange={(e) => setMinPlayers(Number(e.target.value))}
        />

        <label>最高人數</label>
        <input
          type="number"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
        />

        <label>狀態</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">開放報名</option>
          <option value="full">滿團</option>
          <option value="waitlist">候補</option>
          <option value="cancelled">取消</option>
          <option value="completed">完成</option>
        </select>

        <label>備註</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

        <button
          onClick={handleUpdate}
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          💾 儲存更新
        </button>
      </div>
    </div>
  );
}