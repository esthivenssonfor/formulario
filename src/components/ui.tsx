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
