"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { obtenerConfiguracion, listarEncuestas } from "@/lib/storage";
import { calcularPrioridades } from "@/lib/scoring";
import type { Configuracion, Encuesta } from "@/lib/types";
import { Button, NivelBadge } from "@/components/ui";

export default function AdminPage() {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

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

  function exportarExcel() {
    if (!config) return;
    const filasExcel = filas.map((e) => ({
      Prioridad: prioridades.get(e.id),
      Participante: e.participante,
      Edad: e.edad ?? "",
      Discapacidad:
        config.tiposDiscapacidad.find((t) => t.id === e.discapacidad)?.etiqueta ??
        e.discapacidad,
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

  if (!config) {
    return (
      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <p className="text-ink-muted">Cargando panel...</p>
      </main>
    );
  }

  return (
    <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Panel administrativo</h1>
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
                <th className="px-4 py-3 font-semibold">Participante</th>
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
                      <td className="px-4 py-3 text-ink-muted">
                        {config.tiposDiscapacidad.find((t) => t.id === e.discapacidad)?.etiqueta}
                      </td>
                      <td className="px-4 py-3 text-ink">{e.puntajeTotal}</td>
                      <td className="px-4 py-3">
                        {nivel && <NivelBadge tono={nivel.id}>{nivel.nombre}</NivelBadge>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandidoId(expandido ? null : e.id)}
                          className="font-medium text-brand underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                          {expandido ? "Ocultar" : "Ver detalle"}
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
    </main>
  );
}
