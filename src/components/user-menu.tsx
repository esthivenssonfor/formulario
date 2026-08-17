"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Profile } from "@/lib/types";

function iniciales(texto: string): string {
  const palabras = texto.trim().split(/\s+/).filter(Boolean);
  return palabras.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

/** Perfil del usuario logueado, en una esquina del header: avatar con
 * iniciales + nombre, con un desplegable para Usuarios (admin) y cerrar
 * sesion -- evita amontonar botones sueltos en pantallas chicas. */
export function UserMenu({
  profile,
  esAdmin,
  onCerrarSesion,
}: {
  profile: Profile;
  esAdmin: boolean;
  onCerrarSesion: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function alClickearAfuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", alClickearAfuera);
    return () => document.removeEventListener("mousedown", alClickearAfuera);
  }, []);

  const nombreVisible = profile.nombre || profile.username;

  return (
    <div ref={contenedorRef} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors duration-150 hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-ink">
          {iniciales(nombreVisible)}
        </span>
        <span className="hidden max-w-24 truncate text-sm font-medium text-ink sm:inline">
          {nombreVisible}
        </span>
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="font-semibold text-ink">{nombreVisible}</p>
            <p className="text-xs text-ink-muted">
              @{profile.username} · {esAdmin ? "Administrador" : "Usuario"}
            </p>
          </div>
          {esAdmin && (
            <Link
              href="/admin/usuarios"
              role="menuitem"
              onClick={() => setAbierto(false)}
              className="block px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
            >
              Gestionar usuarios
            </Link>
          )}
          <button
            role="menuitem"
            onClick={() => {
              setAbierto(false);
              onCerrarSesion();
            }}
            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger-soft"
          >
            Cerrar sesion
          </button>
        </div>
      )}
    </div>
  );
}
