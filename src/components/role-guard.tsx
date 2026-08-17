"use client";

import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui";

/**
 * Bloquea el contenido para quien no sea admin activo. Esto es solo UX
 * (evita que un usuario normal vea la pantalla) -- la proteccion real
 * vive en RLS (is_admin() en supabase/migrations/0002_roles_y_seguridad.sql)
 * y en los API routes de /api/admin/*, que verifican el rol server-side
 * antes de ejecutar cualquier operacion sensible.
 */
export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { cargando, esAdmin } = useAuth();

  if (cargando) {
    return <p className="p-10 text-ink-muted">Verificando permisos...</p>;
  }

  if (!esAdmin) {
    return (
      <main id="contenido" className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <Alert tono="error">
          No tienes permiso para acceder a esta seccion. Esta area es exclusiva del
          administrador.
        </Alert>
      </main>
    );
  }

  return <>{children}</>;
}
