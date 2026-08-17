import { guardarEncuesta } from "./storage";
import type { Encuesta } from "./types";

// Cola de encuestas pendientes de sincronizar cuando no hay conexion (uso
// tipico: trabajo de campo sin señal). Vive en localStorage -- funciona
// igual en la web y dentro del WebView de la app Android (Capacitor),
// sobrevive a cerrar la pestaña/app. No es a prueba de "borrar datos del
// navegador", pero cubre el caso real: sin señal ahora, con señal despues.
const CLAVE_COLA = "fundimopla_encuestas_pendientes";

function leerCola(): Encuesta[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CLAVE_COLA) ?? "[]") as Encuesta[];
  } catch {
    return [];
  }
}

function escribirCola(cola: Encuesta[]): void {
  localStorage.setItem(CLAVE_COLA, JSON.stringify(cola));
}

export function contarPendientes(): number {
  return leerCola().length;
}

/**
 * Intenta guardar directo en Supabase. Si falla (sin conexion, timeout,
 * etc.) la deja en la cola local en vez de perder la encuesta ya
 * completada -- se reintenta sola mas adelante.
 */
export async function guardarEncuestaConCola(
  encuesta: Encuesta
): Promise<{ sincronizada: boolean }> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    escribirCola([...leerCola(), encuesta]);
    return { sincronizada: false };
  }
  try {
    await guardarEncuesta(encuesta);
    return { sincronizada: true };
  } catch {
    escribirCola([...leerCola(), encuesta]);
    return { sincronizada: false };
  }
}

/** Reintenta enviar todo lo pendiente. Se puede llamar seguido -- no hace nada si la cola esta vacia. */
export async function sincronizarPendientes(): Promise<{ enviadas: number; pendientes: number }> {
  const cola = leerCola();
  if (cola.length === 0) return { enviadas: 0, pendientes: 0 };

  const siguenPendientes: Encuesta[] = [];
  let enviadas = 0;
  for (const encuesta of cola) {
    try {
      await guardarEncuesta(encuesta);
      enviadas++;
    } catch {
      siguenPendientes.push(encuesta);
    }
  }
  escribirCola(siguenPendientes);
  return { enviadas, pendientes: siguenPendientes.length };
}

/**
 * Registra reintento automatico: al recuperar conexion y cada cierto
 * tiempo mientras haya señal. Devuelve una funcion para des-registrar
 * (limpieza en useEffect).
 */
export function iniciarSincronizacionAutomatica(
  onCambio?: (estado: { enviadas: number; pendientes: number }) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  async function intentar() {
    const resultado = await sincronizarPendientes();
    if (resultado.enviadas > 0) onCambio?.(resultado);
  }

  window.addEventListener("online", intentar);
  const intervalo = window.setInterval(intentar, 60_000);
  intentar();

  return () => {
    window.removeEventListener("online", intentar);
    window.clearInterval(intervalo);
  };
}
