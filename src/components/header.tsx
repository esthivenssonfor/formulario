import Link from "next/link";
import { Logo } from "@/components/logo";
import { FUNDACION_NOMBRE } from "@/lib/config";

/** Encabezado institucional reutilizable: logo + nombre de la fundacion,
 * con un slot a la derecha para acciones especificas de cada pantalla
 * (menu de usuario, enlaces del panel, etc.). */
export function Header({
  href = "/",
  acciones,
}: {
  href?: string;
  acciones?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href={href} className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          <Logo size="sm" />
          <span className="text-sm font-semibold tracking-tight text-ink">
            {FUNDACION_NOMBRE}
          </span>
        </Link>
        {acciones && <div className="flex items-center gap-3">{acciones}</div>}
      </div>
    </header>
  );
}
