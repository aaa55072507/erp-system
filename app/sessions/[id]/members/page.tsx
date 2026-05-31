"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Member = {
  id: string;
  name: string;
  phone: string;
  gender: "male" | "female" | "unknown" | null;
};

type Session = {
  id: string;
  title: string;
  max_players: number;
  session_type: "mixed" | "male_only" | "female_only";
};

type SessionMember = {
  id: string;
  member_id: string;
  status: "registered" | "waitlist";
  payment_status: "unpaid" | "paid";
};

export default function SessionMembersPage() {
  const { id } = useParams();

  const [session, setSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [sessionMembers, setSessionMembers] = useState<SessionMember[]>([]);
  const [search, setSearch] = useState("");

  async function loadData() {
    const [{ data: sessionData }, { data: membersData }, { data: smData }] =
      await Promise.all([
        supabase.from("sessions").select("*").if (!id) return;
        eq("id", id).maybeSingle(),
        supabase.from("members").select("*"),
        supabase.from("session_members").select("*").eq("session_id", id),
      ]);

    setSession(sessionData);
    setMembers(membersData || []);
    setSessionMembers(smData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const memberMap = useMemo(() => {
    const map: Record<string, Member> = {};
    members.forEach((m) => (map[m.id] = m));
    return map;
  }, [members]);

  const registered = sessionMembers.filter(
    (m) => m.status === "registered"
  );

  const waitlist = sessionMembers.filter(
    (m) => m.status === "waitlist"
  );

  const paidCount = sessionMembers.filter(
    (m) => m.payment_status === "paid"
  ).length;

  const unpaidCount = sessionMembers.filter(
    (m) => m.payment_status === "unpaid"
  ).length;

  function isAllowed(member: Member) {
    if (!session) return false;

    if (session.session_type === "female_only")
      return member.gender === "female";

    if (session.session_type === "male_only")
      return member.gender === "male";

    return true;
  }

  async function togglePayment(sm: SessionMember) {
    const next =
      sm.payment_status === "paid" ? "unpaid" : "paid";

    const { error } = await supabase
      .from("session_members")
      .update({ payment_status: next })
      .eq("id", sm.id);

    if (error) {
      alert("更新失敗：" + error.message);
      return;
    }

    loadData();
  }

  async function removeMember(memberId: string) {
    await supabase
      .from("session_members")
      .delete()
      .eq("session_id", session id)
      .eq("member_id", member id);

    loadData();
  }

  async function addMember(memberId: string) {
    const member = memberMap[memberId];
    if (!member || !session) return;

    if (!isAllowed(member)) {
      alert("性別不符合場次限制");
      return;
    }

    const exists = sessionMembers.find(
      (m) => m.member_id === memberId
    );
    if (exists) {
      alert("已報名");
      return;
    }

    const registeredCount = registered.length;

    const status =
      registeredCount >= session.max_players
        ? "waitlist"
        : "registered";

    await supabase.from("session_members").insert([
      {
        session_id: id,
        member_id: memberId,
        status,
        payment_status: "unpaid",
      },
    ]);

    loadData();
  }

  const filteredMembers = members.filter((m) => {
    const k = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(k) ||
      m.phone?.includes(k)
    );
  });

  const income = paidCount * 200; // ⚠️ 先用固定200（之後可改 dynamic price）

  if (!session) return <p>載入中...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>💰 收款 / 報名管理</h1>

      {/* 統計 */}
      <div style={{ marginBottom: 20 }}>
        👥 {registered.length} / {session.max_players} <br />
        💰 已收款：{paidCount} 人（NT$ {income}） <br />
        ❌ 未付款：{unpaidCount} 人
      </div>

      {/* 搜尋 */}
      <input
        placeholder="搜尋會員"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      {/* 已報名 */}
      <h3>✅ 已報名</h3>

      {registered.map((sm) => {
        const m = memberMap[sm.member_id];

        return (
          <div
            key={sm.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 10,
              border: "1px solid #ddd",
              marginTop: 6,
            }}
          >
            <div>
              {m?.name} ({m?.gender}) |{" "}
              {sm.payment_status === "paid"
                ? "💰 已付款"
                : "❌ 未付款"}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => togglePayment(sm)}>
                {sm.payment_status === "paid"
                  ? "改未付款"
                  : "設為已付款"}
              </button>

              <button
                onClick={() => removeMember(sm.member_id)}
              >
                ❌
              </button>
            </div>
          </div>
        );
      })}

      {/* 候補 */}
      <h3>⏳ 候補</h3>

      {waitlist.map((sm) => {
        const m = memberMap[sm.member_id];

        return (
          <div key={sm.id} style={{ padding: 10 }}>
            {m?.name} ({m?.gender})
          </div>
        );
      })}

      {/* 可報名 */}
      <h3>➕ 加入會員</h3>

      {filteredMembers.map((m) => {
        const exists = sessionMembers.find(
          (s) => s.member_id === m.id
        );

        const allowed = isAllowed(m);

        return (
          <div
            key={m.id}
            style={{
              padding: 10,
              border: "1px solid #ddd",
              opacity: allowed ? 1 : 0.4,
              marginBottom: 6,
            }}
          >
            {m.name} ({m.gender})

            <button
              disabled={!allowed || !!exists}
              onClick={() => addMember(m.id)}
              style={{ marginLeft: 10 }}
            >
              {exists ? "已報名" : "➕ 報名"}
            </button>
          </div>
        );
      })}
    </div>
  );
}