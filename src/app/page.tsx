import Link from "next/link";

export default function Home() {
  return (
    <main
      id="contenido"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-10 px-6 py-16"
    >
      <div>
        <p className="text-sm font-semibold text-brand">Evaluacion de vulnerabilidad</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink text-balance">
          Sistema de Evaluacion de Vulnerabilidad
        </h1>
        <p className="mt-4 max-w-prose text-lg text-ink-muted text-pretty">
          Encuesta accesible que recopila la situacion de salud, economica, de
          vivienda y de apoyo de una persona con discapacidad, para ayudar a
          identificar y priorizar la ayuda que necesita.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/encuesta"
          className="flex-1 rounded-lg bg-brand px-6 py-4 text-center text-lg font-semibold text-brand-ink transition-colors duration-150 hover:bg-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Iniciar encuesta
        </Link>
        <Link
          href="/admin"
          className="flex-1 rounded-lg border-2 border-brand px-6 py-4 text-center text-lg font-semibold text-brand transition-colors duration-150 hover:bg-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Panel administrativo
        </Link>
      </div>
    </main>
  );
}
