"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

/**
 * Member 型別
 */
type Member = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  /**
   * 讀取會員
   */
  async function loadMembers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setMembers(data || []);
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  /**
   * 輸入變更
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  /**
   * 新增會員
   */
  async function addMember() {
    if (!form.name || !form.phone || !form.email) {
      alert("請填寫完整資料");
      return;
    }

    const { error } = await supabase.from("members").insert([
      {
        name: form.name,
        phone: form.phone,
        email: form.email,
      },
    ]);

    if (error) {
      alert("新增失敗：" + error.message);
      return;
    }

    setForm({ name: "", phone: "", email: "" });
    loadMembers();
  }

  /**
   * 刪除會員
   */
  async function deleteMember(id: string) {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", id);

    if (error) {
      alert("刪除失敗：" + error.message);
      return;
    }

    loadMembers();
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>
        👤 ERP 會員管理
      </h1>

      {/* 表單 */}
      <div style={{ marginBottom: 20 }}>
        <input
          name="name"
          placeholder="姓名"
          value={form.name}
          onChange={handleChange}
          style={{ marginRight: 8 }}
        />

        <input
          name="phone"
          placeholder="電話"
          value={form.phone}
          onChange={handleChange}
          style={{ marginRight: 8 }}
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{ marginRight: 8 }}
        />

        <button onClick={addMember}>
          ➕ 新增
        </button>
      </div>

      {/* 工具列 */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={loadMembers}>
          🔄 重新整理
        </button>
      </div>

      {/* loading */}
      {loading && <p>載入中...</p>}

      {/* 表格 */}
      <table border={1} cellPadding={10} width="100%">
        <thead>
          <tr>
            <th>姓名</th>
            <th>電話</th>
            <th>Email</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.phone}</td>
              <td>{m.email}</td>
              <td>
                <button onClick={() => deleteMember(m.id)}>
                  🗑 刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}