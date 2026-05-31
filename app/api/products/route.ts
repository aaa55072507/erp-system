import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        category_id,
        product_categories (
          id,
          name
        ),
        inventory_transactions (
          quantity,
          type
        )
      `);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 🧠 計算即時庫存
    const result = data.map((p: any) => {
      let stock = 0;

      (p.inventory_transactions || []).forEach((t: any) => {
        if (t.type === "in") stock += t.quantity;
        if (t.type === "out") stock -= t.quantity;
      });

      return {
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.product_categories?.name || null,
        stock,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("product_categories")
    .select("*");

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}