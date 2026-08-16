"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Configuracion, Encuesta, RespuestaPregunta } from "@/lib/types";
import { obtenerConfiguracion, guardarEncuesta } from "@/lib/storage";
import {
  calcularNivel,
  calcularPuntajeTotal,
  calcularPuntosRespuesta,
  preguntasVisibles,
} from "@/lib/scoring";
import { Alert, Button, NivelBadge, TextInput } from "@/components/ui";

type Paso = "datos" | "discapacidad" | "preguntas" | "resultado";

const PASOS: { id: Paso; etiqueta: string }[] = [
  { id: "datos", etiqueta: "Datos" },
  { id: "discapacidad", etiqueta: "Discapacidad" },
  { id: "preguntas", etiqueta: "Preguntas" },
  { id: "resultado", etiqueta: "Resultado" },
];

function esPaso(v: string | null): v is Paso {
  return v === "datos" || v === "discapacidad" || v === "preguntas" || v === "resultado";
}

function PasoIndicador({ paso }: { paso: Paso }) {
  const activo = PASOS.findIndex((p) => p.id === paso);
  return (
    <ol className="mb-8 flex items-center gap-2" aria-hidden="true">
      {PASOS.map((p, idx) => (
        <li key={p.id} className="flex flex-1 items-center gap-2">
          <span
            className={`h-1.5 flex-1 rounded-full transition-colors duration-150 ${
              idx <= activo ? "bg-brand" : "bg-line"
            }`}
          />
          {idx < PASOS.length - 1 && <span className="sr-only">/</span>}
        </li>
      ))}
    </ol>
  );
}

export default function EncuestaPage() {
  return (
    <Suspense
      fallback={
        <main id="contenido" className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
          <p className="text-ink-muted">Cargando encuesta...</p>
        </main>
      }
    >
      <EncuestaContenido />
    </Suspense>
  );
}

function EncuestaContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // El paso vive en la URL (?paso=...) para que el boton atras del
  // navegador/celular navegue entre los pasos de la encuesta en vez de
  // sacar al usuario de la pagina.
  const paso: Paso = esPaso(searchParams.get("paso")) ? (searchParams.get("paso") as Paso) : "datos";

  function irAPaso(siguiente: Paso) {
    router.push(`/encuesta?paso=${siguiente}`, { scroll: false });
  }

  const [config, setConfig] = useState<Configuracion | null>(null);
  useEffect(() => {
    obtenerConfiguracion().then(setConfig);
  }, []);

  const [participante, setParticipante] = useState("");
  const [edad, setEdad] = useState("");
  const [discapacidad, setDiscapacidad] = useState<string>("");
  const [seleccion, setSeleccion] = useState<Record<string, string[]>>({});
  const [valores, setValores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Encuesta | null>(null);
  const [enviando, setEnviando] = useState(false);

  const preguntas = useMemo(
    () => (config && discapacidad ? preguntasVisibles(config.preguntas, discapacidad) : []),
    [config, discapacidad]
  );

  const preguntasDeSeleccion = useMemo(
    () => preguntas.filter((p) => p.tipo === "unica" || p.tipo === "multiple"),
    [preguntas]
  );
  const respondidas = preguntasDeSeleccion.filter((p) => seleccion[p.id]?.length).length;

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
    irAPaso("discapacidad");
  }

  function enviarPaso2() {
    if (!discapacidad) {
      setError("Selecciona una opcion.");
      return;
    }
    setError(null);
    irAPaso("preguntas");
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
    setEnviando(true);

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
    setEnviando(false);
    setResultado(encuesta);
    irAPaso("resultado");
  }

  const nivel =
    resultado && config
      ? config.puntuacion.rangosNivel.find((r) => r.id === resultado.nivelId)
      : null;

  if (!config) {
    return (
      <main id="contenido" className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <p className="text-ink-muted">Cargando encuesta...</p>
      </main>
    );
  }

  return (
    <main id="contenido" className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <p aria-live="polite" className="sr-only">
        Paso: {paso}
      </p>
      <PasoIndicador paso={paso} />

      {paso === "datos" && (
        <section aria-labelledby="titulo-paso">
          <h1 id="titulo-paso" className="text-2xl font-bold tracking-tight text-ink">
            Datos iniciales
          </h1>
          <div className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-medium text-ink">Nombre o codigo de participante</span>
              <TextInput
                value={participante}
                onChange={(e) => setParticipante(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-medium text-ink">Edad (opcional)</span>
              <TextInput
                type="number"
                min={0}
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
              />
            </label>
          </div>
          {error && <div className="mt-4"><Alert tono="error">{error}</Alert></div>}
          <Button onClick={enviarPaso1} className="mt-6">
            Continuar
          </Button>
        </section>
      )}

      {paso === "discapacidad" && (
        <section aria-labelledby="titulo-paso">
          <h1 id="titulo-paso" className="text-2xl font-bold tracking-tight text-ink">
            Tipo de discapacidad
          </h1>
          <fieldset className="mt-6 flex flex-col gap-3">
            <legend className="sr-only">Selecciona el tipo de discapacidad</legend>
            {config.tiposDiscapacidad.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-3 rounded-lg border border-line-strong bg-surface px-4 py-3 text-lg transition-colors duration-150 has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
              >
                <input
                  type="radio"
                  name="discapacidad"
                  value={t.id}
                  checked={discapacidad === t.id}
                  onChange={() => setDiscapacidad(t.id)}
                  className="h-5 w-5 accent-brand"
                />
                {t.etiqueta}
              </label>
            ))}
          </fieldset>
          {error && <div className="mt-4"><Alert tono="error">{error}</Alert></div>}
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => router.back()}>
              Atras
            </Button>
            <Button onClick={enviarPaso2}>Continuar</Button>
          </div>
        </section>
      )}

      {paso === "preguntas" && (
        <section aria-labelledby="titulo-paso">
          <div className="sticky top-0 z-10 -mx-6 border-b border-line bg-background/95 px-6 pb-3 pt-2 backdrop-blur-sm">
            <div className="flex items-baseline justify-between gap-4">
              <h1 id="titulo-paso" className="text-2xl font-bold tracking-tight text-ink">
                Preguntas
              </h1>
              <p className="whitespace-nowrap text-sm font-medium text-ink-muted">
                {respondidas} / {preguntasDeSeleccion.length} respondidas
              </p>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-200"
                style={{
                  width: `${preguntasDeSeleccion.length ? (respondidas / preguntasDeSeleccion.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-10">
            {preguntas.map((p, idx) => {
              const nuevaSeccion = p.seccion !== preguntas[idx - 1]?.seccion;
              return (
                <div key={p.id}>
                  {nuevaSeccion && (
                    <h2 className="mb-4 border-b border-line pb-2 text-lg font-bold tracking-tight text-brand">
                      {p.seccion}
                    </h2>
                  )}
                  <fieldset>
                    <legend className="text-lg font-semibold text-ink text-pretty">
                      {p.texto}
                    </legend>
                    {(p.tipo === "unica" || p.tipo === "multiple") && (
                      <div className="mt-3 flex flex-col gap-2">
                        {p.opciones.map((o) => (
                          <label
                            key={o.id}
                            className="flex items-center gap-3 rounded-lg border border-line px-4 py-2.5 transition-colors duration-150 has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
                          >
                            <input
                              type={p.tipo === "unica" ? "radio" : "checkbox"}
                              name={p.id}
                              checked={(seleccion[p.id] ?? []).includes(o.id)}
                              onChange={() => elegirOpcion(p.id, o.id, p.tipo === "unica")}
                              className="h-5 w-5 accent-brand"
                            />
                            {o.texto}
                          </label>
                        ))}
                      </div>
                    )}
                    {(p.tipo === "texto" || p.tipo === "fecha" || p.tipo === "numero") && (
                      <TextInput
                        type={p.tipo === "texto" ? "text" : p.tipo === "fecha" ? "date" : "number"}
                        value={valores[p.id] ?? ""}
                        onChange={(e) =>
                          setValores((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        className="mt-3 w-full"
                      />
                    )}
                  </fieldset>
                </div>
              );
            })}
          </div>
          {error && <div className="mt-6"><Alert tono="error">{error}</Alert></div>}
          <div className="mt-8 flex gap-3">
            <Button variant="secondary" onClick={() => router.back()} disabled={enviando}>
              Atras
            </Button>
            <Button onClick={finalizar} disabled={enviando}>
              {enviando ? "Guardando..." : "Finalizar"}
            </Button>
          </div>
        </section>
      )}

      {paso === "resultado" && resultado && (
        <section aria-labelledby="titulo-paso">
          <h1 id="titulo-paso" className="text-2xl font-bold tracking-tight text-ink">
            Encuesta registrada
          </h1>
          <div className="mt-6 rounded-xl border border-line bg-surface p-6">
            <p className="text-ink-muted">Puntaje total</p>
            <p className="text-4xl font-bold text-ink">{resultado.puntajeTotal}</p>
            {nivel && (
              <div className="mt-3">
                <NivelBadge tono={nivel.id}>Nivel: {nivel.nombre}</NivelBadge>
              </div>
            )}
          </div>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-brand-ink transition-colors duration-150 hover:bg-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Volver al inicio
          </Link>
        </section>
      )}
    </main>
  );
}
