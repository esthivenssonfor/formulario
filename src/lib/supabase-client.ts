import { createClient } from "@supabase/supabase-js";

// Cliente publico (anon key) -- respeta RLS. Las tablas de encuestas/respuestas
// tienen RLS activo sin policies todavia (ver supabase/schema.sql): hay que
// definir el modelo de auth del panel admin antes de leer/escribir ahi.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
