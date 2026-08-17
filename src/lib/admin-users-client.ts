import { Capacitor } from "@capacitor/core";
import { supabase } from "./supabase-client";
import { URL_WEB } from "./config";
import type { Profile, Rol } from "./types";

// La app Android va empaquetada (sin servidor local): las rutas /api/*
// solo existen en el deploy real, asi que ahi se llaman con URL absoluta.
// En la web (o en `next dev`) la ruta relativa ya apunta al mismo origen.
function apiUrl(path: string): string {
  return Capacitor.isNativePlatform() ? `${URL_WEB}${path}` : path;
}

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function manejarRespuesta<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`);
  return body as T;
}

export async function listarUsuarios(): Promise<Profile[]> {
  const res = await fetch(apiUrl("/api/admin/users"), { headers: await authHeaders() });
  const body = await manejarRespuesta<{ usuarios: Profile[] }>(res);
  return body.usuarios;
}

export async function crearUsuario(datos: {
  username: string;
  email?: string;
  password: string;
  nombre: string;
  role: Rol;
}): Promise<Profile> {
  const res = await fetch(apiUrl("/api/admin/users"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(datos),
  });
  const body = await manejarRespuesta<{ usuario: Profile }>(res);
  return body.usuario;
}

export async function actualizarUsuario(
  id: string,
  cambios: Partial<{ nombre: string; email: string; role: Rol; activo: boolean; password: string }>
): Promise<Profile> {
  const res = await fetch(apiUrl(`/api/admin/users/${id}`), {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(cambios),
  });
  const body = await manejarRespuesta<{ usuario: Profile }>(res);
  return body.usuario;
}

export async function eliminarUsuario(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/users/${id}`), {
    method: "DELETE",
    headers: await authHeaders(),
  });
  await manejarRespuesta<{ ok: true }>(res);
}
