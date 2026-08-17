"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  obtenerConfiguracion,
  guardarConfiguracion,
  restaurarConfiguracionDemo,
} from "@/lib/storage";
import type {
  Configuracion,
  DireccionPuntaje,
  OpcionPregunta,
  Pregunta,
  RangoNivel,
  ReglaCritica,
  TipoDiscapacidad,
  TipoPregunta,
} from "@/lib/types";
import { Alert, Button, TextArea, TextInput } from "@/components/ui";

const TIPOS_PREGUNTA: { value: TipoPregunta; etiqueta: string }[] = [
  { value: "unica", etiqueta: "Opcion unica" },
  { value: "multiple", etiqueta: "Opcion multiple" },
  { value: "texto", etiqueta: "Texto libre" },
  { value: "fecha", etiqueta: "Fecha" },
  { value: "numero", etiqueta: "Numero" },
];

function nuevoId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function seccionesEnOrden(preguntas: Pregunta[]): string[] {
  const vistas = new Set<string>();
  const orden: string[] = [];
  for (const p of preguntas) {
    if (!vistas.has(p.seccion)) {
      vistas.add(p.seccion);
      orden.push(p.seccion);
    }
  }
  return orden;
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [modo, setModo] = useState<"visual" | "json">("visual");
  const [textoJson, setTextoJson] = useState("");
  const [seccionesAbiertas, setSeccionesAbiertas] = useState<Set<string>>(new Set());

  useEffect(() => {
    obtenerConfiguracion().then((c) => {
      setConfig(c);
      setCargando(false);
    });
  }, []);

  const secciones = useMemo(() => (config ? seccionesEnOrden(config.preguntas) : []), [config]);

  function toggleSeccion(seccion: string) {
    setSeccionesAbiertas((prev) => {
      const next = new Set(prev);
      if (next.has(seccion)) next.delete(seccion);
      else next.add(seccion);
      return next;
    });
  }

  function actualizarPregunta(id: string, cambios: Partial<Pregunta>) {
    setConfig((c) =>
      c ? { ...c, preguntas: c.preguntas.map((p) => (p.id === id ? { ...p, ...cambios } : p)) } : c
    );
  }

  function actualizarOpcion(preguntaId: string, opcionId: string, cambios: Partial<OpcionPregunta>) {
    setConfig((c) =>
      c
        ? {
            ...c,
            preguntas: c.preguntas.map((p) =>
              p.id !== preguntaId
                ? p
                : {
                    ...p,
                    opciones: p.opciones.map((o) => (o.id === opcionId ? { ...o, ...cambios } : o)),
                  }
            ),
          }
        : c
    );
  }

  function agregarOpcion(preguntaId: string) {
    setConfig((c) =>
      c
        ? {
            ...c,
            preguntas: c.preguntas.map((p) =>
              p.id !== preguntaId
                ? p
                : { ...p, opciones: [...p.opciones, { id: nuevoId("op"), texto: "", puntos: 0 }] }
            ),
          }
        : c
    );
  }

  function quitarOpcion(preguntaId: string, opcionId: string) {
    setConfig((c) =>
      c
        ? {
            ...c,
            preguntas: c.preguntas.map((p) =>
              p.id !== preguntaId
                ? p
                : { ...p, opciones: p.opciones.filter((o) => o.id !== opcionId) }
            ),
          }
        : c
    );
  }

  function toggleFiltroDiscapacidad(preguntaId: string, discapacidadId: string) {
    setConfig((c) => {
      if (!c) return c;
      return {
        ...c,
        preguntas: c.preguntas.map((p) => {
          if (p.id !== preguntaId) return p;
          const actuales = p.mostrarSiDiscapacidad ?? [];
          const yaEsta = actuales.includes(discapacidadId);
          const nuevas = yaEsta
            ? actuales.filter((id) => id !== discapacidadId)
            : [...actuales, discapacidadId];
          return { ...p, mostrarSiDiscapacidad: nuevas.length ? nuevas : undefined };
        }),
      };
    });
  }

  function agregarPregunta(seccion: string) {
    setConfig((c) => {
      if (!c) return c;
      const nueva: Pregunta = {
        id: nuevoId("preg"),
        texto: "",
        categoria: "",
        seccion,
        peso: 1,
        tipo: "unica",
        opciones: [{ id: nuevoId("op"), texto: "", puntos: 0 }],
      };
      const ultimoIdx = c.preguntas.map((p) => p.seccion).lastIndexOf(seccion);
      const preguntas = [...c.preguntas];
      preguntas.splice(ultimoIdx + 1, 0, nueva);
      return { ...c, preguntas };
    });
    setSeccionesAbiertas((prev) => new Set(prev).add(seccion));
  }

  function quitarPregunta(id: string) {
    if (!confirm("Eliminar esta pregunta? Esta accion no se puede deshacer.")) return;
    setConfig((c) => (c ? { ...c, preguntas: c.preguntas.filter((p) => p.id !== id) } : c));
  }

  function agregarSeccion() {
    const nombre = prompt("Nombre de la nueva seccion (ej. 'XIII. Observaciones')");
    if (!nombre?.trim()) return;
    setConfig((c) => {
      if (!c) return c;
      const nueva: Pregunta = {
        id: nuevoId("preg"),
        texto: "",
        categoria: "",
        seccion: nombre.trim(),
        peso: 1,
        tipo: "unica",
        opciones: [{ id: nuevoId("op"), texto: "", puntos: 0 }],
      };
      return { ...c, preguntas: [...c.preguntas, nueva] };
    });
    setSeccionesAbiertas((prev) => new Set(prev).add(nombre.trim()));
  }

  function actualizarTipoDiscapacidad(id: string, cambios: Partial<TipoDiscapacidad>) {
    setConfig((c) =>
      c
        ? { ...c, tiposDiscapacidad: c.tiposDiscapacidad.map((t) => (t.id === id ? { ...t, ...cambios } : t)) }
        : c
    );
  }

  function agregarTipoDiscapacidad() {
    setConfig((c) =>
      c ? { ...c, tiposDiscapacidad: [...c.tiposDiscapacidad, { id: nuevoId("tipo"), etiqueta: "" }] } : c
    );
  }

  function quitarTipoDiscapacidad(id: string) {
    if (!confirm("Eliminar este tipo de discapacidad?")) return;
    setConfig((c) => (c ? { ...c, tiposDiscapacidad: c.tiposDiscapacidad.filter((t) => t.id !== id) } : c));
  }

  function actualizarPuntuacion(cambios: Partial<Configuracion["puntuacion"]>) {
    setConfig((c) => (c ? { ...c, puntuacion: { ...c.puntuacion, ...cambios } } : c));
  }

  function actualizarRango(id: string, cambios: Partial<RangoNivel>) {
    setConfig((c) =>
      c
        ? {
            ...c,
            puntuacion: {
              ...c.puntuacion,
              rangosNivel: c.puntuacion.rangosNivel.map((r) => (r.id === id ? { ...r, ...cambios } : r)),
            },
          }
        : c
    );
  }

  function agregarRango() {
    setConfig((c) =>
      c
        ? {
            ...c,
            puntuacion: {
              ...c.puntuacion,
              rangosNivel: [
                ...c.puntuacion.rangosNivel,
                { id: nuevoId("nivel"), nombre: "", min: 0, max: 0, color: "bg-surface-2" },
              ],
            },
          }
        : c
    );
  }

  function quitarRango(id: string) {
    if (!confirm("Eliminar este rango de nivel?")) return;
    setConfig((c) =>
      c
        ? { ...c, puntuacion: { ...c.puntuacion, rangosNivel: c.puntuacion.rangosNivel.filter((r) => r.id !== id) } }
        : c
    );
  }

  function actualizarRegla(id: string, cambios: Partial<ReglaCritica>) {
    setConfig((c) =>
      c
        ? {
            ...c,
            puntuacion: {
              ...c.puntuacion,
              reglasCriticas: c.puntuacion.reglasCriticas.map((r) =>
                r.id === id ? { ...r, ...cambios } : r
              ),
            },
          }
        : c
    );
  }

  function toggleOpcionRegla(reglaId: string, opcionId: string) {
    setConfig((c) => {
      if (!c) return c;
      return {
        ...c,
        puntuacion: {
          ...c.puntuacion,
          reglasCriticas: c.puntuacion.reglasCriticas.map((r) => {
            if (r.id !== reglaId) return r;
            const yaEsta = r.opcionIds.includes(opcionId);
            return {
              ...r,
              opcionIds: yaEsta ? r.opcionIds.filter((id) => id !== opcionId) : [...r.opcionIds, opcionId],
            };
          }),
        },
      };
    });
  }

  function agregarRegla() {
    const primeraPreguntaSeleccion = config?.preguntas.find((p) => p.tipo === "unica" || p.tipo === "multiple");
    const primerNivel = config?.puntuacion.rangosNivel[config.puntuacion.rangosNivel.length - 1];
    if (!primeraPreguntaSeleccion || !primerNivel) return;
    setConfig((c) =>
      c
        ? {
            ...c,
            puntuacion: {
              ...c.puntuacion,
              reglasCriticas: [
                ...c.puntuacion.reglasCriticas,
                {
                  id: nuevoId("regla"),
                  descripcion: "",
                  preguntaId: primeraPreguntaSeleccion.id,
                  opcionIds: [],
                  nivelForzado: primerNivel.id,
                },
              ],
            },
          }
        : c
    );
  }

  function quitarRegla(id: string) {
    if (!confirm("Eliminar esta regla critica?")) return;
    setConfig((c) =>
      c
        ? {
            ...c,
            puntuacion: {
              ...c.puntuacion,
              reglasCriticas: c.puntuacion.reglasCriticas.filter((r) => r.id !== id),
            },
          }
        : c
    );
  }

  async function guardar() {
    if (!config) return;
    setGuardando(true);
    setMensaje(null);
    try {
      if (!config.preguntas.length || !config.tiposDiscapacidad.length) {
        throw new Error("Debe haber al menos una pregunta y un tipo de discapacidad.");
      }
      if (!config.puntuacion.rangosNivel.length) {
        throw new Error("Debe haber al menos un rango de nivel.");
      }
      await guardarConfiguracion(config);
      setMensaje({ tipo: "ok", texto: "Configuracion guardada correctamente." });
    } catch (err) {
      setMensaje({ tipo: "error", texto: err instanceof Error ? err.message : "Error al guardar." });
    } finally {
      setGuardando(false);
    }
  }

  async function restaurar() {
    if (!confirm("Esto reemplaza TODA la configuracion actual por la oficial. Continuar?")) return;
    const demo = await restaurarConfiguracionDemo();
    setConfig(demo);
    setMensaje({ tipo: "ok", texto: "Configuracion oficial restaurada." });
  }

  function irAJson() {
    if (config) setTextoJson(JSON.stringify(config, null, 2));
    setModo("json");
  }

  function aplicarJson() {
    try {
      const parsed = JSON.parse(textoJson) as Configuracion;
      if (!Array.isArray(parsed.preguntas) || !Array.isArray(parsed.tiposDiscapacidad)) {
        throw new Error("Faltan 'preguntas' o 'tiposDiscapacidad'.");
      }
      if (!parsed.puntuacion?.rangosNivel?.length) {
        throw new Error("Faltan 'puntuacion.rangosNivel'.");
      }
      if (!parsed.puntuacion.reglasCriticas) parsed.puntuacion.reglasCriticas = [];
      setConfig(parsed);
      setMensaje({ tipo: "ok", texto: "Cambios del JSON aplicados. Revisa y guarda." });
      setModo("visual");
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err instanceof Error ? `JSON invalido: ${err.message}` : "JSON invalido.",
      });
    }
  }

  return (
    <main id="contenido" className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Configuracion</h1>
        <Link href="/admin">
          <Button variant="secondary" className="px-4 py-2 text-sm">
            Volver al panel
          </Button>
        </Link>
      </div>
      <p className="mt-2 text-ink-muted">
        Preguntas, opciones, puntos, rangos de nivel y tipos de discapacidad de la
        encuesta. Los cambios no se aplican hasta que toques &quot;Guardar cambios&quot;.
      </p>

      {mensaje && (
        <div className="mt-4">
          <Alert tono={mensaje.tipo === "ok" ? "ok" : "error"}>{mensaje.texto}</Alert>
        </div>
      )}

      {cargando || !config ? (
        <p className="mt-8 text-ink-muted">Cargando configuracion...</p>
      ) : modo === "json" ? (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Editor avanzado (JSON)</h2>
            <button
              onClick={() => setModo("visual")}
              className="font-medium text-brand underline underline-offset-2"
            >
              Volver al editor visual
            </button>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Solo para uso tecnico -- un error de formato puede romper la encuesta.
          </p>
          <TextArea
            value={textoJson}
            onChange={(e) => setTextoJson(e.target.value)}
            spellCheck={false}
            className="mt-3 h-[480px] w-full font-mono text-sm"
          />
          <Button onClick={aplicarJson} className="mt-3">
            Aplicar cambios del JSON
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-10">
          {/* ---------- Preguntas por seccion ---------- */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Preguntas ({config.preguntas.length})</h2>
              <button onClick={agregarSeccion} className="text-sm font-medium text-brand underline underline-offset-2">
                + Nueva seccion
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {secciones.map((seccion) => {
                const preguntasSeccion = config.preguntas.filter((p) => p.seccion === seccion);
                const abierta = seccionesAbiertas.has(seccion);
                return (
                  <div key={seccion} className="rounded-xl border border-line bg-surface">
                    <button
                      onClick={() => toggleSeccion(seccion)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      aria-expanded={abierta}
                    >
                      <span className="font-semibold text-ink">{seccion || "(sin nombre)"}</span>
                      <span className="text-sm text-ink-muted">
                        {preguntasSeccion.length} pregunta{preguntasSeccion.length === 1 ? "" : "s"}{" "}
                        {abierta ? "▲" : "▼"}
                      </span>
                    </button>

                    {abierta && (
                      <div className="flex flex-col gap-4 border-t border-line px-4 py-4">
                        {preguntasSeccion.map((p) => (
                          <div key={p.id} className="rounded-lg border border-line-strong bg-background p-4">
                            <div className="flex items-start justify-between gap-3">
                              <label className="min-w-0 flex-1">
                                <span className="text-sm font-medium text-ink-muted">Pregunta</span>
                                <TextArea
                                  value={p.texto}
                                  onChange={(e) => actualizarPregunta(p.id, { texto: e.target.value })}
                                  className="mt-1 w-full text-sm"
                                  rows={2}
                                />
                              </label>
                              <button
                                onClick={() => quitarPregunta(p.id)}
                                className="mt-6 shrink-0 text-sm font-medium text-danger underline underline-offset-2"
                              >
                                Eliminar
                              </button>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                              <label>
                                <span className="text-xs font-medium text-ink-muted">Tipo</span>
                                <select
                                  value={p.tipo}
                                  onChange={(e) => actualizarPregunta(p.id, { tipo: e.target.value as TipoPregunta })}
                                  className="mt-1 w-full rounded-lg border border-line-strong bg-surface px-2 py-2 text-sm text-ink"
                                >
                                  {TIPOS_PREGUNTA.map((t) => (
                                    <option key={t.value} value={t.value}>
                                      {t.etiqueta}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                <span className="text-xs font-medium text-ink-muted">Peso</span>
                                <TextInput
                                  type="number"
                                  step="0.1"
                                  value={p.peso}
                                  onChange={(e) => actualizarPregunta(p.id, { peso: Number(e.target.value) })}
                                  className="mt-1 w-full py-2 text-sm"
                                />
                              </label>
                              <label className="col-span-2">
                                <span className="text-xs font-medium text-ink-muted">Categoria (opcional)</span>
                                <TextInput
                                  value={p.categoria}
                                  onChange={(e) => actualizarPregunta(p.id, { categoria: e.target.value })}
                                  className="mt-1 w-full py-2 text-sm"
                                />
                              </label>
                            </div>

                            {(p.tipo === "unica" || p.tipo === "multiple") && (
                              <div className="mt-3">
                                <span className="text-xs font-medium text-ink-muted">
                                  Opciones y puntos que otorgan
                                </span>
                                <div className="mt-1 flex flex-col gap-2">
                                  {p.opciones.map((o) => (
                                    <div key={o.id} className="flex items-center gap-2">
                                      <TextInput
                                        value={o.texto}
                                        onChange={(e) => actualizarOpcion(p.id, o.id, { texto: e.target.value })}
                                        placeholder="Texto de la opcion"
                                        className="min-w-0 flex-1 py-2 text-sm"
                                      />
                                      <TextInput
                                        type="number"
                                        step="0.1"
                                        value={o.puntos}
                                        onChange={(e) =>
                                          actualizarOpcion(p.id, o.id, { puntos: Number(e.target.value) })
                                        }
                                        title="Puntos"
                                        className="w-20 py-2 text-sm"
                                      />
                                      <button
                                        onClick={() => quitarOpcion(p.id, o.id)}
                                        aria-label="Quitar opcion"
                                        className="text-danger"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => agregarOpcion(p.id)}
                                    className="self-start text-sm font-medium text-brand underline underline-offset-2"
                                  >
                                    + Agregar opcion
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="mt-3">
                              <span className="text-xs font-medium text-ink-muted">
                                Mostrar solo si la discapacidad es (vacio = siempre visible)
                              </span>
                              <div className="mt-1 flex flex-wrap gap-3">
                                {config.tiposDiscapacidad.map((t) => (
                                  <label key={t.id} className="flex items-center gap-1.5 text-sm text-ink">
                                    <input
                                      type="checkbox"
                                      checked={(p.mostrarSiDiscapacidad ?? []).includes(t.id)}
                                      onChange={() => toggleFiltroDiscapacidad(p.id, t.id)}
                                      className="accent-brand"
                                    />
                                    {t.etiqueta || "(sin nombre)"}
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => agregarPregunta(seccion)}
                          className="self-start text-sm font-medium text-brand underline underline-offset-2"
                        >
                          + Agregar pregunta a esta seccion
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- Tipos de discapacidad ---------- */}
          <section>
            <h2 className="text-lg font-semibold text-ink">Tipos de discapacidad</h2>
            <div className="mt-3 flex flex-col gap-2">
              {config.tiposDiscapacidad.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <TextInput
                    value={t.etiqueta}
                    onChange={(e) => actualizarTipoDiscapacidad(t.id, { etiqueta: e.target.value })}
                    className="min-w-0 flex-1"
                  />
                  <button onClick={() => quitarTipoDiscapacidad(t.id)} className="text-sm font-medium text-danger underline underline-offset-2">
                    Eliminar
                  </button>
                </div>
              ))}
              <button onClick={agregarTipoDiscapacidad} className="self-start text-sm font-medium text-brand underline underline-offset-2">
                + Agregar tipo de discapacidad
              </button>
            </div>
          </section>

          {/* ---------- Puntuacion y rangos de nivel ---------- */}
          <section>
            <h2 className="text-lg font-semibold text-ink">Puntuacion y rangos de nivel</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <label>
                <span className="text-sm font-medium text-ink-muted">Direccion</span>
                <select
                  value={config.puntuacion.direccion}
                  onChange={(e) => actualizarPuntuacion({ direccion: e.target.value as DireccionPuntaje })}
                  className="mt-1 w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink"
                >
                  <option value="mayor_es_mas_vulnerable">Mayor puntaje = mas vulnerable</option>
                  <option value="menor_es_mas_vulnerable">Menor puntaje = mas vulnerable</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-medium text-ink-muted">Puntaje minimo</span>
                <TextInput
                  type="number"
                  value={config.puntuacion.puntajeMinimo}
                  onChange={(e) => actualizarPuntuacion({ puntajeMinimo: Number(e.target.value) })}
                  className="mt-1 w-full"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-ink-muted">Puntaje maximo</span>
                <TextInput
                  type="number"
                  value={config.puntuacion.puntajeMaximo}
                  onChange={(e) => actualizarPuntuacion({ puntajeMaximo: Number(e.target.value) })}
                  className="mt-1 w-full"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <span className="text-sm font-medium text-ink-muted">Rangos de nivel</span>
              {config.puntuacion.rangosNivel.map((r) => (
                <div key={r.id} className="grid grid-cols-2 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                  <TextInput
                    value={r.nombre}
                    onChange={(e) => actualizarRango(r.id, { nombre: e.target.value })}
                    placeholder="Nombre del nivel"
                    className="text-sm"
                  />
                  <TextInput
                    type="number"
                    value={r.min}
                    onChange={(e) => actualizarRango(r.id, { min: Number(e.target.value) })}
                    title="Minimo"
                    className="text-sm"
                  />
                  <TextInput
                    type="number"
                    value={r.max}
                    onChange={(e) => actualizarRango(r.id, { max: Number(e.target.value) })}
                    title="Maximo"
                    className="text-sm"
                  />
                  <TextInput
                    value={r.color}
                    onChange={(e) => actualizarRango(r.id, { color: e.target.value })}
                    title="Clase de color (Tailwind)"
                    className="text-sm"
                  />
                  <button onClick={() => quitarRango(r.id)} className="text-sm font-medium text-danger underline underline-offset-2">
                    Eliminar
                  </button>
                </div>
              ))}
              <button onClick={agregarRango} className="self-start text-sm font-medium text-brand underline underline-offset-2">
                + Agregar rango de nivel
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <span className="text-sm font-medium text-ink-muted">
                Reglas criticas (fuerzan un nivel sin importar el puntaje)
              </span>
              <p className="text-xs text-ink-muted">
                Si el encuestado elige alguna de las opciones marcadas, el nivel del caso se
                fuerza al nivel indicado, aunque el puntaje total de por si de otro nivel mas bajo.
              </p>
              {config.puntuacion.reglasCriticas.map((r) => {
                const preguntaRegla = config.preguntas.find((p) => p.id === r.preguntaId);
                return (
                  <div key={r.id} className="rounded-lg border border-line-strong bg-background p-3">
                    <div className="flex items-start justify-between gap-3">
                      <TextInput
                        value={r.descripcion}
                        onChange={(e) => actualizarRegla(r.id, { descripcion: e.target.value })}
                        placeholder="Descripcion (ej. 'No puede conseguir sus medicamentos')"
                        className="min-w-0 flex-1 text-sm"
                      />
                      <button
                        onClick={() => quitarRegla(r.id)}
                        className="shrink-0 text-sm font-medium text-danger underline underline-offset-2"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <label>
                        <span className="text-xs font-medium text-ink-muted">Pregunta</span>
                        <select
                          value={r.preguntaId}
                          onChange={(e) => actualizarRegla(r.id, { preguntaId: e.target.value, opcionIds: [] })}
                          className="mt-1 w-full rounded-lg border border-line-strong bg-surface px-2 py-2 text-sm text-ink"
                        >
                          {config.preguntas
                            .filter((p) => p.tipo === "unica" || p.tipo === "multiple")
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.texto || "(sin texto)"}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label>
                        <span className="text-xs font-medium text-ink-muted">Nivel forzado</span>
                        <select
                          value={r.nivelForzado}
                          onChange={(e) => actualizarRegla(r.id, { nivelForzado: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-line-strong bg-surface px-2 py-2 text-sm text-ink"
                        >
                          {config.puntuacion.rangosNivel.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.nombre || "(sin nombre)"}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {preguntaRegla && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-ink-muted">
                          Opciones que disparan la regla
                        </span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {preguntaRegla.opciones.map((o) => (
                            <label
                              key={o.id}
                              className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
                            >
                              <input
                                type="checkbox"
                                checked={r.opcionIds.includes(o.id)}
                                onChange={() => toggleOpcionRegla(r.id, o.id)}
                                className="h-4 w-4 accent-brand"
                              />
                              {o.texto || "(sin texto)"}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <button onClick={agregarRegla} className="self-start text-sm font-medium text-brand underline underline-offset-2">
                + Agregar regla critica
              </button>
            </div>
          </section>

          <div className="sticky bottom-0 -mx-6 flex flex-wrap items-center gap-3 border-t border-line bg-background px-6 py-4">
            <Button onClick={guardar} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button variant="secondary" onClick={restaurar} disabled={guardando}>
              Restaurar configuracion oficial
            </Button>
            <button onClick={irAJson} className="ml-auto text-sm font-medium text-ink-muted underline underline-offset-2">
              Editor avanzado (JSON)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
