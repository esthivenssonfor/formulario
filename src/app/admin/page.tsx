"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { obtenerConfiguracion, listarEncuestas, eliminarEncuesta } from "@/lib/storage";
import { exportarEncuestasExcel, abrirEncuestasExcel } from "@/lib/export-encuestas";
import { calcularPrioridades } from "@/lib/scoring";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-client";
import { emailInternoDeUsuario } from "@/lib/config";
import type { Configuracion, Encuesta } from "@/lib/types";
import { Alert, Button, NivelBadge, TextInput } from "@/components/ui";
import { DetalleEncuesta } from "@/components/detalle-encuesta";

export default function AdminPage() {
  const { profile } = useAuth();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  // eliminar (una o varias) pide re-confirmar la contraseña del admin
  // logueado -- idsAEliminar vacio significa que el dialogo esta cerrado,
  // con 1 o mas ids abre el mismo dialogo para el borrado individual o
  // en bloque (checkboxes + "Eliminar seleccionadas").
  const [idsAEliminar, setIdsAEliminar] = useState<string[]>([]);
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());

  const [exportando, setExportando] = useState(false);
  const [errorExportar, setErrorExportar] = useState<string | null>(null);

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

  async function exportarExcel() {
    setExportando(true);
    setErrorExportar(null);
    try {
      await exportarEncuestasExcel();
    } catch (err) {
      setErrorExportar(err instanceof Error ? err.message : "No se pudo exportar.");
    } finally {
      setExportando(false);
    }
  }

  async function abrirExcel() {
    setExportando(true);
    setErrorExportar(null);
    try {
      await abrirEncuestasExcel();
    } catch (err) {
      setErrorExportar(err instanceof Error ? err.message : "No se pudo abrir el archivo.");
    } finally {
      setExportando(false);
    }
  }

  function recargar() {
    listarEncuestas().then(setEncuestas);
  }

  function pedirEliminar(e: Encuesta) {
    setIdsAEliminar([e.id]);
    setPasswordConfirmar("");
    setErrorEliminar(null);
  }

  function pedirEliminarSeleccionadas() {
    if (seleccionadas.size === 0) return;
    setIdsAEliminar([...seleccionadas]);
    setPasswordConfirmar("");
    setErrorEliminar(null);
  }

  function cancelarEliminar() {
    setIdsAEliminar([]);
    setPasswordConfirmar("");
    setErrorEliminar(null);
  }

  function alternarSeleccion(id: string) {
    setSeleccionadas((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  }

  function alternarSeleccionTodas() {
    setSeleccionadas((prev) => (prev.size === filas.length ? new Set() : new Set(filas.map((e) => e.id))));
  }

  async function confirmarEliminar() {
    if (idsAEliminar.length === 0 || !profile) return;
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
      for (const id of idsAEliminar) {
        await eliminarEncuesta(id);
      }
      setSeleccionadas((prev) => {
        const nuevo = new Set(prev);
        for (const id of idsAEliminar) nuevo.delete(id);
        return nuevo;
      });
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
          <Button onClick={exportarExcel} disabled={filas.length === 0 || exportando} className="px-4 py-2">
            {exportando ? "Exportando..." : "Compartir Excel"}
          </Button>
          <Button
            variant="secondary"
            onClick={abrirExcel}
            disabled={filas.length === 0 || exportando}
            className="px-4 py-2"
          >
            Abrir con...
          </Button>
          {seleccionadas.size > 0 && (
            <Button
              onClick={pedirEliminarSeleccionadas}
              className="bg-danger px-4 py-2 text-brand-ink hover:bg-danger"
            >
              Eliminar seleccionadas ({seleccionadas.size})
            </Button>
          )}
        </div>
      </div>

      {errorExportar && (
        <div className="mt-4">
          <Alert tono="error">{errorExportar}</Alert>
        </div>
      )}

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
        <>
          {/* Mobile (< sm): tarjetas -- una tabla de 7 columnas no entra en
              un telefono sin obligar a deslizar hacia los lados para ver
              el resto del contenido. */}
          <div className="mt-6 sm:hidden">
            <label className="flex items-center gap-2 px-1 text-sm font-medium text-ink-muted">
              <input
                type="checkbox"
                checked={seleccionadas.size === filas.length}
                onChange={alternarSeleccionTodas}
                className="h-4 w-4 rounded border-line-strong"
              />
              Seleccionar todas
            </label>
          </div>
          <div className="mt-2 flex flex-col gap-3 sm:hidden">
            {filas.map((e) => {
              const nivel = nivelDe(e);
              const expandido = expandidoId === e.id;
              return (
                <div key={e.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={seleccionadas.has(e.id)}
                        onChange={() => alternarSeleccion(e.id)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-line-strong"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{e.participante}</p>
                        <p className="text-sm text-ink-muted">{e.encuestador || "-"}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-lg font-bold text-ink">#{prioridades.get(e.id)}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">{discapacidadDe(e)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {nivel && <NivelBadge tono={nivel.id}>{nivel.nombre}</NivelBadge>}
                    <span className="text-sm text-ink">Puntaje: {e.puntajeTotal}</span>
                  </div>
                  <div className="mt-3 flex gap-4">
                    <button
                      onClick={() => setExpandidoId(expandido ? null : e.id)}
                      className="text-sm font-medium text-brand underline underline-offset-2"
                    >
                      {expandido ? "Ocultar" : "Ver detalle"}
                    </button>
                    <button
                      onClick={() => pedirEliminar(e)}
                      className="text-sm font-medium text-danger underline underline-offset-2"
                    >
                      Eliminar
                    </button>
                  </div>
                  {expandido && (
                    <div className="mt-3 border-t border-line pt-3">
                      <DetalleEncuesta encuesta={e} preguntaDe={preguntaDe} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop/tablet (>= sm): tabla completa. */}
          <div className="mt-6 hidden overflow-x-auto rounded-xl border border-line sm:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface text-sm text-ink-muted">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={seleccionadas.size === filas.length}
                      onChange={alternarSeleccionTodas}
                      className="h-4 w-4 rounded border-line-strong"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold">Prioridad</th>
                  <th className="px-4 py-3 font-semibold">Encuestador</th>
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
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={seleccionadas.has(e.id)}
                            onChange={() => alternarSeleccion(e.id)}
                            className="h-4 w-4 rounded border-line-strong"
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-ink">{prioridades.get(e.id)}</td>
                        <td className="px-4 py-3 text-ink-muted">{e.encuestador || "-"}</td>
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
                          <td colSpan={8} className="px-4 py-4">
                            <DetalleEncuesta encuesta={e} preguntaDe={preguntaDe} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {idsAEliminar.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-eliminar"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6">
            <h2 id="titulo-eliminar" className="text-lg font-semibold text-ink">
              {idsAEliminar.length === 1 ? "Eliminar encuesta" : `Eliminar ${idsAEliminar.length} encuestas`}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              {idsAEliminar.length === 1 ? (
                <>
                  Vas a eliminar la encuesta de{" "}
                  <strong className="text-ink">
                    {filas.find((e) => e.id === idsAEliminar[0])?.participante}
                  </strong>
                  .
                </>
              ) : (
                <>
                  Vas a eliminar <strong className="text-ink">{idsAEliminar.length} encuestas</strong> seleccionadas.
                </>
              )}{" "}
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
