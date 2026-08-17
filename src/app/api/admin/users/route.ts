import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { emailInternoDeUsuario, normalizarUsername, usernameValido } from "@/lib/config";
import type { Rol } from "@/lib/types";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, username, email, nombre, role, activo")
    .order("username");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ usuarios: data });
}

interface CrearUsuarioBody {
  username?: string;
  email?: string; // correo de contacto real, opcional -- NO se usa para login
  password?: string;
  nombre?: string;
  role?: Rol;
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await request.json().catch(() => null)) as CrearUsuarioBody | null;
  const username = body?.username ? normalizarUsername(body.username) : "";
  const emailContacto = body?.email?.trim() || null;
  const password = body?.password ?? "";
  const nombre = body?.nombre?.trim() || null;
  const role: Rol = body?.role === "admin" ? "admin" : "user";

  if (!username || !usernameValido(username)) {
    return NextResponse.json(
      { error: "Usuario invalido: 3-32 caracteres, minusculas, numeros, punto o guion bajo." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña inicial debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  const { data: creado, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: emailInternoDeUsuario(username),
    password,
    email_confirm: true,
  });
  if (createError || !creado.user) {
    const mensaje =
      createError?.code === "email_exists"
        ? "Ese usuario ya existe."
        : createError?.message ?? "No se pudo crear el usuario.";
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({ id: creado.user.id, username, email: emailContacto, nombre, role, activo: true })
    .select("id, username, email, nombre, role, activo")
    .single();

  if (profileError) {
    // el usuario de auth ya se creo -- deshacer para no dejar cuentas huerfanas
    await supabaseAdmin.auth.admin.deleteUser(creado.user.id);
    const mensaje = profileError.code === "23505" ? "Ese usuario ya existe." : profileError.message;
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }

  return NextResponse.json({ usuario: profile }, { status: 201 });
}
