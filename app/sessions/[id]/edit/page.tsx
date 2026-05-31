"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSafeParams } from "@/hooks/useSafeParams";
import { useSession } from "@/hooks/useSession";
import { sessionService } from "@/services/sessionService";

export default function EditSessionPage() {
  const router = useRouter();
  const { id } = useSafeParams();

  const { data, loading } = useSession(id);

  const [title, setTitle] = useState("");

  useEffect(() => {
    if (data) {
      setTitle(data.title || "");
    }
  }, [data]);

  async function handleUpdate() {
    if (!id) return;

    const { error } = await sessionService.update(id, {
      title,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("更新成功");
    router.push("/sessions");
  }

  if (loading) return <p>載入中...</p>;

  return (
    <div>
      <h1>編輯場次</h1>

      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <button onClick={handleUpdate}>
        儲存
      </button>
    </div>
  );
}