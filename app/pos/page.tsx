"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/lib/services/products";

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getProducts();
    setProducts(data);
  }

  function addToCart(product: any) {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);

      if (exists) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, qty: p.qty + 1 }
            : p
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  }

  function total() {
    return cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
  }

  async function checkout() {
    const res = await fetch("/api/pos/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cart.map((c) => ({
          product_id: c.id,
          quantity: c.qty,
          price: c.price,
        })),
        total_amount: total(),
      }),
    });

    const json = await res.json();

    if (json.success) {
      alert("結帳成功");
      setCart([]);
    } else {
      alert("失敗：" + json.error);
    }
  }

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      {/* 商品區 */}
      <div style={{ flex: 1 }}>
        <h2>📦 商品</h2>
        {products.map((p) => (
          <div key={p.id}>
            <button onClick={() => addToCart(p)}>
              {p.name} - ${p.price}
            </button>
          </div>
        ))}
      </div>

      {/* 購物車 */}
      <div style={{ flex: 1 }}>
        <h2>🛒 購物車</h2>

        {cart.map((c) => (
          <div key={c.id}>
            {c.name} x {c.qty}
          </div>
        ))}

        <h3>總價：{total()}</h3>

        <button onClick={checkout}>💰 結帳</button>
      </div>
    </div>
  );
}