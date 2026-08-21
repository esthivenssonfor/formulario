"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Alert, Button, PasswordInput, TextInput } from "@/components/ui";
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
    router.push("/");
    router.refresh();
  }

  return (
    <main
      id="contenido"
      className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12"
    >
      <div className="flex flex-col items-center text-center">
        <Logo size="lg" />
        <p className="mt-4 text-sm font-semibold text-brand">{FUNDACION_NOMBRE}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Iniciar sesion</h1>
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
          <PasswordInput
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
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
