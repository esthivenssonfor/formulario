"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Configuracion, Encuesta, RespuestaPregunta } from "@/lib/types";
import { obtenerConfiguracion } from "@/lib/storage";
import { guardarEncuestaConCola, iniciarSincronizacionAutomatica } from "@/lib/offline-queue";
import { useAuth } from "@/lib/auth-context";
import {
  calcularNivelYFactores,
  calcularPuntajeTotal,
  calcularPuntosRespuesta,
  preguntasVisibles,
} from "@/lib/scoring";
import { Alert, Button, NivelBadge, TextInput } from "@/components/ui";

// Un "unica" con muchas opciones se muestra como <select> (menu) en vez de
// radios largos -- mejor UX para listas como nacionalidad.
const UMBRAL_MENU_DESPLEGABLE = 5;

// Cuando la opcion elegida es literalmente "Otra", se pide especificar en
// texto libre (aplica a cualquier pregunta unica/multiple, no solo
// nacionalidad).
function esOtraSeleccionada(pregunta: { opciones: { id: string; texto: string }[] }, ids: string[]): boolean {
  return pregunta.opciones.some((o) => ids.includes(o.id) && o.texto.trim().toLowerCase() === "otra");
}

// El nombre y la edad del encuestado ya se piden dentro de la encuesta
// misma (seccion I). Se extraen de ahi para guardarlos en encuestas.participante/edad.
function valorDe(respuestas: RespuestaPregunta[], preguntaId: string): string {
  return respuestas.find((r) => r.preguntaId === preguntaId)?.valorTexto?.trim() || "";
}

type Paso = "datos" | "preguntas" | "resultado";

const PASOS: { id: Paso; etiqueta: string }[] = [
  { id: "datos", etiqueta: "Encuestador" },
  { id: "preguntas", etiqueta: "Preguntas" },
  { id: "resultado", etiqueta: "Resultado" },
];

function esPaso(v: string | null): v is Paso {
  return v === "datos" || v === "preguntas" || v === "resultado";
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
  const { profile } = useAuth();
  // El paso vive en la URL (?paso=...) para que el boton atras del
  // navegador/celular navegue entre los pasos de la encuesta en vez de
  // sacar al usuario de la pagina.
  const paso: Paso = esPaso(searchParams.get("paso")) ? (searchParams.get("paso") as Paso) : "datos";

  function irAPaso(siguiente: Paso) {
    router.push(`/encuesta?paso=${siguiente}`, { scroll: false });
  }

  const [config, setConfig] = useState<Configuracion | null>(null);
  const [seleccion, setSeleccion] = useState<Record<string, string[]>>({});
  // texto libre cuando la opcion elegida es "Otra" (cualquier pregunta de
  // seleccion unica/multiple, no solo nacionalidad).
  const [especificar, setEspecificar] = useState<Record<string, string>>({});
  const [valores, setValores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Encuesta | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sincronizada, setSincronizada] = useState(true);

  // El encuestador es quien inicio sesion -- no se pide ni se elige.
  const encuestador = profile?.nombre || profile?.username || "";

  // reintenta enviar encuestas guardadas offline en cuanto vuelve la señal.
  useEffect(() => iniciarSincronizacionAutomatica(), []);

  useEffect(() => {
    obtenerConfiguracion().then((c) => {
      setConfig(c);
      // "Dominicana" preseleccionada en nacionalidad -- se puede cambiar.
      const nacionalidad = c.preguntas.find((p) => p.id === "q_nacionalidad");
      const dominicana = nacionalidad?.opciones.find((o) => o.texto === "Dominicana");
      if (nacionalidad && dominicana) {
        setSeleccion((prev) =>
          prev[nacionalidad.id] ? prev : { ...prev, [nacionalidad.id]: [dominicana.id] }
        );
      }
    });
  }, []);

  // La discapacidad ya no se elige en un paso aparte: la seccion II de
  // preguntas (q_discapacidad_detalle) la cubre como texto libre. Se
  // muestran todas las preguntas (ninguna real usa el filtro por
  // discapacidad hoy).
  const preguntas = useMemo(() => (config ? preguntasVisibles(config.preguntas, "") : []), [config]);

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
            valorTexto: esOtraSeleccionada(p, seleccion[p.id]) ? especificar[p.id] ?? "" : undefined,
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
    const { nivelId, factoresCriticos } = calcularNivelYFactores(puntajeTotal, respuestas, config);
    const edadTexto = valorDe(respuestas, "q_edad");

    const encuesta: Encuesta = {
      id: crypto.randomUUID(),
      encuestador,
      participante: valorDe(respuestas, "q_nombre") || "(sin nombre)",
      edad: edadTexto ? Number(edadTexto) : null,
      discapacidad: null,
      fecha: new Date().toISOString(),
      respuestas,
      puntajeTotal,
      nivelId,
      prioridad: null, // se calcula al momento de listar/rankear en el admin
      factoresCriticos,
    };

    const { sincronizada: yaEnviada } = await guardarEncuestaConCola(encuesta);
    setSincronizada(yaEnviada);
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
            Vas a completar esta encuesta como
          </h1>
          <p className="mt-4 rounded-lg border border-line bg-surface px-4 py-3 text-lg font-semibold text-ink">
            {encuestador}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Si no sos vos quien va a hacer la encuesta, cerra sesion y entra con tu propio
            usuario.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/">
              <Button variant="secondary">Atras</Button>
            </Link>
            <Button onClick={() => irAPaso("preguntas")}>Continuar</Button>
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
              const comoMenu = p.tipo === "unica" && p.opciones.length >= UMBRAL_MENU_DESPLEGABLE;
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
                    {comoMenu && (
                      <select
                        value={seleccion[p.id]?.[0] ?? ""}
                        onChange={(e) => elegirOpcion(p.id, e.target.value, true)}
                        className="mt-3 w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-base text-ink focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
                      >
                        <option value="" disabled>
                          Selecciona una opcion
                        </option>
                        {p.opciones.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.texto}
                          </option>
                        ))}
                      </select>
                    )}
                    {!comoMenu && (p.tipo === "unica" || p.tipo === "multiple") && (
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
                    {(p.tipo === "unica" || p.tipo === "multiple") &&
                      esOtraSeleccionada(p, seleccion[p.id] ?? []) && (
                        <TextInput
                          value={especificar[p.id] ?? ""}
                          onChange={(e) =>
                            setEspecificar((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          placeholder="Especifica cual"
                          className="mt-2 w-full"
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
            <p className="mt-2 text-xs text-ink-muted">
              El nivel se calcula automaticamente a partir de las respuestas; no se puede editar.
            </p>
            {resultado.factoresCriticos.length > 0 && (
              <div className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                <p className="text-sm font-semibold text-danger">Factores criticos detectados</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-ink">
                  {resultado.factoresCriticos.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="mt-4">
            {sincronizada ? (
              <Alert tono="ok">Encuesta enviada correctamente.</Alert>
            ) : (
              <Alert tono="info">
                Sin conexion por ahora -- la encuesta quedo guardada en este dispositivo y se
                enviara sola apenas haya señal. No hace falta volver a llenarla.
              </Alert>
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
