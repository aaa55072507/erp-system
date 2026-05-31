import { supabase } from "@/lib/supabase";

export const memberService = {
  getAll() {
    return supabase.from("members").select("*");
  },
};