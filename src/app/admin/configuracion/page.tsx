"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  obtenerConfiguracion,
  guardarConfiguracion,
  restaurarConfiguracionDemo,
} from "@/lib/storage";
import type { Configuracion } from "@/lib/types";

// Editor de configuracion en JSON. Cubre todo lo pedido: puntos por respuesta,
// peso por pregunta, categoria, puntaje minimo/maximo, rangos de nivel,
// direccion (define la prioridad), reglas de filtrado por discapacidad
// (mostrarSiDiscapacidad) y opciones que no otorgan puntos (puntos: 0).
export default function ConfiguracionPage() {
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null
  );

  useEffect(() => {
    obtenerConfiguracion().then((config) => {
      setTexto(JSON.stringify(config, null, 2));
      setCargando(false);
    });
  }, []);

  async function guardar() {
    try {
      const parsed = JSON.parse(texto) as Configuracion;
      if (!Array.isArray(parsed.preguntas) || !Array.isArray(parsed.tiposDiscapacidad)) {
        throw new Error("Faltan 'preguntas' o 'tiposDiscapacidad'.");
      }
      if (!parsed.puntuacion?.rangosNivel?.length) {
        throw new Error("Faltan 'puntuacion.rangosNivel'.");
      }
      await guardarConfiguracion(parsed);
      setMensaje({ tipo: "ok", texto: "Configuracion guardada correctamente." });
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err instanceof Error ? `JSON invalido: ${err.message}` : "JSON invalido.",
      });
    }
  }

  async function restaurar() {
    const demo = await restaurarConfiguracionDemo();
    setTexto(JSON.stringify(demo, null, 2));
    setMensaje({ tipo: "ok", texto: "Configuracion oficial restaurada." });
  }

  return (
    <main id="contenido" className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-950">Configuracion (DEMO)</h1>
        <Link href="/admin" className="text-blue-900 underline">
          Volver al panel
        </Link>
      </div>
      <p className="mt-2 text-slate-600">
        Preguntas, opciones, puntos, pesos, categorias, rangos de nivel, direccion del
        puntaje y reglas de filtrado por discapacidad viven aqui como datos. Editar y
        guardar no requiere tocar codigo.
      </p>

      {mensaje && (
        <p
          role="alert"
          className={`mt-4 rounded-md px-4 py-2 ${
            mensaje.tipo === "ok"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <label className="mt-4 flex flex-col gap-2">
        <span className="font-medium">Configuracion (JSON)</span>
        <textarea
          value={cargando ? "Cargando..." : texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={cargando}
          spellCheck={false}
          className="h-[520px] w-full rounded-md border border-slate-400 p-3 font-mono text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900"
        />
      </label>

      <div className="mt-4 flex gap-3">
        <button
          onClick={guardar}
          disabled={cargando}
          className="rounded-md bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-40"
        >
          Guardar
        </button>
        <button
          onClick={restaurar}
          disabled={cargando}
          className="rounded-md border-2 border-slate-400 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Restaurar configuracion oficial
        </button>
      </div>
    </main>
  );
}
