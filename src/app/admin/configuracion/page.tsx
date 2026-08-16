"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  obtenerConfiguracion,
  guardarConfiguracion,
  restaurarConfiguracionDemo,
} from "@/lib/storage";
import type { Configuracion } from "@/lib/types";
import { Alert, Button, TextArea } from "@/components/ui";

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
        <h1 className="text-2xl font-bold tracking-tight text-ink">Configuracion</h1>
        <Link href="/admin" className="font-medium text-brand underline underline-offset-2">
          Volver al panel
        </Link>
      </div>
      <p className="mt-2 text-ink-muted">
        Preguntas, opciones, puntos, pesos, categorias, rangos de nivel, direccion del
        puntaje y reglas de filtrado por discapacidad viven aqui como datos. Editar y
        guardar no requiere tocar codigo.
      </p>

      {mensaje && (
        <div className="mt-4">
          <Alert tono={mensaje.tipo === "ok" ? "ok" : "error"}>{mensaje.texto}</Alert>
        </div>
      )}

      <label className="mt-4 flex flex-col gap-2">
        <span className="font-medium text-ink">Configuracion (JSON)</span>
        <TextArea
          value={cargando ? "Cargando..." : texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={cargando}
          spellCheck={false}
          className="h-[520px] w-full font-mono text-sm"
        />
      </label>

      <div className="mt-4 flex gap-3">
        <Button onClick={guardar} disabled={cargando}>
          Guardar
        </Button>
        <Button variant="secondary" onClick={restaurar} disabled={cargando}>
          Restaurar configuracion oficial
        </Button>
      </div>
    </main>
  );
}
