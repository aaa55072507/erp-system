"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { notify } from "@/lib/notifications";

type Member = {
  id: string;
  name: string;
  phone: string;
  gender: "male" | "female" | "unknown" | null;
};

type Session = {
  id: string;
  title: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  max_players: number;
  session_type: "mixed" | "male_only" | "female_only";
};

type SessionMember = {
  id: string;
  member_id: string;
  status: "registered" | "waitlist";
  payment_status: "unpaid" | "paid";
};

export default function PublicSessionPage() {
  const { id } = useParams();

  const [session, setSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [sessionMembers, setSessionMembers] = useState<SessionMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadData() {
    setLoading(true);

    const [{ data: sessionData }, { data: membersData }, { data: smData }] =
      await Promise.all([
        supabase.from("sessions").select("*").eq("id", id).single(),
        supabase.from("members").select("*"),
        supabase.from("session_members").select("*").eq("session_id", id),
      ]);

    setSession(sessionData);
    setMembers(membersData || []);
    setSessionMembers(smData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const memberMap = useMemo(() => {
    const map: Record<string, Member> = {};
    members.forEach((m) => (map[m.id] = m));
    return map;
  }, [members]);

  const registered = sessionMembers.filter((m) => m.status === "registered");
  const waitlist = sessionMembers.filter((m) => m.status === "waitlist");

  function isAllowed(member: Member) {
    if (!session) return false;

    if (session.session_type === "female_only")
      return member.gender === "female";

    if (session.session_type === "male_only")
      return member.gender === "male";

    return true;
  }

  function countRegistered() {
    return registered.length;
  }

  // ➜ 報名
  async function addMember(memberId: string) {
    const member = memberMap[memberId];
    if (!member || !session) return;

    if (!isAllowed(member)) {
      alert("此場次限制性別");
      return;
    }

    const exists = sessionMembers.find((m) => m.member_id === memberId);
    if (exists) {
      alert("已報名或候補");
      return;
    }

    const status =
      countRegistered() >= session.max_players
        ? "waitlist"
        : "registered";

    const { error } = await supabase.from("session_members").insert([
      {
        session_id: id,
        member_id: memberId,
        status,
        payment_status: "unpaid",
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    await notify({
      type: status === "waitlist" ? "waitlist" : "booking",
      message: `🏐 ${member.name} ${
        status === "waitlist" ? "加入候補" : "成功報名"
      }`,
      session_id: id,
      member_id: memberId,
    });

    loadData();
  }

  // ➜ 取消
  async function removeMember(memberId: string) {
    const member = memberMap[memberId];

    await supabase
      .from("session_members")
      .delete()
      .eq("session_id", id)
      .eq("member_id", memberId);

    await notify({
      type: "cancel",
      message: `❌ ${member?.name || "某人"} 取消報名`,
      session_id: id,
      member_id: memberId,
    });

    loadData();
  }

  // 💰 付款切換（重點）
  async function togglePayment(sm: SessionMember) {
    const next = sm.payment_status === "paid" ? "unpaid" : "paid";

    const { error } = await supabase
      .from("session_members")
      .update({ payment_status: next })
      .eq("id", sm.id);

    if (error) {
      alert(error.message);
      return;
    }

    const member = memberMap[sm.member_id];

    await notify({
      type: "payment",
      message: `💰 ${member?.name} ${
        next === "paid" ? "已付款" : "取消付款"
      }`,
      session_id: id,
      member_id: sm.member_id,
    });

    loadData();
  }

  if (loading) return <p style={{ padding: 20 }}>載入中...</p>;
  if (!session) return <p>找不到場次</p>;

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: 16 }}>
      {/* 標題 */}
      <h1>🏐 {session.title}</h1>

      <div style={{ lineHeight: 1.8 }}>
        📅 {session.booking_date} <br />
        🕒 {session.start_time} ~ {session.end_time} <br />
        💰 {session.price} 元 <br />
        👥 {registered.length} / {session.max_players} <br />
        📌 {session.session_type}
      </div>

      {/* 搜尋 */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜尋會員"
        style={{
          width: "100%",
          marginTop: 16,
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      />

      {/* 已報名 */}
      <h3>✅ 已報名</h3>

      {registered.map((sm) => {
        const m = memberMap[sm.member_id];

        return (
          <div key={sm.id} style={{ marginBottom: 6 }}>
            {m?.name} ｜ {sm.payment_status}

            <button onClick={() => togglePayment(sm)} style={{ marginLeft: 8 }}>
              💰 付款切換
            </button>

            <button onClick={() => removeMember(sm.member_id)} style={{ marginLeft: 8 }}>
              ❌
            </button>
          </div>
        );
      })}

      {/* 候補 */}
      <h3>⏳ 候補</h3>

      {waitlist.map((sm) => {
        const m = memberMap[sm.member_id];
        return <div key={sm.id}>{m?.name}</div>;
      })}

      {/* 可報名 */}
      <h3>➕ 報名</h3>

      {members
        .filter((m) => {
          const k = search.toLowerCase();
          return (
            m.name?.toLowerCase().includes(k) ||
            m.phone?.includes(k)
          );
        })
        .map((m) => {
          const exists = sessionMembers.find((s) => s.member_id === m.id);
          const allowed = isAllowed(m);

          return (
            <div
              key={m.id}
              style={{
                opacity: allowed ? 1 : 0.3,
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              {m.name} ({m.gender})

              <button
                disabled={!allowed || !!exists}
                onClick={() => addMember(m.id)}
                style={{ marginLeft: 10 }}
              >
                {exists ? "已報名" : "報名"}
              </button>
            </div>
          );
        })}
    </div>
  );
}