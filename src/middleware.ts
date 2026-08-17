import { NextResponse, type NextRequest } from "next/server";

// La app Android va empaquetada (origen capacitor://localhost / https://
// localhost), asi que sus llamadas a /api/* son cross-origin. Sin estos
// headers el navegador/WebView bloquea la respuesta por CORS antes de que
// admin-users-client.ts la reciba. No hay cookies de por medio (la
// autenticacion va en el header Authorization), asi que permitir cualquier
// origen no expone sesiones de otros sitios.
function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
  }
  const response = NextResponse.next();
  for (const [clave, valor] of Object.entries(corsHeaders())) {
    response.headers.set(clave, valor);
  }
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
