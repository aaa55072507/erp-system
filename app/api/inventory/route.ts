import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST：庫存進出貨
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      product_id,
      quantity,
      type, // "in" | "out"
      note,
    } = body;

    // 基本檢查
    if (!product_id || !quantity || !type) {
      return NextResponse.json(
        { success: false, error: "missing params" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "quantity must > 0" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("inventory_transactions")
      .insert({
        product_id,
        quantity,
        type,
        note,
      })
      .select()
      .single();

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
  } catch (err: any) {
    return NextResponse.json(
      { success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}