import { supabase } from "./supabase-client";
import { CONFIGURACION_DEMO } from "./demo-data";
import type { Configuracion, Encuesta, Pregunta, RespuestaPregunta } from "./types";

// Adaptador de persistencia real: habla con Postgres via @supabase/supabase-js
// (ver supabase/schema.sql para las tablas y RLS). obtenerConfiguracion() es
// publica (RLS permite select anonimo); guardarConfiguracion() y la lectura
// de encuestas/respuestas requieren sesion de Supabase Auth (panel admin).

export async function obtenerConfiguracion(): Promise<Configuracion> {
  const [tiposRes, preguntasRes, opcionesRes, rangosRes, puntuacionRes] = await Promise.all([
    supabase.from("tipos_discapacidad").select("*"),
    supabase.from("preguntas").select("*").order("orden"),
    supabase.from("opciones_pregunta").select("*").order("orden"),
    supabase.from("rangos_nivel").select("*").order("min"),
    supabase.from("configuracion_puntuacion").select("*").maybeSingle(),
  ]);
  for (const res of [tiposRes, preguntasRes, opcionesRes, rangosRes, puntuacionRes]) {
    if (res.error) throw res.error;
  }

  const preguntas: Pregunta[] = (preguntasRes.data ?? []).map((p) => ({
    id: p.id,
    texto: p.texto,
    categoria: p.categoria,
    seccion: p.seccion,
    peso: Number(p.peso),
    tipo: p.tipo,
    mostrarSiDiscapacidad: p.mostrar_si_discapacidad ?? undefined,
    opciones: (opcionesRes.data ?? [])
      .filter((o) => o.pregunta_id === p.id)
      .map((o) => ({ id: o.id, texto: o.texto, puntos: Number(o.puntos) })),
  }));

  return {
    demo: false,
    tiposDiscapacidad: (tiposRes.data ?? []).map((t) => ({ id: t.id, etiqueta: t.etiqueta })),
    preguntas,
    puntuacion: {
      direccion: puntuacionRes.data?.direccion ?? "mayor_es_mas_vulnerable",
      puntajeMinimo: Number(puntuacionRes.data?.puntaje_minimo ?? 0),
      puntajeMaximo: Number(puntuacionRes.data?.puntaje_maximo ?? 100),
      rangosNivel: (rangosRes.data ?? []).map((r) => ({
        id: r.id,
        nombre: r.nombre,
        min: Number(r.min),
        max: Number(r.max),
        color: r.color,
      })),
    },
  };
}

/**
 * Reemplaza las tablas de configuracion para que coincidan con `config`.
 * Requiere sesion autenticada (RLS). No toca encuestas/respuestas.
 */
