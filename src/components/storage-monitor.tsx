"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/lib/supabase-client";
import { URL_WEB } from "@/lib/config";
import { exportarEncuestasExcel } from "@/lib/export-encuestas";

// Indicador discreto de almacenamiento de la base de datos (solo panel
// admin). Sondea la ruta server-side /api/admin/storage -- el porcentaje
// real (pg_database_size) se calcula del lado del servidor con la
// service_role key, nunca en el navegador.
const INTERVALO_SONDEO_MS = 5 * 60 * 1000;
const CLAVE_DESCARTADOS = "fundimopla_storage_alertas_descartadas";

type Nivel = "normal" | "precaucion" | "advertencia" | "critico" | "critico_extremo";

interface DatosAlmacenamiento {
  usedBytes: number;
  limitBytes: number;
  percent: number;
}

const NIVELES: { id: Nivel; desde: number; emoji: string; etiqueta: string }[] = [
  { id: "critico_extremo", desde: 0.95, emoji: "🔴", etiqueta: "Crítico extremo" },
  { id: "critico", desde: 0.9, emoji: "🔴", etiqueta: "Crítico" },
  { id: "advertencia", desde: 0.8, emoji: "🟠", etiqueta: "Advertencia" },
  { id: "precaucion", desde: 0.7, emoji: "🟡", etiqueta: "Precaución" },
  { id: "normal", desde: 0, emoji: "🟢", etiqueta: "Normal" },
];

function nivelDe(percent: number): Nivel {
  return (NIVELES.find((n) => percent >= n.desde) ?? NIVELES[NIVELES.length - 1]).id;
}

const MENSAJES: Record<Nivel, string | null> = {
  normal: null,
  precaucion: "El almacenamiento de la base de datos está llegando a un nivel elevado.",
  advertencia: "⚠️ La base de datos está cerca de su límite. Es recomendable exportar los resultados.",
  critico:
    "🚨 La base de datos está casi llena. Exporta los resultados y elimina los datos antiguos para liberar espacio.",
  critico_extremo: "🚨 CRÍTICO: queda muy poco espacio disponible. Exporta los datos inmediatamente.",
};

function apiUrl(path: string): string {
  return Capacitor.isNativePlatform() ? `${URL_WEB}${path}` : path;
}

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatearMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function leerDescartados(): Set<Nivel> {
  if (typeof window === "undefined") return new Set();
  try {
    const crudo = sessionStorage.getItem(CLAVE_DESCARTADOS);
    return new Set(crudo ? (JSON.parse(crudo) as Nivel[]) : []);
  } catch {
    return new Set();
  }
}

export function StorageMonitor() {
  const [datos, setDatos] = useState<DatosAlmacenamiento | null>(null);
  const [expandido, setExpandido] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [mensajeExport, setMensajeExport] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function sondear() {
      try {
        const res = await fetch(apiUrl("/api/admin/storage"), { headers: await authHeaders() });
        if (!res.ok || cancelado) return;
        const body = (await res.json()) as DatosAlmacenamiento;
        if (cancelado) return;
        setDatos(body);
        const nivel = nivelDe(body.percent);
        // el nivel critico extremo no se puede silenciar de forma permanente:
        // vuelve a abrirse solo en cada sondeo/carga mientras siga en ese rango.
        if (nivel !== "normal" && (nivel === "critico_extremo" || !leerDescartados().has(nivel))) {
          setExpandido(true);
        }
      } catch {
        // fallo de red al monitorear almacenamiento: no interrumpe la app,
        // simplemente no se actualiza el indicador hasta el proximo sondeo.
      }
    }

    sondear();
    const id = setInterval(sondear, INTERVALO_SONDEO_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, []);

  if (!datos) return null;

  const nivel = nivelDe(datos.percent);
  const info = NIVELES.find((n) => n.id === nivel)!;
  const porcentaje = Math.round(datos.percent * 100);
  const muestraAcciones = datos.percent >= 0.8;

  function cerrar() {
    setExpandido(false);
    setMensajeExport(null);
    if (nivel !== "critico_extremo" && typeof window !== "undefined") {
      const descartados = leerDescartados();
      descartados.add(nivel);
      sessionStorage.setItem(CLAVE_DESCARTADOS, JSON.stringify([...descartados]));
    }
  }

  async function exportar() {
    setExportando(true);
    setMensajeExport(null);
    try {
      const cantidad = await exportarEncuestasExcel();
      setMensajeExport(
        cantidad > 0
          ? "Datos exportados correctamente. Puedes eliminar los registros antiguos para liberar espacio."
          : "No hay encuestas para exportar todavía."
      );
    } catch (err) {
      setMensajeExport(err instanceof Error ? err.message : "No se pudo exportar los datos.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {expandido && (
        <div className="w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Almacenamiento de la base de datos</h2>
            <button
              onClick={cerrar}
              aria-label="Cerrar"
              className="shrink-0 text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              ✕
            </button>
          </div>

          {MENSAJES[nivel] && (
            <p className="mt-2 text-sm text-ink" role="status">
              {MENSAJES[nivel]}
            </p>
          )}

          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            <dt className="text-ink-muted">Uso</dt>
            <dd className="text-right font-medium text-ink">{porcentaje}%</dd>
            <dt className="text-ink-muted">Usado</dt>
            <dd className="text-right text-ink">{formatearMB(datos.usedBytes)}</dd>
            <dt className="text-ink-muted">Disponible</dt>
            <dd className="text-right text-ink">{formatearMB(Math.max(datos.limitBytes - datos.usedBytes, 0))}</dd>
            <dt className="text-ink-muted">Estado</dt>
            <dd className="text-right text-ink">{info.etiqueta}</dd>
          </dl>

          {mensajeExport && (
            <p className="mt-3 rounded-lg bg-success-soft px-3 py-2 text-sm text-success" role="status">
              {mensajeExport}
            </p>
          )}

          {muestraAcciones && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={exportar}
                disabled={exportando}
                className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-brand-ink hover:bg-brand-strong disabled:pointer-events-none disabled:opacity-40"
              >
                {exportando ? "Exportando..." : "Exportar datos"}
              </button>
              <Link
                href="/admin"
                onClick={cerrar}
                className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-surface-2"
              >
                Administrar datos
              </Link>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setExpandido((v) => !v)}
        aria-expanded={expandido}
        className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink shadow-md hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span aria-hidden="true">{info.emoji}</span>
        Base de datos: {porcentaje}%
      </button>
    </div>
  );
}
