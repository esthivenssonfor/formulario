// Identidad de la institucion. Si cambia el nombre/logo mas adelante,
// se actualiza solo aca -- no hay que buscar el texto por el resto del
// proyecto (ver components/logo.tsx y components/header.tsx).
export const FUNDACION_NOMBRE = "FUNDIMOPLA";
export const FUNDACION_NOMBRE_COMPLETO =
  "Fundación de Personas con Discapacidad de Monte Plata (FUNDIMOPLA)";
export const FUNDACION_DESCRIPCION = "Sistema de Evaluación de Vulnerabilidad";
export const FUNDACION_LEMA = "Transformando vidas y familias con inclusión";

// Rutas bajo /public. FUNDACION_LOGO_SRC es el sello circular (usado en
// Header/Login, formato cuadrado). FUNDACION_WORDMARK_SRC es el logo
// horizontal con el nombre completo, pensado para banners mas anchos
// (ej. la portada). Poner en null muestra un placeholder con iniciales.
export const FUNDACION_LOGO_SRC: string | null = "/fundimopla-logo.jpeg";
export const FUNDACION_WORDMARK_SRC: string | null = "/fundimopla-wordmark.jpeg";

// Supabase Auth exige un email para cada cuenta, pero el panel se loguea
// con "usuario", no con correo. Cada cuenta usa un email interno sintetico
// bajo este dominio (nunca se muestra, nunca se usa para contactar a
// nadie) construido a partir del username -- asi no hace falta una tabla
// de lookup publica ni una funcion RPC anonima para resolver el correo
// real antes de autenticar.
export const DOMINIO_INTERNO_AUTH = "fundimopla.local";

// URL publica del deploy en Vercel. La app Android va empaquetada (sin
// depender de internet para abrir), pero las llamadas a /api/* (gestion de
// usuarios) necesitan un servidor real -- ahi se usa esta URL absoluta en
// vez de una ruta relativa. Tambien se usa para "Abrir en el navegador".
export const URL_WEB = "https://fundimopla.vercel.app";

const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9_.]{1,30}[a-z0-9])?$/;

export function normalizarUsername(valor: string): string {
  return valor.trim().toLowerCase();
}

export function usernameValido(valor: string): boolean {
  return USERNAME_REGEX.test(normalizarUsername(valor));
}

export function emailInternoDeUsuario(username: string): string {
  return `${normalizarUsername(username)}@${DOMINIO_INTERNO_AUTH}`;
}
