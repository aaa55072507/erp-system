import { supabase } from "../../../lib/supabase";

export const sessionService = {
  getById(id: string) {
    return supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();
  },

  getAll() {
    return supabase.from("sessions").select("*");
  },

  update(id: string, data: any) {
    return supabase
      .from("sessions")
      .update(data)
      .eq("id", id);
  },
};