export async function guardarConfiguracion(config: Configuracion): Promise<void> {
  // tipos_discapacidad: borrar los que ya no estan, upsert el resto.
  const tipoIds = config.tiposDiscapacidad.map((t) => t.id);
  await supabase.from("tipos_discapacidad").delete().not("id", "in", `(${sqlList(tipoIds)})`);
  if (config.tiposDiscapacidad.length > 0) {
    const { error } = await supabase.from("tipos_discapacidad").upsert(config.tiposDiscapacidad);
    if (error) throw error;
  }

  // preguntas + opciones_pregunta
  const preguntaIds = config.preguntas.map((p) => p.id);
  await supabase.from("preguntas").delete().not("id", "in", `(${sqlList(preguntaIds)})`);
  if (config.preguntas.length > 0) {
    const { error } = await supabase.from("preguntas").upsert(
      config.preguntas.map((p, idx) => ({
        id: p.id,
        texto: p.texto,
        categoria: p.categoria,
        seccion: p.seccion,
        peso: p.peso,
        tipo: p.tipo,
        mostrar_si_discapacidad: p.mostrarSiDiscapacidad ?? null,
        orden: idx,
      }))
    );
    if (error) throw error;
  }

  const todasLasOpciones = config.preguntas.flatMap((p, pIdx) =>
    p.opciones.map((o, oIdx) => ({
      id: o.id,
      pregunta_id: p.id,
      texto: o.texto,
      puntos: o.puntos,
      orden: oIdx + pIdx * 1000,
    }))
  );
  if (preguntaIds.length > 0) {
    await supabase.from("opciones_pregunta").delete().in("pregunta_id", preguntaIds);
  }
  if (todasLasOpciones.length > 0) {
    const { error } = await supabase.from("opciones_pregunta").insert(todasLasOpciones);
    if (error) throw error;
  }

  // rangos_nivel
  const rangoIds = config.puntuacion.rangosNivel.map((r) => r.id);
  await supabase.from("rangos_nivel").delete().not("id", "in", `(${sqlList(rangoIds)})`);
  if (config.puntuacion.rangosNivel.length > 0) {
    const { error } = await supabase.from("rangos_nivel").upsert(config.puntuacion.rangosNivel);
    if (error) throw error;
  }

  // configuracion_puntuacion (fila unica)
  const { error: puntuacionError } = await supabase.from("configuracion_puntuacion").upsert({
    id: true,
    direccion: config.puntuacion.direccion,
    puntaje_minimo: config.puntuacion.puntajeMinimo,
    puntaje_maximo: config.puntuacion.puntajeMaximo,
  });
  if (puntuacionError) throw puntuacionError;
}

function sqlList(ids: string[]): string {
  // lista para "not in (...)"; con la lista vacia se borra todo (WHERE true).
  if (ids.length === 0) return "''";
  return ids.map((id) => `'${id.replace(/'/g, "''")}'`).join(",");
}

export async function restaurarConfiguracionDemo(): Promise<Configuracion> {
  await guardarConfiguracion(CONFIGURACION_DEMO);
  return CONFIGURACION_DEMO;
}

export async function listarEncuestas(): Promise<Encuesta[]> {
  const { data: encuestasData, error: encuestasError } = await supabase
    .from("encuestas")
    .select("*")
    .order("fecha", { ascending: false });
  if (encuestasError) throw encuestasError;

  const { data: respuestasData, error: respuestasError } = await supabase
    .from("respuestas")
    .select("*");
  if (respuestasError) throw respuestasError;

  return (encuestasData ?? []).map((e) => ({
    id: e.id,
    participante: e.participante,
    edad: e.edad,
    discapacidad: e.discapacidad,
    fecha: e.fecha,
    puntajeTotal: Number(e.puntaje_total),
    nivelId: e.nivel_id,
    prioridad: null,
    respuestas: (respuestasData ?? [])
      .filter((r) => r.encuesta_id === e.id)
      .map(
        (r): RespuestaPregunta => ({
          preguntaId: r.pregunta_id,
          opcionIds: r.opcion_ids ?? [],
          valorTexto: r.valor_texto ?? undefined,
          puntos: Number(r.puntos),
        })
      ),
  }));
}

export async function guardarEncuesta(encuesta: Encuesta): Promise<void> {
  const { error: encuestaError } = await supabase.from("encuestas").insert({
    id: encuesta.id,
    participante: encuesta.participante,
    edad: encuesta.edad,
    discapacidad: encuesta.discapacidad,
    fecha: encuesta.fecha,
    puntaje_total: encuesta.puntajeTotal,
    nivel_id: encuesta.nivelId,
  });
  if (encuestaError) throw encuestaError;

  if (encuesta.respuestas.length > 0) {
    const { error: respuestasError } = await supabase.from("respuestas").insert(
      encuesta.respuestas.map((r) => ({
        encuesta_id: encuesta.id,
        pregunta_id: r.preguntaId,
        opcion_ids: r.opcionIds,
        valor_texto: r.valorTexto ?? null,
        puntos: r.puntos,
      }))
    );
    if (respuestasError) throw respuestasError;
  }
}

export async function obtenerEncuesta(id: string): Promise<Encuesta | undefined> {
  const encuestas = await listarEncuestas();
  return encuestas.find((e) => e.id === id);
}
