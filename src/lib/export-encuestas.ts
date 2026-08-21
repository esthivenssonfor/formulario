import ExcelJS from "exceljs";
import { obtenerConfiguracion, listarEncuestas } from "./storage";
import { calcularPrioridades } from "./scoring";
import { compartirArchivoBase64, abrirArchivoBase64, bytesABase64 } from "./file-export";
import { supabase } from "./supabase-client";
import type { Configuracion, Encuesta } from "./types";

const MIME_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const BUCKET_IDENTIFICACION = "identificacion";

const ETIQUETAS_FOTO: Record<string, string> = {
  cedula_frontal: "Cedula frontal",
  cedula_posterior: "Cedula posterior",
  foto_participante: "Foto participante",
};
const ORDEN_FOTO = ["cedula_frontal", "cedula_posterior", "foto_participante"] as const;

const ALTO_FILA_CON_FOTO = 90; // puntos -- suficiente para que la miniatura no quede recortada
const LADO_MINIATURA = 110; // px

function discapacidadDe(e: Encuesta): string {
  return e.respuestas.find((r) => r.preguntaId === "q_discapacidad_detalle")?.valorTexto || "-";
}

function nivelDe(e: Encuesta, config: Configuracion) {
  return config.puntuacion.rangosNivel.find((r) => r.id === e.nivelId);
}

interface FotoEncuesta {
  encuestaId: string;
  tipo: string;
  storagePath: string;
}

/** Trae encuesta_fotos para todas las encuestas de una sola consulta (en
 * vez de una por encuesta) para no multiplicar los round-trips en
 * exportaciones grandes. */
async function obtenerFotosDe(encuestaIds: string[]): Promise<FotoEncuesta[]> {
  if (encuestaIds.length === 0) return [];
  const { data, error } = await supabase
    .from("encuesta_fotos")
    .select("encuesta_id, tipo, storage_path")
    .in("encuesta_id", encuestaIds);
  if (error) throw error;
  return (data ?? []).map((f) => ({
    encuestaId: f.encuesta_id as string,
    tipo: f.tipo as string,
    storagePath: f.storage_path as string,
  }));
}

/** Descarga el binario de una foto del bucket privado "identificacion" via
 * URL firmada (RLS exige is_admin(), ver
 * supabase/migrations/0009_identificacion_y_fotos.sql) y lo deja en base64
 * -- exceljs.addImage acepta base64 directo, evitando depender de Buffer
 * de Node (no existe en el WebView/navegador). */
async function descargarFotoBase64(storagePath: string): Promise<string | null> {
  const { data: firmada } = await supabase.storage.from(BUCKET_IDENTIFICACION).createSignedUrl(storagePath, 300);
  if (!firmada) return null;
  const res = await fetch(firmada.signedUrl);
  if (!res.ok) return null;
  const bytes = new Uint8Array(await res.arrayBuffer());
  return bytesABase64(bytes);
}

/** Trae encuestas+configuracion frescas de Supabase y arma el libro Excel
 * -- comun a exportar (compartir) y abrir. Incluye las fotos de
 * identificacion (cedula frontal/posterior, foto del participante) como
 * imagenes incrustadas junto a cada fila, no solo texto/links. */
async function generarLibroEncuestas(): Promise<{ nombreArchivo: string; base64: string; cantidad: number }> {
  const [config, encuestas] = await Promise.all([obtenerConfiguracion(), listarEncuestas()]);
  const prioridades = calcularPrioridades(encuestas, config);
  const filas = [...encuestas].sort(
    (a, b) => (prioridades.get(a.id) ?? 0) - (prioridades.get(b.id) ?? 0)
  );

  const fotos = await obtenerFotosDe(filas.map((e) => e.id));
  const fotosPorEncuesta = new Map<string, FotoEncuesta[]>();
  for (const f of fotos) {
    const lista = fotosPorEncuesta.get(f.encuestaId) ?? [];
    lista.push(f);
    fotosPorEncuesta.set(f.encuestaId, lista);
  }

  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet("Encuestas");

  hoja.columns = [
    { header: "Prioridad", key: "prioridad", width: 10 },
    { header: "Encuestador", key: "encuestador", width: 20 },
    { header: "Encuestado", key: "encuestado", width: 20 },
    { header: "Cedula", key: "cedula", width: 16 },
    { header: "Edad", key: "edad", width: 8 },
    { header: "Discapacidad", key: "discapacidad", width: 20 },
    { header: "Puntaje", key: "puntaje", width: 10 },
    { header: "Nivel", key: "nivel", width: 12 },
    { header: "Factores criticos", key: "factores", width: 30 },
    { header: "Fecha", key: "fecha", width: 20 },
    ...ORDEN_FOTO.map((tipo) => ({ header: ETIQUETAS_FOTO[tipo], key: tipo, width: 18 })),
  ];
  hoja.getRow(1).font = { bold: true };

  for (const e of filas) {
    const fila = hoja.addRow({
      prioridad: prioridades.get(e.id),
      encuestador: e.encuestador,
      encuestado: e.participante,
      cedula: e.cedula ?? "",
      edad: e.edad ?? "",
      discapacidad: discapacidadDe(e),
      puntaje: e.puntajeTotal,
      nivel: nivelDe(e, config)?.nombre ?? "",
      factores: e.factoresCriticos.join("; "),
      fecha: new Date(e.fecha).toLocaleString("es"),
    });
    fila.height = ALTO_FILA_CON_FOTO;

    const fotosFila = fotosPorEncuesta.get(e.id) ?? [];
    for (const tipo of ORDEN_FOTO) {
      const foto = fotosFila.find((f) => f.tipo === tipo);
      if (!foto) continue;
      const base64Foto = await descargarFotoBase64(foto.storagePath);
      if (!base64Foto) continue;
      const imagenId = libro.addImage({ base64: base64Foto, extension: "jpeg" });
      const columna = hoja.getColumn(tipo).number - 1; // addImage usa indice de columna base 0
      hoja.addImage(imagenId, {
        tl: { col: columna, row: fila.number - 1 },
        ext: { width: LADO_MINIATURA, height: LADO_MINIATURA },
        editAs: "oneCell",
      });
    }
  }

  const buffer = (await libro.xlsx.writeBuffer()) as unknown as ArrayBuffer;
  const base64 = bytesABase64(new Uint8Array(buffer));
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
