import { supabase } from "./supabase-client";
import type { TipoFoto } from "./image-processor";
import { nombreArchivo } from "./image-processor";

const BUCKET = "identificacion";

/**
 * Sube una foto ya comprimida a Supabase Storage (bucket privado
 * "identificacion", RLS: insert para cualquier authenticated, select solo
 * is_admin() -- ver supabase/migrations/0009_identificacion_y_fotos.sql) y
 * la registra en encuesta_fotos. Mismo path deterministico que usa el
 * cliente Flutter ({encuestaId}/{tipo}.jpg) con upsert:true, asi que
 * reintentar nunca duplica el archivo.
 */
export async function subirFotoIdentificacion(
  encuestaId: string,
  tipo: TipoFoto,
  blob: Blob
): Promise<void> {
  const path = `${encuestaId}/${nombreArchivo(tipo)}`;
  const { error: subidaError } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (subidaError) throw subidaError;

  const { error: filaError } = await supabase
    .from("encuesta_fotos")
    .upsert({ encuesta_id: encuestaId, tipo, storage_path: path }, { onConflict: "encuesta_id,tipo" });
  if (filaError) throw filaError;
}
