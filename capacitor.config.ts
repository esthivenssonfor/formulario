import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.fundimopla.encuesta',
  appName: 'FUNDIMOPLA',
  // La app va empaquetada dentro del .apk (export estatico de Next.js, ver
  // scripts/build-capacitor.mjs) -- no depende de internet para abrir. El
  // llenado de la encuesta y su envio siguen funcionando sin señal gracias
  // a la cola offline de src/lib/offline-queue.ts y a que la configuracion
  // de preguntas queda cacheada en localStorage (ver src/lib/storage.ts).
  webDir: 'out',
};

export default config;
