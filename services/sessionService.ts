import { supabase } from "../../../lib/supabase";

export const sessionService = {
  getById(id: string) {
    return supabase
      .from("sessions")
      .select("*")
      .if (!id) return;
      eq("id", id)
      .maybeSingle();
  },

  getAll() {
    return supabase.from("sessions").select("*");
  },

  update(id: string, data: any) {
    return supabase
      .from("sessions")
      .update(data)
      .if (!id) return;
        eq("id", id)
  },
};