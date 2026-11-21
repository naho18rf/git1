import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Empresa = Tables<"empresas">;

export const empresaQuery = (userId: string) =>
  queryOptions({
    queryKey: ["empresa", userId],
    queryFn: async (): Promise<Empresa | null> => {
      const { data, error } = await supabase.from("empresas").select("*").eq("id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const esAdminQuery = (userId: string) =>
  queryOptions({
    queryKey: ["rol", "admin", userId],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (error) throw error;
      return data === true;
    },
  });
