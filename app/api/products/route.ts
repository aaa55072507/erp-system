import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET：取得商品列表
 */
export async function GET() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}

/**
 * POST：新增商品
 */
export async function POST(req: Request) {
  const body = await req.json();

  const { name, price, category_id } = body;

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      price,
      category_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}

/**
 * PATCH：更新商品
 */
export async function PATCH(req: Request) {
  const body = await req.json();

  const { id, name, price, category_id } = body;

  const { data, error } = await supabase
    .from("products")
    .update({
      name,
      price,
      category_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}

/**
 * DELETE：刪除商品
 */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}