import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.fundimopla.encuesta',
  appName: 'FUNDIMOPLA',
  webDir: 'www',
  // La app Android carga el sitio real de Vercel (no una copia embebida).
  // El llenado de la encuesta sigue funcionando sin señal gracias a la
  // cola offline de src/lib/offline-queue.ts (localStorage del WebView).
  server: {
    url: 'https://formulario-esthivensson.vercel.app',
    androidScheme: 'https',
  },
};

export default config;
