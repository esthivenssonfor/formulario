import * as XLSX from "xlsx";
import { obtenerConfiguracion, listarEncuestas } from "./storage";
import { calcularPrioridades } from "./scoring";
import type { Configuracion, Encuesta } from "./types";

function discapacidadDe(e: Encuesta): string {
  return e.respuestas.find((r) => r.preguntaId === "q_discapacidad_detalle")?.valorTexto || "-";
}

function nivelDe(e: Encuesta, config: Configuracion) {
  return config.puntuacion.rangosNivel.find((r) => r.id === e.nivelId);
}

/**
 * Trae encuestas+configuracion frescas de Supabase y genera el mismo Excel
 * que el boton "Exportar Excel" del panel de encuestas -- se usa tambien
 * desde la alerta de almacenamiento, que puede dispararse en cualquier
 * pantalla del panel admin. Devuelve la cantidad de encuestas exportadas.
 */
export async function exportarEncuestasExcel(): Promise<number> {
  const [config, encuestas] = await Promise.all([obtenerConfiguracion(), listarEncuestas()]);
  const prioridades = calcularPrioridades(encuestas, config);
  const filas = [...encuestas].sort(
    (a, b) => (prioridades.get(a.id) ?? 0) - (prioridades.get(b.id) ?? 0)
  );

  const filasExcel = filas.map((e) => ({
    Prioridad: prioridades.get(e.id),
    Encuestador: e.encuestador,
    Encuestado: e.participante,
    Edad: e.edad ?? "",
    Discapacidad: discapacidadDe(e),
    Puntaje: e.puntajeTotal,
    Nivel: nivelDe(e, config)?.nombre ?? "",
    "Factores criticos": e.factoresCriticos.join("; "),
    Fecha: new Date(e.fecha).toLocaleString("es"),
  }));

  const hoja = XLSX.utils.json_to_sheet(filasExcel);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Encuestas");
  XLSX.writeFile(libro, "encuestas_vulnerabilidad.xlsx");

  return filas.length;
}
