"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { obtenerConfiguracion, listarEncuestas } from "@/lib/storage";
import { calcularPrioridades } from "@/lib/scoring";
import type { Encuesta } from "@/lib/types";

export default function AdminPage() {
  const config = useMemo(() => obtenerConfiguracion(), []);
  const [encuestas, setEncuestas] = useState<Encuesta[]>(() => listarEncuestas());
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const prioridades = useMemo(
    () => calcularPrioridades(encuestas, config),
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
    return config.puntuacion.rangosNivel.find((r) => r.id === encuesta.nivelId);
  }

  function preguntaDe(id: string) {
    return config.preguntas.find((p) => p.id === id);
  }

  function exportarExcel() {
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
    XLSX.utils.book_append_sheet(libro, hoja, "Encuestas DEMO");
    XLSX.writeFile(libro, "encuestas_vulnerabilidad_demo.xlsx");
  }

  function recargar() {
    setEncuestas(listarEncuestas());
  }

  return (
    <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-950">Panel administrativo (DEMO)</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/configuracion"
            className="rounded-md border-2 border-blue-900 px-4 py-2 font-semibold text-blue-900 hover:bg-blue-50"
          >
            Configuracion
          </Link>
          <button
            onClick={recargar}
            className="rounded-md border-2 border-slate-400 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Recargar
          </button>
          <button
            onClick={exportarExcel}
            disabled={filas.length === 0}
            className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-40"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-600">
        Orden segun direccion configurada:{" "}
        <strong>
          {config.puntuacion.direccion === "mayor_es_mas_vulnerable"
            ? "mayor puntaje = mas vulnerable"
            : "menor puntaje = mas vulnerable"}
        </strong>
        . Cambiar en Configuracion.
      </p>

      {filas.length === 0 ? (
        <p className="mt-8 text-slate-600">
          Aun no hay encuestas registradas. <Link className="text-blue-900 underline" href="/encuesta">Completa una encuesta DEMO</Link>.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-300 text-sm text-slate-600">
                <th className="py-2 pr-4">Prioridad</th>
                <th className="py-2 pr-4">Participante</th>
                <th className="py-2 pr-4">Discapacidad</th>
                <th className="py-2 pr-4">Puntaje</th>
                <th className="py-2 pr-4">Nivel</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {filas.map((e) => {
                const nivel = nivelDe(e);
                const expandido = expandidoId === e.id;
                return (
                  <Fragment key={e.id}>
                    <tr className="border-b border-slate-200">
                      <td className="py-2 pr-4 font-semibold">{prioridades.get(e.id)}</td>
                      <td className="py-2 pr-4">{e.participante}</td>
                      <td className="py-2 pr-4">
                        {config.tiposDiscapacidad.find((t) => t.id === e.discapacidad)?.etiqueta}
                      </td>
                      <td className="py-2 pr-4">{e.puntajeTotal}</td>
                      <td className="py-2 pr-4">
                        {nivel && (
                          <span className={`rounded-full px-3 py-1 text-xs text-white ${nivel.color}`}>
                            {nivel.nombre}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <button
                          onClick={() => setExpandidoId(expandido ? null : e.id)}
                          className="text-blue-900 underline"
                        >
                          {expandido ? "Ocultar" : "Ver detalle"}
                        </button>
                      </td>
                    </tr>
                    {expandido && (
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <td colSpan={6} className="px-4 py-4">
                          <ul className="flex flex-col gap-2">
                            {e.respuestas.map((r) => {
                              const pregunta = preguntaDe(r.preguntaId);
                              const opciones = pregunta?.opciones
                                .filter((o) => r.opcionIds.includes(o.id))
                                .map((o) => o.texto)
                                .join(", ");
                              return (
                                <li key={r.preguntaId}>
                                  <strong>{pregunta?.texto}</strong> → {opciones} ({r.puntos} pts)
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
