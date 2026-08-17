"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase-client";
import type { Profile } from "./types";

interface AuthState {
  session: Session | null | undefined; // undefined = todavia no se verifico
  user: User | null;
  profile: Profile | null;
  cargando: boolean;
  esAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function cargarPerfil(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, email, nombre, role, activo")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return data as Profile | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  // fetchedProfile/profileUserId en vez de un solo "profile": asi el efecto
  // de abajo nunca necesita un setState sincronico, solo dentro del .then
  // (cargarPerfil es async, se resuelve en un microtask aparte del render).
  const [fetchedProfile, setFetchedProfile] = useState<Profile | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    let cancelado = false;
    cargarPerfil(session.user.id).then((p) => {
      if (cancelado) return;
      setFetchedProfile(p);
      setProfileUserId(session.user.id);
    });
    return () => {
      cancelado = true;
    };
  }, [session]);

  const userId = session?.user?.id ?? null;
  const perfilListo = userId !== null && profileUserId === userId;
  const profile = perfilListo ? fetchedProfile : null;
  const cargando = session === undefined || (userId !== null && !perfilListo);

  async function signOut() {
    await supabase.auth.signOut();
    setFetchedProfile(null);
    setProfileUserId(null);
  }

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    profile,
    cargando,
    esAdmin: profile?.role === "admin" && profile.activo,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
