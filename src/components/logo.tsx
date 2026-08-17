import Image from "next/image";
import { FUNDACION_LOGO_SRC, FUNDACION_NOMBRE } from "@/lib/config";

const tamanos = {
  sm: { caja: "h-8 w-8", texto: "text-xs" },
  md: { caja: "h-11 w-11", texto: "text-sm" },
  lg: { caja: "h-16 w-16", texto: "text-lg" },
} as const;

function iniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  return palabras.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "F";
}

/**
 * Espacio reservado para el logo de la fundacion. Sin FUNDACION_LOGO_SRC
 * configurado (src/lib/config.ts) muestra un placeholder con iniciales;
 * al agregar el archivo real en /public y setear la constante, este
 * componente lo usa en todas las pantallas sin duplicar nada.
 */
export function Logo({ size = "md" }: { size?: keyof typeof tamanos }) {
  const t = tamanos[size];
  if (FUNDACION_LOGO_SRC) {
    return (
      <Image
        src={FUNDACION_LOGO_SRC}
        alt={FUNDACION_NOMBRE}
        width={64}
        height={64}
        className={`${t.caja} rounded-lg object-contain`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={FUNDACION_NOMBRE}
      className={`flex ${t.caja} shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-line-strong bg-surface-2 font-bold text-ink-muted ${t.texto}`}
    >
      {iniciales(FUNDACION_NOMBRE)}
    </div>
  );
}
