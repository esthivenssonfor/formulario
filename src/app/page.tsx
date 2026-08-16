import Link from "next/link";

export default function Home() {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-900">
        Modo DEMO: las preguntas y puntajes son de ejemplo, no el metodo oficial.
      </div>

      <div>
        <h1 className="text-3xl font-bold text-blue-950">
          Sistema de Evaluacion de Vulnerabilidad
        </h1>
        <p className="mt-3 text-lg text-slate-700">
          Encuesta accesible que adapta sus preguntas segun el tipo de discapacidad
          de la persona y calcula automaticamente un nivel de vulnerabilidad.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/encuesta"
          className="flex-1 rounded-md bg-blue-900 px-6 py-4 text-center text-lg font-semibold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
        >
          Iniciar encuesta
        </Link>
        <Link
          href="/admin"
          className="flex-1 rounded-md border-2 border-blue-900 px-6 py-4 text-center text-lg font-semibold text-blue-900 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
        >
          Panel administrativo
        </Link>
      </div>
    </main>
  );
}
