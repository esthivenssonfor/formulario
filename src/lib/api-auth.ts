import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabase-admin";
import type { Profile } from "./types";

/**
 * Verifica el JWT que manda el navegador en Authorization: Bearer <token>
 * y confirma que corresponde a un admin activo. Se usa al inicio de cada
 * API route sensible -- nunca confiar en que el frontend ya oculto el
 * boton, la operacion privilegiada solo corre si esto pasa.
 */
export async function requireAdmin(
  request: Request
): Promise<{ user: User; profile: Profile } | { error: string; status: number }> {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { error: "No autenticado.", status: 401 };

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) return { error: "Sesion invalida.", status: 401 };

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, nombre, role, activo")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    return { error: `No se pudo verificar el permiso: ${profileError.message}`, status: 500 };
  }
  if (!profile || profile.role !== "admin" || !profile.activo) {
    return { error: "No tienes permiso de administrador.", status: 403 };
  }

  return { user: userData.user, profile: profile as Profile };
}
