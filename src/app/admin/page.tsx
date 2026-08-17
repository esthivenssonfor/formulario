"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { obtenerConfiguracion, listarEncuestas, eliminarEncuesta } from "@/lib/storage";
import { calcularPrioridades } from "@/lib/scoring";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-client";
import { emailInternoDeUsuario } from "@/lib/config";
import type { Configuracion, Encuesta } from "@/lib/types";
import { Alert, Button, NivelBadge, TextInput } from "@/components/ui";

export default function AdminPage() {
  const { profile } = useAuth();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  // eliminar una encuesta pide re-confirmar la contraseña del admin logueado.
  const [aEliminar, setAEliminar] = useState<Encuesta | null>(null);
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  useEffect(() => {
    obtenerConfiguracion().then(setConfig);
    listarEncuestas().then(setEncuestas);
  }, []);

  const prioridades = useMemo(
    () => (config ? calcularPrioridades(encuestas, config) : new Map<string, number>()),
    [encuestas, config]
  );

  const filas = useMemo(
    () =>
      [...encuestas].sort(
        (a, b) => (prioridades.get(a.id) ?? 0) - (prioridades.get(b.id) ?? 0)
      ),
    [encuestas, prioridades]
  );

  function nivelDe(encuesta: Encuesta) {
    return config?.puntuacion.rangosNivel.find((r) => r.id === encuesta.nivelId);
  }

  function preguntaDe(id: string) {
    return config?.preguntas.find((p) => p.id === id);
  }

  // La discapacidad ya no se elige en un paso aparte: se toma de la
  // respuesta real de la seccion II (texto libre).
  function discapacidadDe(e: Encuesta): string {
    return e.respuestas.find((r) => r.preguntaId === "q_discapacidad_detalle")?.valorTexto || "-";
  }

  function exportarExcel() {
    if (!config) return;
    const filasExcel = filas.map((e) => ({
      Prioridad: prioridades.get(e.id),
      Encuestador: e.encuestador,
      Encuestado: e.participante,
      Edad: e.edad ?? "",
      Discapacidad: discapacidadDe(e),
      Puntaje: e.puntajeTotal,
      Nivel: nivelDe(e)?.nombre ?? "",
      Fecha: new Date(e.fecha).toLocaleString("es"),
    }));
    const hoja = XLSX.utils.json_to_sheet(filasExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Encuestas");
    XLSX.writeFile(libro, "encuestas_vulnerabilidad.xlsx");
  }

  function recargar() {
    listarEncuestas().then(setEncuestas);
  }

  function pedirEliminar(e: Encuesta) {
    setAEliminar(e);
    setPasswordConfirmar("");
    setErrorEliminar(null);
  }

  function cancelarEliminar() {
    setAEliminar(null);
    setPasswordConfirmar("");
    setErrorEliminar(null);
  }

  async function confirmarEliminar() {
    if (!aEliminar || !profile) return;
    setEliminando(true);
    setErrorEliminar(null);
    // re-valida la contraseña del admin actual antes de borrar (no cambia
    // la sesion activa, solo confirma que la contraseña es correcta).
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailInternoDeUsuario(profile.username),
      password: passwordConfirmar,
    });
    if (authError) {
      setEliminando(false);
      setErrorEliminar("Contraseña incorrecta.");
      return;
    }
    try {
      await eliminarEncuesta(aEliminar.id);
      cancelarEliminar();
      recargar();
    } catch (err) {
      setErrorEliminar(err instanceof Error ? err.message : "Error al eliminar.");
    } finally {
      setEliminando(false);
    }
  }

  if (!config) {
    return (
      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <p className="text-ink-muted">Cargando panel...</p>
      </main>
    );
  }

  return (
    <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <Link href="/">
        <Button variant="ghost" className="border border-line px-3 py-1.5 text-sm">
          ← Atras
        </Button>
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Encuestas</h1>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/configuracion"
            className="inline-flex items-center justify-center rounded-lg border-2 border-brand px-4 py-2 font-semibold text-brand transition-colors duration-150 hover:bg-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Configuracion
          </Link>
          <Button variant="ghost" onClick={recargar} className="border border-line">
            Recargar
          </Button>
          <Button onClick={exportarExcel} disabled={filas.length === 0} className="px-4 py-2">
            Exportar Excel
          </Button>
        </div>
      </div>

      <p className="mt-2 text-sm text-ink-muted">
        Orden segun direccion configurada:{" "}
        <strong className="text-ink">
          {config.puntuacion.direccion === "mayor_es_mas_vulnerable"
            ? "mayor puntaje = mas vulnerable"
            : "menor puntaje = mas vulnerable"}
        </strong>
        . Cambiar en Configuracion.
      </p>

      {filas.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-surface px-6 py-10 text-center text-ink-muted">
          Aun no hay encuestas registradas.{" "}
          <Link className="font-medium text-brand underline" href="/encuesta">
            Completa una encuesta
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface text-sm text-ink-muted">
                <th className="px-4 py-3 font-semibold">Prioridad</th>
                <th className="px-4 py-3 font-semibold">Encuestado</th>
                <th className="px-4 py-3 font-semibold">Discapacidad</th>
                <th className="px-4 py-3 font-semibold">Puntaje</th>
                <th className="px-4 py-3 font-semibold">Nivel</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filas.map((e) => {
                const nivel = nivelDe(e);
                const expandido = expandidoId === e.id;
                return (
                  <Fragment key={e.id}>
                    <tr className="border-b border-line last:border-0 hover:bg-surface">
                      <td className="px-4 py-3 font-semibold text-ink">{prioridades.get(e.id)}</td>
                      <td className="px-4 py-3 text-ink">{e.participante}</td>
                      <td className="px-4 py-3 text-ink-muted">{discapacidadDe(e)}</td>
                      <td className="px-4 py-3 text-ink">{e.puntajeTotal}</td>
                      <td className="px-4 py-3">
                        {nivel && <NivelBadge tono={nivel.id}>{nivel.nombre}</NivelBadge>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => setExpandidoId(expandido ? null : e.id)}
                          className="mr-4 font-medium text-brand underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                          {expandido ? "Ocultar" : "Ver detalle"}
                        </button>
                        <button
                          onClick={() => pedirEliminar(e)}
                          className="font-medium text-danger underline underline-offset-2"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                    {expandido && (
                      <tr className="border-b border-line bg-surface">
                        <td colSpan={6} className="px-4 py-4">
                          <ul className="flex flex-col gap-2 text-sm">
                            {e.respuestas.map((r) => {
                              const pregunta = preguntaDe(r.preguntaId);
                              const opciones = pregunta?.opciones
                                .filter((o) => r.opcionIds.includes(o.id))
                                .map((o) => o.texto)
                                .join(", ");
                              const valor = opciones || r.valorTexto || "-";
                              return (
                                <li key={r.preguntaId} className="text-ink-muted">
                                  <strong className="text-ink">{pregunta?.texto}</strong> →{" "}
                                  {valor}
                                  {r.puntos > 0 && ` (${r.puntos} pts)`}
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {aEliminar && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-eliminar"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6">
            <h2 id="titulo-eliminar" className="text-lg font-semibold text-ink">
              Eliminar encuesta
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Vas a eliminar la encuesta de <strong className="text-ink">{aEliminar.participante}</strong>.
              Esta accion no se puede deshacer. Confirma tu contraseña de administrador para
              continuar.
            </p>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="font-medium text-ink">Tu contraseña</span>
              <TextInput
                type="password"
                value={passwordConfirmar}
                onChange={(e) => setPasswordConfirmar(e.target.value)}
                autoComplete="current-password"
                autoFocus
              />
            </label>
            {errorEliminar && (
              <div className="mt-3">
                <Alert tono="error">{errorEliminar}</Alert>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={cancelarEliminar} disabled={eliminando}>
                Cancelar
              </Button>
              <Button
                onClick={confirmarEliminar}
                disabled={eliminando || !passwordConfirmar}
                className="bg-danger text-brand-ink hover:bg-danger"
              >
                {eliminando ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
