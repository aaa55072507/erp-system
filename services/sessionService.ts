import { supabase } from "@/lib/supabase";

export const sessionService = {
  async getById(id: string) {
    return supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();
  },

  async update(id: string, payload: any) {
    return supabase
      .from("sessions")
      .update(payload)
      .eq("id", id);
  },
};