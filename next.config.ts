import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
