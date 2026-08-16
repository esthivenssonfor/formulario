"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const esLogin = pathname === "/admin/login";

  useEffect(() => {
    if (session === null && !esLogin) router.replace("/admin/login");
  }, [session, esLogin, router]);

  if (esLogin) return <>{children}</>;

  if (session === undefined) {
    return <p className="p-10 text-ink-muted">Verificando sesion...</p>;
  }

  if (session === null) {
    return null; // redirigiendo a /admin/login
  }

  return (
    <>
      <div className="flex justify-end border-b border-line bg-surface px-6 py-3">
        <button
          onClick={() => supabase.auth.signOut().then(() => router.push("/admin/login"))}
          className="text-sm font-medium text-ink-muted underline underline-offset-2 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Cerrar sesion ({session.user.email})
        </button>
      </div>
      {children}
    </>
  );
}
