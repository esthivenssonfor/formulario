"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Configuracion, Encuesta, RespuestaPregunta } from "@/lib/types";
import { obtenerConfiguracion, guardarEncuesta } from "@/lib/storage";
import {
  calcularNivel,
  calcularPuntajeTotal,
  calcularPuntosRespuesta,
  preguntasVisibles,
} from "@/lib/scoring";

type Paso = "datos" | "discapacidad" | "preguntas" | "resultado";

export default function EncuestaPage() {
  const [config, setConfig] = useState<Configuracion | null>(null);
  useEffect(() => {
    obtenerConfiguracion().then(setConfig);
  }, []);

  const [paso, setPaso] = useState<Paso>("datos");
  const [participante, setParticipante] = useState("");
  const [edad, setEdad] = useState("");
  const [discapacidad, setDiscapacidad] = useState<string>("");
  const [seleccion, setSeleccion] = useState<Record<string, string[]>>({});
  const [valores, setValores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Encuesta | null>(null);

  const preguntas = useMemo(
    () => (config && discapacidad ? preguntasVisibles(config.preguntas, discapacidad) : []),
    [config, discapacidad]
  );

  function elegirOpcion(preguntaId: string, opcionId: string, unica: boolean) {
    setSeleccion((prev) => {
      const actuales = prev[preguntaId] ?? [];
      if (unica) return { ...prev, [preguntaId]: [opcionId] };
      const existe = actuales.includes(opcionId);
      return {
        ...prev,
        [preguntaId]: existe
          ? actuales.filter((id) => id !== opcionId)
          : [...actuales, opcionId],
      };
    });
  }

  function enviarPaso1() {
    if (!participante.trim()) {
      setError("Ingresa un nombre o codigo de participante.");
      return;
    }
    setError(null);
    setPaso("discapacidad");
  }

  function enviarPaso2() {
    if (!discapacidad) {
      setError("Selecciona una opcion.");
      return;
    }
    setError(null);
    setPaso("preguntas");
  }

  async function finalizar() {
    if (!config) return;
    const faltantes = preguntas.filter(
      (p) => (p.tipo === "unica" || p.tipo === "multiple") && !(seleccion[p.id]?.length)
    );
    if (faltantes.length > 0) {
      setError("Responde todas las preguntas de seleccion antes de continuar.");
      return;
    }
    setError(null);

    const respuestas: RespuestaPregunta[] = preguntas.map((p) =>
      p.tipo === "unica" || p.tipo === "multiple"
        ? {
            preguntaId: p.id,
            opcionIds: seleccion[p.id],
            puntos: calcularPuntosRespuesta(p, seleccion[p.id]),
          }
        : {
            preguntaId: p.id,
            opcionIds: [],
            valorTexto: valores[p.id] ?? "",
            puntos: 0,
          }
    );

    const puntajeTotal = calcularPuntajeTotal(respuestas);
    const nivelId = calcularNivel(puntajeTotal, config);

    const encuesta: Encuesta = {
      id: crypto.randomUUID(),
      participante: participante.trim(),
      edad: edad ? Number(edad) : null,
      discapacidad,
      fecha: new Date().toISOString(),
      respuestas,
      puntajeTotal,
      nivelId,
      prioridad: null, // se calcula al momento de listar/rankear en el admin
    };

    await guardarEncuesta(encuesta);
    setResultado(encuesta);
    setPaso("resultado");
  }

  const nivel =
    resultado && config
      ? config.puntuacion.rangosNivel.find((r) => r.id === resultado.nivelId)
      : null;

  if (!config) {
    return (
      <main id="contenido" className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <p className="text-slate-600">Cargando encuesta...</p>
      </main>
    );
  }

  return (
    <main id="contenido" className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <p aria-live="polite" className="sr-only">
        Paso: {paso}
      </p>

      {paso === "datos" && (
        <section aria-labelledby="titulo-paso">
          <h1 id="titulo-paso" className="text-2xl font-bold text-blue-950">
            Datos iniciales
          </h1>
          <div className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-medium">Nombre o codigo de participante</span>
              <input
                className="rounded-md border border-slate-400 px-3 py-2 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900"
                value={participante}
                onChange={(e) => setParticipante(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Edad (opcional)</span>
              <input
                type="number"
                min={0}
                className="rounded-md border border-slate-400 px-3 py-2 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
              />
            </label>
          </div>
          {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
          <button
            onClick={enviarPaso1}
            className="mt-6 rounded-md bg-blue-900 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-800"
          >
            Continuar
          </button>
        </section>
      )}

      {paso === "discapacidad" && (
        <section aria-labelledby="titulo-paso">
          <h1 id="titulo-paso" className="text-2xl font-bold text-blue-950">
            Tipo de discapacidad
          </h1>
          <fieldset className="mt-6 flex flex-col gap-3">
            <legend className="sr-only">Selecciona el tipo de discapacidad</legend>
            {config.tiposDiscapacidad.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-3 rounded-md border border-slate-400 px-4 py-3 text-lg has-[:checked]:border-blue-900 has-[:checked]:bg-blue-50"
              >
                <input
                  type="radio"
                  name="discapacidad"
                  value={t.id}
                  checked={discapacidad === t.id}
                  onChange={() => setDiscapacidad(t.id)}
                  className="h-5 w-5"
                />
                {t.etiqueta}
              </label>
            ))}
          </fieldset>
          {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setPaso("datos")}
              className="rounded-md border-2 border-blue-900 px-6 py-3 text-lg font-semibold text-blue-900 hover:bg-blue-50"
            >
              Atras
            </button>
            <button
              onClick={enviarPaso2}
              className="rounded-md bg-blue-900 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-800"
            >
              Continuar
            </button>
          </div>
        </section>
      )}

      {paso === "preguntas" && (
        <section aria-labelledby="titulo-paso">
          <h1 id="titulo-paso" className="text-2xl font-bold text-blue-950">
            Preguntas
          </h1>
          <p className="mt-2 text-slate-600">
            {preguntas.length} pregunta{preguntas.length === 1 ? "" : "s"} para tu perfil.
          </p>
          <div className="mt-6 flex flex-col gap-8">
            {preguntas.map((p, idx) => {
              const nuevaSeccion = p.seccion !== preguntas[idx - 1]?.seccion;
              return (
                <div key={p.id}>
                  {nuevaSeccion && (
                    <h2 className="mb-4 text-xl font-bold text-blue-950">{p.seccion}</h2>
                  )}
                  <fieldset className="border-t border-slate-200 pt-4">
                    <legend className="text-lg font-semibold">{p.texto}</legend>
                    {(p.tipo === "unica" || p.tipo === "multiple") && (
                      <div className="mt-3 flex flex-col gap-2">
                        {p.opciones.map((o) => (
                          <label
                            key={o.id}
                            className="flex items-center gap-3 rounded-md border border-slate-300 px-4 py-2 has-[:checked]:border-blue-900 has-[:checked]:bg-blue-50"
                          >
                            <input
                              type={p.tipo === "unica" ? "radio" : "checkbox"}
                              name={p.id}
                              checked={(seleccion[p.id] ?? []).includes(o.id)}
                              onChange={() => elegirOpcion(p.id, o.id, p.tipo === "unica")}
                              className="h-5 w-5"
                            />
                            {o.texto}
                          </label>
                        ))}
                      </div>
                    )}
                    {(p.tipo === "texto" || p.tipo === "fecha" || p.tipo === "numero") && (
                      <input
                        type={p.tipo === "texto" ? "text" : p.tipo === "fecha" ? "date" : "number"}
                        value={valores[p.id] ?? ""}
                        onChange={(e) =>
                          setValores((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        className="mt-3 w-full rounded-md border border-slate-400 px-3 py-2 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900"
                      />
                    )}
                  </fieldset>
                </div>
              );
            })}
          </div>
          {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setPaso("discapacidad")}
              className="rounded-md border-2 border-blue-900 px-6 py-3 text-lg font-semibold text-blue-900 hover:bg-blue-50"
            >
              Atras
            </button>
            <button
              onClick={finalizar}
              className="rounded-md bg-blue-900 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-800"
            >
              Finalizar
            </button>
          </div>
        </section>
      )}

      {paso === "resultado" && resultado && (
        <section aria-labelledby="titulo-paso">
          <h1 id="titulo-paso" className="text-2xl font-bold text-blue-950">
            Encuesta registrada
          </h1>
          <div className="mt-6 rounded-md border border-slate-300 p-6">
            <p className="text-slate-600">Puntaje total (DEMO)</p>
            <p className="text-4xl font-bold">{resultado.puntajeTotal}</p>
            {nivel && (
              <span className={`mt-3 inline-block rounded-full px-4 py-1 text-white ${nivel.color}`}>
                Nivel: {nivel.nombre}
              </span>
            )}
          </div>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-blue-900 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-800"
          >
            Volver al inicio
          </Link>
        </section>
      )}
    </main>
  );
}
