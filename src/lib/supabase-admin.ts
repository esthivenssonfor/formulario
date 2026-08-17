import { createClient } from "@supabase/supabase-js";

// Cliente con service_role -- ignora RLS por completo. SOLO se importa
// desde codigo server-side (src/app/api/admin/**), nunca desde un
// componente "use client". SUPABASE_SERVICE_ROLE_KEY (sin prefijo
// NEXT_PUBLIC_) no llega nunca al bundle del navegador.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
