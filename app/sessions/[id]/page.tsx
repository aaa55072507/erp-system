"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function EditSessionPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

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
    setLoading(true);

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert("載入失敗");
      return;
    }

    setTitle(data.title || "");
    setBookingDate(data.booking_date || "");
    setStartTime(data.start_time || "");
    setEndTime(data.end_time || "");
    setSessionType(data.session_type || "");
    setPrice(data.price || 0);
    setMinPlayers(data.min_players || 0);
    setMaxPlayers(data.max_players || 0);
    setStatus(data.status || "");
    setNotes(data.notes || "");

    setLoading(false);
  }

  useEffect(() => {
    if (id) loadSession();
  }, [id]);

  async function handleUpdate() {
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
    <div>
      <h1>編輯場次</h1>

      <button onClick={handleUpdate}>儲存更新</button>
    </div>
  );
}