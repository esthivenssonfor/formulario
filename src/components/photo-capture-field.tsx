"use client";

import { useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { procesarCedula, procesarPerfil, type TipoFoto } from "@/lib/image-processor";
import { Button } from "@/components/ui";

/**
 * Espejo de flutter/lib/widgets/photo_capture_field.dart: tomar/seleccionar
 * foto -> vista previa -> "volver a tomar", mismo pipeline de compresion.
 *
 * La foto se confirma SOLA en cuanto se elige/toma y se procesa -- antes
 * exigia un click aparte en "Usar esta foto" despues de la vista previa, y
 * se perdian fotos en silencio: el usuario elegia la imagen, la vista
 * previa se mostraba, pero si pasaba a la siguiente pregunta sin acordarse
 * de ese segundo click, onConfirmada() nunca se llamaba y la encuesta se
 * guardaba sin la foto sin ningun aviso (confirmado revisando los logs de
 * Supabase: la encuesta se inserto pero jamas se llego a llamar
 * storage.upload). "Volver a tomar" sigue disponible para reemplazarla.
 *
 * "Tomar fotografia" usa @capacitor/camera dentro de la app empaquetada --
 * un <input capture> normal NO abre la camara de forma confiable en el
 * WebView de Android (termina abriendo el selector de galeria/archivos, el
 * bug que se reporto). En la version Web (navegador, sin Capacitor) se usa
 * el <input capture> normal, que ahi si funciona bien.
 */
export function PhotoCaptureField({
  etiqueta,
  guia,
  tipo,
  onConfirmada,
  yaGuardada,
}: {
  etiqueta: string;
  guia: string;
  tipo: TipoFoto;
  onConfirmada: (blob: Blob) => void;
  yaGuardada?: boolean;
}) {
  const [vistaPrevia, setVistaPrevia] = useState<{ url: string; blob: Blob } | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [confirmada, setConfirmada] = useState(Boolean(yaGuardada));
  const [error, setError] = useState<string | null>(null);
  const inputCamaraRef = useRef<HTMLInputElement>(null);
  const inputGaleriaRef = useRef<HTMLInputElement>(null);

  async function procesarBlob(origen: Blob) {
    setProcesando(true);
    setError(null);
    try {
      const blob = tipo === "foto_participante" ? await procesarPerfil(origen) : await procesarCedula(origen);
      setVistaPrevia({ url: URL.createObjectURL(blob), blob });
      onConfirmada(blob);
      setConfirmada(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar la foto.");
    } finally {
      setProcesando(false);
    }
  }

  async function alElegirArchivo(archivo: File | undefined) {
    if (!archivo) return;
    await procesarBlob(archivo);
  }

  async function tomarFotoNativa() {
    setError(null);
    try {
      const foto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
      });
      if (!foto.webPath) throw new Error("La camara no devolvio una imagen.");
      const respuesta = await fetch(foto.webPath);
      const blob = await respuesta.blob();
      await procesarBlob(blob);
    } catch (err) {
      // el usuario cancelando la camara tambien cae aca -- no es un error real.
      const mensaje = err instanceof Error ? err.message : "";
      if (!/cancel/i.test(mensaje)) {
        setError(mensaje || "No se pudo abrir la camara.");
      }
    }
  }

  function volverATomar() {
    if (vistaPrevia) URL.revokeObjectURL(vistaPrevia.url);
    setVistaPrevia(null);
    setConfirmada(false);
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-ink">{etiqueta}</h3>
        {confirmada && (
          <span className="text-success" aria-label="Confirmada">
            ✓
          </span>
        )}
      </div>

      {!vistaPrevia ? (
        <>
          <p className="mt-1.5 text-sm text-ink-muted">{guia}</p>
          {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
          {procesando ? (
            <p className="mt-3 text-sm text-ink-muted">Procesando...</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => (Capacitor.isNativePlatform() ? tomarFotoNativa() : inputCamaraRef.current?.click())}
                className="px-4 py-2 text-sm"
              >
                Tomar fotografía
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => inputGaleriaRef.current?.click()}
                className="px-4 py-2 text-sm"
              >
                Seleccionar imagen
              </Button>
              {!Capacitor.isNativePlatform() && (
                <input
                  ref={inputCamaraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => alElegirArchivo(e.target.files?.[0])}
                />
              )}
              <input
                ref={inputGaleriaRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => alElegirArchivo(e.target.files?.[0])}
              />
            </div>
          )}
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL, no aplica next/image */}
          <img src={vistaPrevia.url} alt="Vista previa" className="mt-3 h-44 w-full rounded-lg object-cover" />
          <p className="mt-1.5 text-sm text-success">Foto guardada.</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="secondary" onClick={volverATomar} className="px-4 py-2 text-sm">
              Volver a tomar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
