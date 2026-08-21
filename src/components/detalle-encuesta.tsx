"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import type { Encuesta, Pregunta } from "@/lib/types";

const ETIQUETAS_FOTO: Record<string, string> = {
  cedula_frontal: "Cédula frontal",
  cedula_posterior: "Cédula posterior",
  foto_participante: "Foto del participante",
};

/**
 * Detalle expandido de una encuesta en el panel admin: factores criticos,
 * fotos (URLs firmadas -- el bucket "identificacion" es privado, is_admin()
 * exigido por RLS, ver supabase/migrations/0009_identificacion_y_fotos.sql)
 * y las respuestas con la pregunta arriba y la respuesta abajo (mas facil
 * de leer que "Pregunta -> Respuesta" en una sola linea).
 */
export function DetalleEncuesta({
  encuesta,
  preguntaDe,
}: {
  encuesta: Encuesta;
  preguntaDe: (id: string) => Pregunta | undefined;
}) {
  const [fotos, setFotos] = useState<{ tipo: string; url: string }[]>([]);
  const [cargandoFotos, setCargandoFotos] = useState(true);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const { data } = await supabase
        .from("encuesta_fotos")
        .select("tipo, storage_path")
        .eq("encuesta_id", encuesta.id);

      if (!data || data.length === 0) {
        if (!cancelado) setCargandoFotos(false);
        return;
      }

      const urls = await Promise.all(
        data.map(async (f) => {
          const { data: firmada } = await supabase.storage
            .from("identificacion")
            .createSignedUrl(f.storage_path as string, 300); // 5 min, solo para ver el detalle
          return firmada ? { tipo: f.tipo as string, url: firmada.signedUrl } : null;
        })
      );

      if (!cancelado) {
        setFotos(urls.filter((u): u is { tipo: string; url: string } => u !== null));
        setCargandoFotos(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [encuesta.id]);

  return (
    <div>
      {encuesta.factoresCriticos.length > 0 && (
        <div className="mb-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          <strong>Factores criticos:</strong> {encuesta.factoresCriticos.join("; ")}
        </div>
      )}

      {cargandoFotos ? (
        <p className="mb-3 text-xs text-ink-muted">Cargando fotos...</p>
      ) : (
        fotos.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold text-ink">Fotos</p>
            <div className="flex flex-wrap gap-3">
              {fotos.map((f) => (
                <a key={f.tipo} href={f.url} target="_blank" rel="noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal, no aplica next/image */}
                  <img
                    src={f.url}
                    alt={ETIQUETAS_FOTO[f.tipo] ?? f.tipo}
                    className="h-28 w-28 rounded-lg border border-line object-cover"
                  />
                  <span className="mt-1 block max-w-28 text-center text-xs text-ink-muted">
                    {ETIQUETAS_FOTO[f.tipo] ?? f.tipo}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )
      )}

      <ul className="flex flex-col gap-3 text-sm">
        {encuesta.respuestas.map((r) => {
          const pregunta = preguntaDe(r.preguntaId);
          const opciones = pregunta?.opciones
            .filter((o) => r.opcionIds.includes(o.id))
            .map((o) => o.texto)
            .join(", ");
          const valor = opciones || r.valorTexto || "-";
          return (
            <li key={r.preguntaId}>
              <p className="font-semibold text-ink">{pregunta?.texto}</p>
              <p className="text-ink-muted">
                {valor}
                {r.puntos > 0 && ` (${r.puntos} pts)`}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
