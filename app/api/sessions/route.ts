import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        id,
        title,
        booking_date,
        start_time,
        max_players,
        session_members (
          id,
          status
        )
      `);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 🧠 在 API 層做計算（避免 SQL 複雜）
    const result = data.map((s: any) => {
      const confirmed = (s.session_members || []).filter(
        (m: any) => m.status === "confirmed"
      ).length;

      return {
        id: s.id,
        title: s.title,
        booking_date: s.booking_date,
        start_time: s.start_time,
        max_players: s.max_players,
        confirmed_players: confirmed,
        remaining_slots: s.max_players - confirmed,
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