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
function nivelPorPuntaje(puntaje: number, config: Configuracion): string | null {
  const rango = config.puntuacion.rangosNivel.find(
    (r) => puntaje >= r.min && puntaje <= r.max
  );
  return rango?.id ?? null;
}

/**
 * Revisa las reglas criticas configuradas contra las respuestas dadas.
 * Una regla se dispara si el encuestado eligio alguna de sus opciones
 * criticas. Si varias reglas se disparan, gana la que apunte al nivel mas
 * severo (el ultimo de la lista rangosNivel, de menos a mas vulnerable).
 */
function reglasDisparadas(
  respuestas: RespuestaPregunta[],
  config: Configuracion
): { nivelId: string; descripciones: string[] } | null {
  const disparadas = config.puntuacion.reglasCriticas.filter((regla) => {
    const respuesta = respuestas.find((r) => r.preguntaId === regla.preguntaId);
    return respuesta?.opcionIds.some((id) => regla.opcionIds.includes(id));
  });
  if (disparadas.length === 0) return null;

  const ordenSeveridad = config.puntuacion.rangosNivel.map((r) => r.id);
  const nivelId = disparadas.reduce((masSevero, regla) => {
    const idxActual = ordenSeveridad.indexOf(regla.nivelForzado);
    const idxMasSevero = ordenSeveridad.indexOf(masSevero);
    return idxActual > idxMasSevero ? regla.nivelForzado : masSevero;
  }, disparadas[0].nivelForzado);

  return { nivelId, descripciones: disparadas.map((r) => r.descripcion) };
}

/**
 * Calcula el nivel de vulnerabilidad final: primero revisa si alguna regla
 * critica se disparo (esas mandan siempre), y si no, usa el puntaje total.
 * El encuestador nunca elige el nivel a mano -- siempre sale de aca.
 */
export function calcularNivelYFactores(
  puntaje: number,
  respuestas: RespuestaPregunta[],
  config: Configuracion
): { nivelId: string | null; factoresCriticos: string[] } {
  const critico = reglasDisparadas(respuestas, config);
  if (critico) return { nivelId: critico.nivelId, factoresCriticos: critico.descripciones };
  return { nivelId: nivelPorPuntaje(puntaje, config), factoresCriticos: [] };
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
