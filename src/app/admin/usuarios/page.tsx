"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { RoleGuard } from "@/components/role-guard";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "@/lib/admin-users-client";
import { usernameValido } from "@/lib/config";
import type { Profile, Rol } from "@/lib/types";
import { Alert, Button, PasswordInput, TextInput } from "@/components/ui";

function generarPasswordInicial(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
  let out = "";
  for (let i = 0; i < 12; i++) out += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  return out;
}

export default function UsuariosPage() {
  return (
    <RoleGuard>
      <UsuariosContenido />
    </RoleGuard>
  );
}

function UsuariosContenido() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  // arranca en true: la primera carga siempre pasa por aca antes de pintar
  // la tabla. Las recargas posteriores (crear/activar/eliminar) no la
  // vuelven a prender para no parpadear la pantalla completa.
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [password, setPassword] = useState(generarPasswordInicial());
  const [role, setRole] = useState<Rol>("user");
  const [creando, setCreando] = useState(false);

  const [editandoEmailId, setEditandoEmailId] = useState<string | null>(null);
  const [emailEditado, setEmailEditado] = useState("");
  const [guardandoEmail, setGuardandoEmail] = useState(false);

  // Cambiar contraseña: antes generaba una al azar y solo se mostraba una
  // vez en un mensaje -- si no se copiaba a tiempo, la cuenta quedaba
  // inaccesible (ya paso). Ahora se pide escribirla dos veces, como
  // cualquier formulario de contraseña.
  const [cambiandoPasswordUsuario, setCambiandoPasswordUsuario] = useState<Profile | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [repetirPassword, setRepetirPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  function cargar() {
    listarUsuarios()
      .then(setUsuarios)
      .catch((err) => setMensaje({ tipo: "error", texto: err.message }))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function onCrear(e: React.FormEvent) {
    e.preventDefault();
    setCreando(true);
    setMensaje(null);
    try {
      await crearUsuario({
        username: username.trim(),
        email: emailContacto.trim() || undefined,
        password,
        nombre: nombre.trim(),
        role,
      });
      setMensaje({ tipo: "ok", texto: `Usuario "${username.trim()}" creado correctamente.` });
      setNombre("");
      setUsername("");
      setEmailContacto("");
      setPassword(generarPasswordInicial());
      setRole("user");
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err instanceof Error ? err.message : "Error al crear." });
    } finally {
      setCreando(false);
    }
  }

  async function toggleActivo(u: Profile) {
    setMensaje(null);
    try {
      await actualizarUsuario(u.id, { activo: !u.activo });
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err instanceof Error ? err.message : "Error." });
    }
  }

  async function cambiarRol(u: Profile, nuevoRol: Rol) {
    setMensaje(null);
    try {
      await actualizarUsuario(u.id, { role: nuevoRol });
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err instanceof Error ? err.message : "Error." });
    }
  }

  function abrirCambiarPassword(u: Profile) {
    setCambiandoPasswordUsuario(u);
    setNuevaPassword("");
    setRepetirPassword("");
    setErrorPassword(null);
  }

  function cerrarCambiarPassword() {
    setCambiandoPasswordUsuario(null);
    setNuevaPassword("");
    setRepetirPassword("");
    setErrorPassword(null);
  }

  async function confirmarCambiarPassword() {
    if (!cambiandoPasswordUsuario) return;
    if (nuevaPassword.length < 8) {
      setErrorPassword("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (nuevaPassword !== repetirPassword) {
      setErrorPassword("Las contraseñas no coinciden.");
      return;
    }
    setGuardandoPassword(true);
    setErrorPassword(null);
    try {
      await actualizarUsuario(cambiandoPasswordUsuario.id, { password: nuevaPassword });
      setMensaje({ tipo: "ok", texto: `Contraseña de "${cambiandoPasswordUsuario.username}" cambiada correctamente.` });
      cerrarCambiarPassword();
    } catch (err) {
      setErrorPassword(err instanceof Error ? err.message : "Error al cambiar la contraseña.");
    } finally {
      setGuardandoPassword(false);
    }
  }

  function iniciarEdicionEmail(u: Profile) {
    setEditandoEmailId(u.id);
    setEmailEditado(u.email ?? "");
  }

  function cancelarEdicionEmail() {
    setEditandoEmailId(null);
    setEmailEditado("");
  }

  async function guardarEmail(id: string) {
    setGuardandoEmail(true);
    setMensaje(null);
    try {
      await actualizarUsuario(id, { email: emailEditado.trim() });
      setEditandoEmailId(null);
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err instanceof Error ? err.message : "Error." });
    } finally {
      setGuardandoEmail(false);
    }
  }

  async function eliminar(u: Profile) {
    if (!confirm(`Eliminar a "${u.username}"? Esta accion no se puede deshacer.`)) return;
    setMensaje(null);
    try {
      await eliminarUsuario(u.id);
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err instanceof Error ? err.message : "Error." });
    }
  }

  const usernameEsValido = !username || usernameValido(username);

  return (
    <main id="contenido" className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Usuarios</h1>
        <Link href="/admin">
          <Button variant="secondary" className="px-4 py-2 text-sm">
            Volver al panel
          </Button>
        </Link>
      </div>
      <p className="mt-2 text-ink-muted">
        Solo el administrador principal puede crear cuentas, asignar el rol
        Administrador y activar o desactivar el acceso de otros usuarios. El
        acceso al panel es por usuario, no por correo.
      </p>

      {mensaje && (
        <div className="mt-4">
          <Alert tono={mensaje.tipo === "ok" ? "ok" : "error"}>{mensaje.texto}</Alert>
        </div>
      )}

      <section className="mx-auto mt-8 max-w-lg rounded-xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold text-ink">Crear nuevo usuario</h2>
        <form onSubmit={onCrear} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-medium text-ink">
              Nombre <span className="text-danger" aria-hidden="true">*</span>
            </span>
            <TextInput
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-medium text-ink">
              Usuario (para iniciar sesion){" "}
              <span className="text-danger" aria-hidden="true">*</span>
            </span>
            <TextInput
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              required
              aria-invalid={!usernameEsValido}
              className="w-full"
            />
            {!usernameEsValido && (
              <span className="text-xs text-danger">
                3-32 caracteres: minusculas, numeros, punto o guion bajo.
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-medium text-ink">Correo de contacto (opcional)</span>
            <TextInput
              type="email"
              value={emailContacto}
              onChange={(e) => setEmailContacto(e.target.value)}
              className="w-full"
            />
            <span className="text-xs text-ink-muted">
              Solo para contactar a la persona -- no se usa para iniciar sesion.
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-medium text-ink">Contraseña inicial</span>
            <div className="flex gap-2">
              <TextInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="min-w-0 flex-1 font-mono text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                className="shrink-0 border border-line px-3"
                onClick={() => setPassword(generarPasswordInicial())}
              >
                Generar
              </Button>
            </div>
            <span className="text-xs text-ink-muted">
              Comparte esta contraseña por un canal seguro; el usuario deberia cambiarla.
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-medium text-ink">Rol</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Rol)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-base text-ink focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <div>
            <Button
              type="submit"
              disabled={creando || !nombre || !usernameEsValido || !username || password.length < 8}
              className="w-full"
            >
              {creando ? "Creando..." : "Crear usuario"}
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink">Usuarios existentes</h2>
        {cargando ? (
          <p className="mt-4 text-ink-muted">Cargando...</p>
        ) : usuarios.length === 0 ? (
          <p className="mt-4 text-ink-muted">Todavia no hay usuarios registrados.</p>
        ) : (
          <>
            {/* Mobile (< sm): tarjetas -- una tabla de 5 columnas obliga a
                deslizar hacia los lados en pantallas chicas. */}
            <div className="mt-4 flex flex-col gap-3 sm:hidden">
              {usuarios.map((u) => {
                const esYoMismo = u.id === user?.id;
                return (
                  <div key={u.id} className="rounded-xl border border-line bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">
                          {u.nombre ?? "-"} {esYoMismo && <span className="text-xs font-normal text-ink-muted">(vos)</span>}
                        </p>
                        <p className="text-sm text-ink-muted">{u.username}</p>
                      </div>
                      <button
                        onClick={() => toggleActivo(u)}
                        disabled={esYoMismo}
                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold disabled:opacity-40 ${
                          u.activo ? "bg-success-soft text-success" : "bg-surface-2 text-ink-muted"
                        }`}
                      >
                        {u.activo ? "Activo" : "Desactivado"}
                      </button>
                    </div>

                    {editandoEmailId === u.id ? (
                      <div className="mt-2 flex items-center gap-1.5">
                        <TextInput
                          type="email"
                          value={emailEditado}
                          onChange={(e) => setEmailEditado(e.target.value)}
                          placeholder="correo@ejemplo.com"
                          autoFocus
                          className="w-full py-1 text-xs"
                        />
                        <button
                          onClick={() => guardarEmail(u.id)}
                          disabled={guardandoEmail}
                          className="shrink-0 text-xs font-semibold text-success"
                        >
                          Guardar
                        </button>
                        <button onClick={cancelarEdicionEmail} className="shrink-0 text-xs font-medium text-ink-muted">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5 text-xs">
                        {u.email ?? <span className="italic text-ink-muted">sin correo</span>}
                        <button
                          onClick={() => iniciarEdicionEmail(u)}
                          className="font-medium text-brand underline underline-offset-2"
                        >
                          Editar
                        </button>
                      </div>
                    )}

                    <div className="mt-3">
                      <select
                        value={u.role}
                        disabled={esYoMismo}
                        onChange={(e) => cambiarRol(u, e.target.value as Rol)}
                        className={`w-full rounded-lg border px-2 py-1.5 text-sm font-medium disabled:opacity-40 ${
                          u.role === "admin"
                            ? "border-brand bg-brand-soft text-brand"
                            : "border-line-strong bg-surface-2 text-ink-muted"
                        }`}
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>

                    <div className="mt-3 flex gap-4">
                      <button
                        onClick={() => abrirCambiarPassword(u)}
                        className="text-sm font-medium text-brand underline underline-offset-2"
                      >
                        Cambiar contraseña
                      </button>
                      <button
                        onClick={() => eliminar(u)}
                        disabled={esYoMismo}
                        className="text-sm font-medium text-danger underline underline-offset-2 disabled:opacity-40"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop/tablet (>= sm): tabla completa. */}
            <div className="mt-4 hidden overflow-x-auto rounded-xl border border-line sm:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface text-sm text-ink-muted">
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const esYoMismo = u.id === user?.id;
                  return (
                    <tr key={u.id} className="border-b border-line last:border-0 hover:bg-surface">
                      <td className="px-4 py-3 text-ink">{u.nombre ?? "-"}</td>
                      <td className="px-4 py-3 text-ink-muted">
                        {u.username} {esYoMismo && <span className="text-xs">(vos)</span>}
                        {editandoEmailId === u.id ? (
                          <div className="mt-1 flex items-center gap-1.5">
                            <TextInput
                              type="email"
                              value={emailEditado}
                              onChange={(e) => setEmailEditado(e.target.value)}
                              placeholder="correo@ejemplo.com"
                              autoFocus
                              className="py-1 text-xs"
                            />
                            <button
                              onClick={() => guardarEmail(u.id)}
                              disabled={guardandoEmail}
                              className="text-xs font-semibold text-success"
                            >
                              Guardar
                            </button>
                            <button onClick={cancelarEdicionEmail} className="text-xs font-medium text-ink-muted">
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                            {u.email ?? <span className="italic">sin correo</span>}
                            <button
                              onClick={() => iniciarEdicionEmail(u)}
                              className="font-medium text-brand underline underline-offset-2"
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={esYoMismo}
                          onChange={(e) => cambiarRol(u, e.target.value as Rol)}
                          className={`rounded-lg border px-2 py-1.5 text-sm font-medium disabled:opacity-40 ${
                            u.role === "admin"
                              ? "border-brand bg-brand-soft text-brand"
                              : "border-line-strong bg-surface-2 text-ink-muted"
                          }`}
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActivo(u)}
                          disabled={esYoMismo}
                          className={`rounded-full px-3 py-1 text-sm font-semibold disabled:opacity-40 ${
                            u.activo ? "bg-success-soft text-success" : "bg-surface-2 text-ink-muted"
                          }`}
                        >
                          {u.activo ? "Activo" : "Desactivado"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => abrirCambiarPassword(u)}
                          className="mr-4 font-medium text-brand underline underline-offset-2"
                        >
                          Cambiar contraseña
                        </button>
                        <button
                          onClick={() => eliminar(u)}
                          disabled={esYoMismo}
                          className="font-medium text-danger underline underline-offset-2 disabled:opacity-40"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}
      </section>

      {cambiandoPasswordUsuario && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-cambiar-password"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6">
            <h2 id="titulo-cambiar-password" className="text-lg font-semibold text-ink">
              Cambiar contraseña
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Nueva contraseña para <strong className="text-ink">{cambiandoPasswordUsuario.username}</strong>.
            </p>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="font-medium text-ink">Nueva contraseña</span>
              <PasswordInput
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
              />
            </label>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="font-medium text-ink">Repite la contraseña</span>
              <PasswordInput
                value={repetirPassword}
                onChange={(e) => setRepetirPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            {errorPassword && (
              <div className="mt-3">
                <Alert tono="error">{errorPassword}</Alert>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={cerrarCambiarPassword} disabled={guardandoPassword}>
                Cancelar
              </Button>
              <Button
                onClick={confirmarCambiarPassword}
                disabled={guardandoPassword || !nuevaPassword || !repetirPassword}
              >
                {guardandoPassword ? "Guardando..." : "Cambiar contraseña"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
