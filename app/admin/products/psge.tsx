"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  addStock,
  reduceStock,
} from "@/lib/services/products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getProducts();
    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStock(
    product_id: string,
    type: "in" | "out",
    qty: number
  ) {
    if (type === "in") {
      await addStock({
        product_id,
        quantity: qty,
        note: "館主手動進貨",
      });
    } else {
      await reduceStock({
        product_id,
        quantity: qty,
        note: "館主手動扣庫存",
      });
    }

    await load();
  }

  if (loading) return <p>載入中...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🏪 館主庫存管理</h1>

      {products.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <h3>{p.name}</h3>
          <p>價格：{p.price}</p>

          {/* 🟢 控制按鈕 */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handleStock(p.id, "in", 1)}>+1</button>
            <button onClick={() => handleStock(p.id, "in", 5)}>+5</button>
            <button onClick={() => handleStock(p.id, "in", 10)}>+10</button>

            <button onClick={() => handleStock(p.id, "out", 1)}>-1</button>
            <button onClick={() => handleStock(p.id, "out", 5)}>-5</button>
            <button onClick={() => handleStock(p.id, "out", 10)}>-10</button>
          </div>
        </div>
      ))}
    </div>
  );
}