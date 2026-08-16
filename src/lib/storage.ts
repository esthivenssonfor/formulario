import { CONFIGURACION_DEMO } from "./demo-data";
import type { Configuracion, Encuesta } from "./types";

// Adaptador de persistencia. Implementacion actual: localStorage (funciona sin
// backend, ideal para el prototipo DEMO). Cuando exista el proyecto Supabase
// real, se reemplaza por un adaptador que hable con Postgres via
// @supabase/supabase-js, respetando la misma forma (guardarEncuesta,
// listarEncuestas, obtenerConfiguracion, guardarConfiguracion) para que el
// resto de la app no cambie.

const KEY_ENCUESTAS = "sev_encuestas_v1";
const KEY_CONFIG = "sev_configuracion_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function obtenerConfiguracion(): Configuracion {
  if (!isBrowser()) return CONFIGURACION_DEMO;
  const raw = window.localStorage.getItem(KEY_CONFIG);
  if (!raw) return CONFIGURACION_DEMO;
  try {
    return JSON.parse(raw) as Configuracion;
  } catch {
    return CONFIGURACION_DEMO;
  }
}

export function guardarConfiguracion(config: Configuracion): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY_CONFIG, JSON.stringify(config));
}

export function restaurarConfiguracionDemo(): Configuracion {
  guardarConfiguracion(CONFIGURACION_DEMO);
  return CONFIGURACION_DEMO;
}

export function listarEncuestas(): Encuesta[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(KEY_ENCUESTAS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Encuesta[];
  } catch {
    return [];
  }
}

export function guardarEncuesta(encuesta: Encuesta): void {
  if (!isBrowser()) return;
  const actuales = listarEncuestas();
  window.localStorage.setItem(
    KEY_ENCUESTAS,
    JSON.stringify([...actuales, encuesta])
  );
}

export function obtenerEncuesta(id: string): Encuesta | undefined {
  return listarEncuestas().find((e) => e.id === id);
}
