"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  async function enviar() {
    setCargando(true);
    setMensaje(null);
    const { error } =
      modo === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setCargando(false);
    if (error) {
      setMensaje({ tipo: "error", texto: error.message });
      return;
    }
    if (modo === "signup") {
      setMensaje({ tipo: "ok", texto: "Cuenta creada. Iniciando sesion..." });
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main id="contenido" className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-blue-950">
        {modo === "login" ? "Acceso al panel admin" : "Crear cuenta de administrador"}
      </h1>

      <div className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-medium">Correo</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-slate-400 px-3 py-2 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-medium">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-slate-400 px-3 py-2 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900"
          />
        </label>
      </div>

      {mensaje && (
        <p
          role="alert"
          className={`mt-4 rounded-md px-4 py-2 ${
            mensaje.tipo === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <button
        onClick={enviar}
        disabled={cargando || !email || !password}
        className="mt-6 rounded-md bg-blue-900 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-800 disabled:opacity-40"
      >
        {cargando ? "Un momento..." : modo === "login" ? "Iniciar sesion" : "Crear cuenta"}
      </button>

      <button
        onClick={() => setModo(modo === "login" ? "signup" : "login")}
        className="mt-4 text-sm text-blue-900 underline"
      >
        {modo === "login" ? "No tengo cuenta, crear una" : "Ya tengo cuenta, iniciar sesion"}
      </button>
    </main>
  );
}
