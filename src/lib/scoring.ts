import type {
  Configuracion,
  Encuesta,
  Pregunta,
  RespuestaPregunta,
} from "./types";

/** Preguntas visibles para una discapacidad segun mostrarSiDiscapacidad. */
export function preguntasVisibles(
  preguntas: Pregunta[],
  discapacidad: string
): Pregunta[] {
  return preguntas.filter(
    (p) => !p.mostrarSiDiscapacidad?.length || p.mostrarSiDiscapacidad.includes(discapacidad)
  );
}

/** Puntos de una respuesta = suma de puntos de las opciones elegidas * peso de la pregunta. */
export function calcularPuntosRespuesta(pregunta: Pregunta, opcionIds: string[]): number {
  const base = pregunta.opciones
    .filter((o) => opcionIds.includes(o.id))
    .reduce((acc, o) => acc + o.puntos, 0);
  return base * pregunta.peso;
}

export function calcularPuntajeTotal(respuestas: RespuestaPregunta[]): number {
  return respuestas.reduce((acc, r) => acc + r.puntos, 0);
}

/** El rango de nivel se busca directamente por el puntaje total, sin importar la direccion. */
export function calcularNivel(puntaje: number, config: Configuracion): string | null {
  const rango = config.puntuacion.rangosNivel.find(
    (r) => puntaje >= r.min && puntaje <= r.max
  );
  return rango?.id ?? null;
}

/**
 * Calcula la prioridad (1 = primero a atender) de cada encuesta segun la direccion
 * configurada. No asume que "mas puntos = mas vulnerable": eso es una decision
 * de configuracion (direccion), no del algoritmo.
 */
export function calcularPrioridades(
  encuestas: Encuesta[],
  config: Configuracion
): Map<string, number> {
  const ordenadas = [...encuestas].sort((a, b) =>
    config.puntuacion.direccion === "mayor_es_mas_vulnerable"
      ? b.puntajeTotal - a.puntajeTotal
      : a.puntajeTotal - b.puntajeTotal
  );
  const prioridades = new Map<string, number>();
  ordenadas.forEach((e, idx) => prioridades.set(e.id, idx + 1));
  return prioridades;
}
