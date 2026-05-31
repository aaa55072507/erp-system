import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      items, // [{ product_id, quantity, price }]
      total_amount,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "cart empty" },
        { status: 400 }
      );
    }

    // 🧱 1. 建立 sales 主單
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        total_amount,
      })
      .select()
      .single();

    if (saleError) {
      return NextResponse.json(
        { error: saleError.message },
        { status: 500 }
      );
    }

    // 🧱 2. 建立 sale_items + 扣庫存
    for (const item of items) {
      // 2-1 建立銷售明細
      const { error: itemError } = await supabase
        .from("sale_items")
        .insert({
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price,
        });

      if (itemError) {
        return NextResponse.json(
          { error: itemError.message },
          { status: 500 }
        );
      }

      // 2-2 扣庫存（inventory）
      const { error: invError } = await supabase
        .from("inventory_transactions")
        .insert({
          product_id: item.product_id,
          quantity: item.quantity,
          type: "out",
          note: "POS 結帳扣庫存",
        });

      if (invError) {
        return NextResponse.json(
          { error: invError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      sale_id: sale.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}