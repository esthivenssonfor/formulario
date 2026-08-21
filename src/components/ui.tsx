import { useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const buttonVariants: Record<Variant, string> = {
  primary: "bg-brand text-brand-ink hover:bg-brand-strong active:bg-brand-strong",
  secondary:
    "border-2 border-brand text-brand hover:bg-brand-soft active:bg-brand-soft",
  ghost: "text-ink-muted hover:bg-surface-2 hover:text-ink",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-40 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`rounded-lg border border-line-strong bg-surface px-4 py-3 text-base text-ink transition-colors duration-150 placeholder:text-ink-muted focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand ${className}`}
      {...props}
    />
  );
}

/** TextInput con boton de ojo para mostrar/ocultar el valor -- mismo
 * patron que ya usaba el login, ahora compartido (ej. confirmar
 * contraseña al eliminar encuestas). */
export function PasswordInput({
  className = "",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <div className="relative">
      <TextInput type={mostrar ? "text" : "password"} className={`pr-11 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setMostrar((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {mostrar ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`rounded-lg border border-line-strong bg-surface px-4 py-3 text-ink transition-colors duration-150 focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand ${className}`}
      {...props}
    />
  );
}

const priorityTokens: Record<string, { bg: string; fg: string }> = {
  baja: { bg: "bg-priority-baja-soft", fg: "text-priority-baja" },
  moderada: { bg: "bg-priority-media-soft", fg: "text-priority-media" },
  alta: { bg: "bg-priority-alta-soft", fg: "text-priority-alta" },
  muy_alta: { bg: "bg-priority-muyalta-soft", fg: "text-priority-muyalta" },
};

/** Badge de nivel/prioridad. Usa `tono` (baja/moderada/alta/muy_alta) para
 * elegir el color semantico; si no matchea, cae a un gris neutro. */
export function NivelBadge({ tono, children }: { tono: string; children: React.ReactNode }) {
  const t = priorityTokens[tono] ?? { bg: "bg-surface-2", fg: "text-ink-muted" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${t.bg} ${t.fg}`}
    >
      {children}
    </span>
  );
}

export function Alert({
  tono = "info",
  children,
}: {
  tono?: "info" | "ok" | "error";
  children: React.ReactNode;
}) {
  const tones = {
    info: "bg-accent-soft text-accent",
    ok: "bg-success-soft text-success",
    error: "bg-danger-soft text-danger",
  };
  return (
    <p role={tono === "error" ? "alert" : undefined} className={`rounded-lg px-4 py-3 text-base ${tones[tono]}`}>
      {children}
    </p>
  );
}
