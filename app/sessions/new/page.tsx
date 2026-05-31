"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function NewSessionPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [bookingDate, setBookingDate] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [sessionType, setSessionType] = useState("dropin");

  const [price, setPrice] = useState(250);

  const [minPlayers, setMinPlayers] = useState(12);
  const [maxPlayers, setMaxPlayers] = useState(18);

  const [status, setStatus] = useState("open");

  const [notes, setNotes] = useState("");

  async function handleSubmit() {
    if (!title) {
      alert("請輸入場次名稱");
      return;
    }

    if (!bookingDate) {
      alert("請選擇日期");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("sessions")
      .insert([
        {
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
        },
      ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("新增失敗：" + error.message);
      return;
    }

    alert("新增成功");

    router.push("/sessions");
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: 20,
      }}
    >
      <h1>➕ 新增場次</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>場次名稱</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：週六中階臨打"
        />

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

        <label>場次類型</label>
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

        <label>最低開團人數</label>
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
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="open">開放報名</option>
          <option value="full">滿團</option>
          <option value="waitlist">候補中</option>
          <option value="cancelled">已取消</option>
          <option value="completed">已完成</option>
        </select>

        <label>備註</label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="例：缺男2、缺女1"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {loading ? "儲存中..." : "💾 儲存場次"}
        </button>
      </div>
    </div>
  );
}