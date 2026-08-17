"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { Alert, Button, TextInput } from "@/components/ui";
import { Logo } from "@/components/logo";
import { emailInternoDeUsuario, FUNDACION_NOMBRE } from "@/lib/config";

const MENSAJES_ERROR: Record<string, string> = {
  "Invalid login credentials": "Usuario o contraseña incorrectos.",
  "Email not confirmed": "Esta cuenta todavia no fue confirmada.",
};

const CLAVE_USUARIO_RECORDADO = "fundimopla_ultimo_usuario";

export default function LoginPage() {
  const router = useRouter();
  // el navegador ya ofrece recordar la CONTRASEÑA solo (autoComplete +
  // name en los inputs, mas abajo); esto solo recuerda el nombre de
  // usuario entre visitas para no tener que escribirlo cada vez.
  const [usuario, setUsuario] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem(CLAVE_USUARIO_RECORDADO) ?? ""
  );
  const [password, setPassword] = useState("");
  const [recordarUsuario, setRecordarUsuario] = useState(() =>
    typeof window === "undefined" ? false : Boolean(localStorage.getItem(CLAVE_USUARIO_RECORDADO))
  );
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (cargando) return;
    setCargando(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInternoDeUsuario(usuario),
      password,
    });
    if (error) {
      setCargando(false);
      setError(MENSAJES_ERROR[error.message] ?? error.message);
      return;
    }
    if (recordarUsuario) {
      localStorage.setItem(CLAVE_USUARIO_RECORDADO, usuario.trim());
    } else {
      localStorage.removeItem(CLAVE_USUARIO_RECORDADO);
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main
      id="contenido"
      className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12"
    >
      <Link href="/" className="self-start">
        <Button variant="ghost" className="border border-line px-3 py-1.5 text-sm">
          ← Atras
        </Button>
      </Link>

      <div className="mt-6 flex flex-col items-center text-center">
        <Logo size="lg" />
        <p className="mt-4 text-sm font-semibold text-brand">{FUNDACION_NOMBRE}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
          Acceso al panel administrativo
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Ingresa con la cuenta que te asigno el administrador del sistema.
        </p>
      </div>

      <form onSubmit={enviar} className="mt-8 flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-ink">
            Usuario <span aria-hidden="true" className="text-danger">*</span>
          </span>
          <TextInput
            type="text"
            name="username"
            required
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-ink">
            Contraseña <span aria-hidden="true" className="text-danger">*</span>
          </span>
          <div className="relative">
            <TextInput
              type={mostrarPassword ? "text" : "password"}
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="pr-20"
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrarPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </label>

        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={recordarUsuario}
            onChange={(e) => setRecordarUsuario(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Recordar mi usuario en este dispositivo
        </label>

        {error && <Alert tono="error">{error}</Alert>}

        <Button type="submit" disabled={cargando || !usuario || !password} className="mt-2">
          {cargando ? "Verificando..." : "Iniciar sesion"}
        </Button>
      </form>
    </main>
  );
}
