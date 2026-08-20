import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Limite del plan gratuito de Supabase (500 MB de base de datos). Se puede
// ajustar sin tocar codigo con SUPABASE_STORAGE_LIMIT_MB (ver .env.example)
// si el proyecto cambia de plan.
const LIMITE_MB_POR_DEFECTO = 500;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await supabaseAdmin.rpc("get_database_size_bytes");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const limiteMb = Number(process.env.SUPABASE_STORAGE_LIMIT_MB) || LIMITE_MB_POR_DEFECTO;
  const usedBytes = Number(data);
  const limitBytes = limiteMb * 1024 * 1024;

  return NextResponse.json({ usedBytes, limitBytes, percent: usedBytes / limitBytes });
}
