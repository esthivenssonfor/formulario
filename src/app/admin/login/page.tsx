"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Alert, Button, TextInput } from "@/components/ui";

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
    <main
      id="contenido"
      className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12"
    >
      <p className="text-sm font-semibold text-brand">Panel administrativo</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
        {modo === "login" ? "Acceso al panel" : "Crear cuenta de administrador"}
      </h1>

      <div className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-ink">Correo</span>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-ink">Contraseña</span>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={modo === "login" ? "current-password" : "new-password"}
          />
        </label>
      </div>

      {mensaje && (
        <div className="mt-4">
          <Alert tono={mensaje.tipo === "ok" ? "ok" : "error"}>{mensaje.texto}</Alert>
        </div>
      )}

      <Button onClick={enviar} disabled={cargando || !email || !password} className="mt-6">
        {cargando ? "Un momento..." : modo === "login" ? "Iniciar sesion" : "Crear cuenta"}
      </Button>

      <button
        onClick={() => setModo(modo === "login" ? "signup" : "login")}
        className="mt-4 text-sm font-medium text-brand underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {modo === "login" ? "No tengo cuenta, crear una" : "Ya tengo cuenta, iniciar sesion"}
      </button>
    </main>
  );
}
