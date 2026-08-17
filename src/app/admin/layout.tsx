"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";

function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, profile, cargando, esAdmin, signOut } = useAuth();

  const esLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!esLogin && session === null) router.replace("/admin/login");
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
        <button
          onClick={() => signOut().then(() => router.push("/admin/login"))}
          className="mt-6 font-medium text-brand underline underline-offset-2"
        >
          Cerrar sesion
        </button>
      </main>
    );
  }

  return (
    <>
      <Header
        href="/admin"
        acciones={
          <>
            {esAdmin && (
              <Link
                href="/admin/usuarios"
                className="text-sm font-medium text-ink-muted underline underline-offset-2 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Usuarios
              </Link>
            )}
            <button
              onClick={() => signOut().then(() => router.push("/admin/login"))}
              className="text-sm font-medium text-ink-muted underline underline-offset-2 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Cerrar sesion ({profile?.username ?? "..."})
            </button>
          </>
        }
      />
      {children}
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGate>{children}</AdminGate>
    </AuthProvider>
  );
}
