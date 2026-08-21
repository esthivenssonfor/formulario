import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

/**
 * Escribe/guarda un archivo generado (ej. XLSX.writeFile) y lo deja listo
 * para "compartir" o "abrir" -- separado en dos acciones porque son cosas
 * distintas para Android:
 *   - compartirArchivo(): ACTION_SEND -- MANDAR el archivo a otra app
 *     (WhatsApp, Gmail, Bluetooth...).
 *   - abrirArchivo(): ACTION_VIEW -- el usuario elige con que app VER el
 *     archivo el mismo (Sheets, Excel, WPS...), sin depender del visor
 *     interno de la app que lo recibio.
 *
 * Por que hace falta escribir a disco primero: el WebView de Android (lo
 * que usa Capacitor) NO soporta de forma confiable la descarga de archivos
 * via <a download> + Blob URL como un navegador de verdad -- ahi es donde
 * fallaba silenciosamente "Exportar Excel" dentro de la app instalada. La
 * solucion estandar de Capacitor es escribir el archivo con
 * @capacitor/filesystem y ofrecerlo con @capacitor/share.
 *
 * MIME de xlsx corregido a nivel nativo, y metodo openFile agregado (no
 * existe en el plugin original): ver
 * patches/@capacitor+share+8.0.1.patch -- android.webkit.MimeTypeMap (la
 * tabla de MIME del propio Android) no reconoce ".xlsx" en muchas
 * versiones/fabricantes y el plugin caia a un tipo generico comodin, que
 * es lo que hacia que WhatsApp recibiera el archivo pero lo mostrara
 * vacio/no legible del otro lado (el archivo en si nunca estuvo corrupto
 * -- era el tipo declarado en el intent).
 */

/** Primeros 2 bytes de un ZIP valido ("PK") -- .xlsx es un ZIP por dentro. */
function esZipValido(bytes: Uint8Array): boolean {
  return bytes.length > 0 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function base64ABytes(base64: string): Uint8Array {
  const binario = atob(base64);
  const buffer = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) buffer[i] = binario.charCodeAt(i);
  return buffer;
}

/** Inverso de base64ABytes -- en trozos para no reventar el limite de
 * argumentos de String.fromCharCode con archivos grandes (ej. un Excel con
 * varias fotos incrustadas). */
export function bytesABase64(bytes: Uint8Array): string {
  const TAMANO_TROZO = 0x8000;
  let binario = "";
  for (let i = 0; i < bytes.length; i += TAMANO_TROZO) {
    binario += String.fromCharCode(...bytes.subarray(i, i + TAMANO_TROZO));
  }
  return btoa(binario);
}

/** Plugin Share con el metodo openFile agregado (ver patches/) -- no forma
 * parte del tipo SharePlugin original de @capacitor/share, asi que se
 * declara aparte para no pelear con los tipos generados. */
const ShareConOpenFile = Share as unknown as {
  share: typeof Share.share;
  openFile: (opts: { path: string; dialogTitle?: string }) => Promise<void>;
};

interface ArchivoListo {
  // Web: el propio Blob (ya no hay filesystem nativo). Nativo: la URI
  // file:// que devolvio Filesystem.writeFile.
  tipo: "web" | "nativo";
  blob?: Blob;
  nombreArchivo: string;
  mimeType: string;
  uri?: string;
}

/** Escribe el archivo y lo valida (tamaño > 0, ZIP valido) ANTES de
 * ofrecer compartirlo o abrirlo -- si algo de esto falla, ninguna de las
 * dos acciones de abajo llega a mostrarse (pedido explicito del usuario). */
async function prepararArchivo(nombreArchivo: string, base64: string, mimeType: string): Promise<ArchivoListo> {
  if (!base64 || base64.length === 0) {
    throw new Error("No se pudo generar correctamente el archivo Excel (contenido vacio).");
  }
  const bytes = base64ABytes(base64);
  if (!esZipValido(bytes)) {
    throw new Error("No se pudo generar correctamente el archivo Excel (formato invalido).");
  }

  if (!Capacitor.isNativePlatform()) {
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
    return { tipo: "web", blob, nombreArchivo, mimeType };
  }

  const resultado = await Filesystem.writeFile({
    path: nombreArchivo,
    data: base64,
    directory: Directory.Cache,
  });

  // Confirmar que el archivo realmente quedo escrito en disco con el
  // tamaño esperado ANTES de ofrecer compartirlo/abrirlo.
  const info = await Filesystem.stat({ path: nombreArchivo, directory: Directory.Cache });
  if (!info.size || info.size <= 0) {
    throw new Error("No se pudo generar correctamente el archivo Excel (0 bytes en disco).");
  }

  return { tipo: "nativo", nombreArchivo, mimeType, uri: resultado.uri };
}

/** "Compartir": mandar el archivo a otra app (WhatsApp, Gmail, etc). En
 * Web usa Web Share API si esta disponible, si no cae a descarga normal. */
export async function compartirArchivoBase64(nombreArchivo: string, base64: string, mimeType: string): Promise<void> {
  const archivo = await prepararArchivo(nombreArchivo, base64, mimeType);

  if (archivo.tipo === "web") {
    const blob = archivo.blob!;
    const archivoWeb = new File([blob], nombreArchivo, { type: mimeType });
    if (
      typeof navigator !== "undefined" &&
      "share" in navigator &&
      "canShare" in navigator &&
      navigator.canShare({ files: [archivoWeb] })
    ) {
      try {
        await navigator.share({ files: [archivoWeb], title: nombreArchivo });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        // si falla por otro motivo, cae a la descarga normal de abajo.
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }

  // "files" (no "url"): "url" en @capacitor/share dispara ACTION_VIEW
  // (solo apps que "abren" links/archivos). "files" dispara ACTION_SEND
  // con el archivo como adjunto real -- ahi aparecen WhatsApp, Telegram,
  // Gmail, Bluetooth, etc. El archivo NO se borra (queda en Cache) --
  // tiene que seguir existiendo mientras la app receptora lo lee.
  await ShareConOpenFile.share({
    title: nombreArchivo,
    dialogTitle: "Compartir Excel",
    files: [archivo.uri!],
  });
}

/** "Abrir con": el usuario elige que app usa para VER el archivo el mismo
 * (Sheets, Excel, WPS, Drive...), en vez de mandarlo a otra persona. En
 * Web no existe esta distincion (el navegador ya lo descarga/abre solo). */
export async function abrirArchivoBase64(nombreArchivo: string, base64: string, mimeType: string): Promise<void> {
  const archivo = await prepararArchivo(nombreArchivo, base64, mimeType);

  if (archivo.tipo === "web") {
    const url = URL.createObjectURL(archivo.blob!);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  await ShareConOpenFile.openFile({
    path: archivo.uri!,
    dialogTitle: "Abrir con",
  });
}
