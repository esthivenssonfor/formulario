"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Button } from "@/components/ui";

/** Exige sesion iniciada para TODA la app (solo /login queda afuera). */
function Gate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, profile, cargando, esAdmin, signOut } = useAuth();

  const esLogin = pathname === "/login";

  useEffect(() => {
    if (!esLogin && session === null) router.replace("/login");
  }, [esLogin, session, router]);

  if (esLogin) return <>{children}</>;

  if (session === undefined || cargando) {
    return <p className="p-10 text-ink-muted">Verificando sesion...</p>;
  }

  if (session === null) {
    return null; // redirigiendo via useEffect
  }

  if (profile && !profile.activo) {
    return (
      <main id="contenido" className="mx-auto w-full max-w-md flex-1 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-ink">Tu cuenta esta desactivada.</p>
        <p className="mt-2 text-ink-muted">Contacta al administrador del sistema.</p>
        <Button
          variant="secondary"
          onClick={() => signOut().then(() => router.push("/login"))}
          className="mt-6"
        >
          Cerrar sesion
        </Button>
      </main>
    );
  }

  return (
    <>
      <Header
        acciones={
          <>
            {esAdmin && (
              <Link href="/admin/usuarios">
                <Button variant="secondary" className="px-3 py-1.5 text-sm">
                  Usuarios
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              onClick={() => signOut().then(() => router.push("/login"))}
              className="border border-danger/40 px-3 py-1.5 text-sm text-danger hover:bg-danger-soft"
            >
              Cerrar sesion ({profile?.username ?? "..."})
            </Button>
          </>
        }
      />
      {children}
    </>
  );
}

export function AppGate({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Gate>{children}</Gate>
    </AuthProvider>
  );
}
