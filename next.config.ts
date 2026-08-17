import type { NextConfig } from "next";

// CAPACITOR_BUILD=1 arma un export estatico (paginas + assets empaquetados
// dentro del .apk, sin depender de un servidor) para que la app Android
// funcione sin internet. El build normal (Vercel) sigue siendo dinamico
// -- ahi si existen las rutas /api/*. Ver scripts/build-capacitor.mjs.
const paraCapacitor = process.env.CAPACITOR_BUILD === "1";

const nextConfig: NextConfig = paraCapacitor
  ? {
      output: "export",
      images: { unoptimized: true },
    }
  : {
      async headers() {
        return [
          {
            // Forzar descarga como archivo (no "abrir inline") -- algunos
            // navegadores de Android truncan/corrompen el .apk si el servidor
            // manda Content-Disposition: inline en vez de attachment.
            source: "/descargas/:file*",
            headers: [
              { key: "Content-Disposition", value: "attachment" },
            ],
          },
        ];
      },
    };

export default nextConfig;
