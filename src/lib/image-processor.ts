// Redimensiona + comprime una foto en el navegador (canvas) antes de
// guardarla/subirla -- espejo de flutter/lib/services/image_processor.dart.
// Apunta a 300-800 KB via calidad JPEG decreciente, sin bajar de una
// calidad minima legible (si con esa calidad sigue pesando mas, se deja
// mas grande en vez de sacrificar legibilidad).

const OBJETIVO_MAX_BYTES = 800 * 1024;
const CALIDAD_MINIMA = 0.55;

export type TipoFoto = "cedula_frontal" | "cedula_posterior" | "foto_participante";

export function nombreArchivo(tipo: TipoFoto): string {
  return `${tipo}.jpg`;
}

async function cargarImagen(archivo: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(archivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasABlob(canvas: HTMLCanvasElement, calidad: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo codificar la imagen."))),
      "image/jpeg",
      calidad
    );
  });
}

async function procesar(archivo: Blob, ladoMayorMax: number): Promise<Blob> {
  const img = await cargarImagen(archivo);
  const ladoMayor = Math.max(img.width, img.height);
  const escala = ladoMayor > ladoMayorMax ? ladoMayorMax / ladoMayor : 1;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen (canvas no disponible).");
  // dibujar en un canvas nuevo y reencodear como JPEG descarta metadatos
  // (EXIF/GPS) que no hacen falta para este uso.
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let mejorIntento: Blob | null = null;
  for (let calidad = 0.9; calidad >= CALIDAD_MINIMA; calidad -= 0.05) {
    const blob = await canvasABlob(canvas, calidad);
    mejorIntento = blob;
    if (blob.size <= OBJETIVO_MAX_BYTES) break;
  }
  return mejorIntento!;
}

export async function procesarCedula(archivo: Blob): Promise<Blob> {
  return procesar(archivo, 1600);
}

export async function procesarPerfil(archivo: Blob): Promise<Blob> {
  return procesar(archivo, 1200);
}
