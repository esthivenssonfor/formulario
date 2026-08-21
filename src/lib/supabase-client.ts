import { createClient } from "@supabase/supabase-js";

// Cliente publico (anon key) -- respeta RLS. Las tablas de encuestas/respuestas
// tienen RLS activo sin policies todavia (ver supabase/schema.sql): hay que
// definir el modelo de auth del panel admin antes de leer/escribir ahi.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// margen antes de que expire el access_token para forzar un refresh --
// getSession() devuelve la sesion guardada tal cual, sin refrescarla sola:
// en sesiones largas (celular abierto varias horas) el token vencia y las
// rutas /api/admin/* (que lo mandan a mano en el header Authorization, a
// diferencia de las consultas normales a Supabase que el SDK renueva
// solo) devolvian 401 aunque el usuario seguia "logueado" en la app.
const MARGEN_EXPIRACION_MS = 60_000;

/** Access token valido para mandar en Authorization: Bearer -- refresca
 * la sesion primero si esta vencida o a punto de vencer. */
export async function obtenerTokenValido(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession();
  const sesion = data.session;
  if (!sesion) return undefined;

  const expiraEnMs = (sesion.expires_at ?? 0) * 1000 - Date.now();
  if (expiraEnMs > MARGEN_EXPIRACION_MS) return sesion.access_token;

  const { data: refrescada, error } = await supabase.auth.refreshSession();
  if (error || !refrescada.session) return sesion.access_token; // dejar que el server rechace y avise
  return refrescada.session.access_token;
}
