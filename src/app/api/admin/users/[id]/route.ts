import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Rol } from "@/lib/types";

interface ActualizarUsuarioBody {
  nombre?: string;
  email?: string; // correo de contacto real, opcional
  role?: Rol;
  activo?: boolean;
  password?: string; // restablecer contraseña -- no requiere la anterior
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as ActualizarUsuarioBody | null;
  if (!body) return NextResponse.json({ error: "Cuerpo invalido." }, { status: 400 });

  if (id === auth.user.id && (body.role !== undefined || body.activo !== undefined)) {
    return NextResponse.json(
      { error: "No podes cambiar tu propio rol ni desactivar tu propia cuenta." },
      { status: 400 }
    );
  }

  if (body.password !== undefined) {
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña nueva debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: body.password,
    });
    if (passwordError) return NextResponse.json({ error: passwordError.message }, { status: 400 });
  }

  const cambios: Partial<{ nombre: string | null; email: string | null; role: Rol; activo: boolean }> =
    {};
  if (body.nombre !== undefined) cambios.nombre = body.nombre.trim() || null;
  if (body.email !== undefined) cambios.email = body.email.trim() || null;
  if (body.role !== undefined) cambios.role = body.role === "admin" ? "admin" : "user";
  if (body.activo !== undefined) cambios.activo = Boolean(body.activo);

  if (Object.keys(cambios).length === 0) {
    if (body.password !== undefined) {
      // solo se pidio cambiar la contraseña -- ya se aplico arriba, no hay
      // nada mas que tocar en profiles.
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, username, email, nombre, role, activo")
        .eq("id", id)
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ usuario: data });
    }
    return NextResponse.json({ error: "Nada para actualizar." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(cambios)
    .eq("id", id)
    .select("id, username, email, nombre, role, activo")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ usuario: data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  if (id === auth.user.id) {
    return NextResponse.json({ error: "No podes eliminar tu propia cuenta." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
