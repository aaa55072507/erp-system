import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const { session_id, member_id } = await req.json();

    if (!session_id || !member_id) {
      return NextResponse.json(
        { success: false, error: "missing params" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("cancel_session", {
      p_session_id: session_id,
      p_member_id: member_id,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: data,
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