"use client";

import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { FUNDACION_LEMA, FUNDACION_WORDMARK_SRC } from "@/lib/config";

const URL_WEB = "https://fundimopla.vercel.app";

export default function Home() {
  const { esAdmin } = useAuth();
  // Si esto ya se esta viendo DENTRO de la app instalada, no tiene sentido
  // ofrecer descargar la app (una app dentro de otra app) -- se muestra un
  // link a la version web en su lugar.
  const [esAppNativa] = useState(() => Capacitor.isNativePlatform());

  return (
    <main
      id="contenido"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-10 px-6 py-16"
    >
      {FUNDACION_WORDMARK_SRC && (
        <Image
          src={FUNDACION_WORDMARK_SRC}
          alt={FUNDACION_LEMA}
          width={1600}
          height={800}
          priority
          className="w-full max-w-md self-center rounded-xl border border-line"
        />
      )}

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
        {esAdmin && (
          <Link
            href="/admin"
            className="flex-1 rounded-lg border-2 border-brand px-6 py-4 text-center text-lg font-semibold text-brand transition-colors duration-150 hover:bg-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Panel administrativo
          </Link>
        )}
      </div>

      {esAppNativa ? (
        <div className="rounded-xl border border-line bg-surface p-6">
          <p className="font-semibold text-ink">¿Preferis usar el navegador?</p>
          <p className="mt-1 text-sm text-ink-muted">
            Tambien podes usar el sistema desde la web, sin instalar nada.
          </p>
          <button
            onClick={() => Browser.open({ url: URL_WEB })}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-brand px-5 py-3 font-semibold text-brand transition-colors duration-150 hover:bg-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Abrir en el navegador
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-6">
          <p className="font-semibold text-ink">Descargar aplicacion para el telefono</p>
          <p className="mt-1 text-sm text-ink-muted">
            Funciona igual que la web, pero guarda la encuesta en el celular cuando no
            hay señal y la envia sola apenas haya conexion.
          </p>
          <a
            href="/descargas/fundimopla.apk"
            download
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 font-semibold text-brand-ink transition-colors duration-150 hover:bg-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Descargar app (.apk)
          </a>
          <p className="mt-3 text-xs text-ink-muted">
            Esta aplicacion es exclusiva para celulares con sistema operativo Android.
            Al instalarla puede que el telefono pida permitir &quot;instalar apps de
            origen desconocido&quot; -- es normal para apps que no vienen de Google Play.
          </p>
        </div>
      )}
    </main>
  );
}
