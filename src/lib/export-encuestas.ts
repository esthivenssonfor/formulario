import * as XLSX from "xlsx";
import { obtenerConfiguracion, listarEncuestas } from "./storage";
import { calcularPrioridades } from "./scoring";
import { compartirArchivoBase64, abrirArchivoBase64 } from "./file-export";
import type { Configuracion, Encuesta } from "./types";

const MIME_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function discapacidadDe(e: Encuesta): string {
  return e.respuestas.find((r) => r.preguntaId === "q_discapacidad_detalle")?.valorTexto || "-";
}

function nivelDe(e: Encuesta, config: Configuracion) {
  return config.puntuacion.rangosNivel.find((r) => r.id === e.nivelId);
}

/** Trae encuestas+configuracion frescas de Supabase y arma el libro Excel
 * -- comun a exportar (compartir) y abrir. */
async function generarLibroEncuestas(): Promise<{ nombreArchivo: string; base64: string; cantidad: number }> {
  const [config, encuestas] = await Promise.all([obtenerConfiguracion(), listarEncuestas()]);
  const prioridades = calcularPrioridades(encuestas, config);
  const filas = [...encuestas].sort(
    (a, b) => (prioridades.get(a.id) ?? 0) - (prioridades.get(b.id) ?? 0)
  );

  const filasExcel = filas.map((e) => ({
    Prioridad: prioridades.get(e.id),
    Encuestador: e.encuestador,
    Encuestado: e.participante,
    Cedula: e.cedula ?? "",
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
  const base64 = XLSX.write(libro, { bookType: "xlsx", type: "base64" }) as string;
  const fechaArchivo = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, sin caracteres problematicos

  return { nombreArchivo: `encuestas_${fechaArchivo}.xlsx`, base64, cantidad: filas.length };
}

/**
 * "Exportar Excel" -- COMPARTIR: manda el archivo a otra app (WhatsApp,
 * Gmail, Drive...). Se usa desde el panel de encuestas y desde la alerta
 * de almacenamiento. Devuelve la cantidad de encuestas exportadas.
 */
export async function exportarEncuestasExcel(): Promise<number> {
  const { nombreArchivo, base64, cantidad } = await generarLibroEncuestas();
  await compartirArchivoBase64(nombreArchivo, base64, MIME_XLSX);
  return cantidad;
}

/**
 * "Abrir Excel" -- el usuario elige con que app VER el archivo el mismo
 * (Sheets, Excel, WPS...) en vez de mandarlo a otra persona.
 */
export async function abrirEncuestasExcel(): Promise<number> {
  const { nombreArchivo, base64, cantidad } = await generarLibroEncuestas();
  await abrirArchivoBase64(nombreArchivo, base64, MIME_XLSX);
  return cantidad;
}
