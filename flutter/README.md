# fundimopla_encuestas (Flutter)

Cliente Flutter (Web + Android + iOS) para el mismo backend Supabase que ya
usa la app Next.js (`../src`) -- misma base de datos, mismas políticas RLS.
Este subproyecto todavía NO reemplaza a la app Next.js; conviven mientras se
completa la migración (ver estado en la conversación de esta sesión).

## Correr

```bash
flutter pub get
flutter run -d chrome \
  --web-header="Cross-Origin-Opener-Policy=same-origin" \
  --web-header="Cross-Origin-Embedder-Policy=require-corp" \
  --dart-define=SUPABASE_ANON_KEY=<anon-key-de-.env.local>
```

La URL del proyecto ya tiene un default público en `lib/supabase_config.dart`
(no es secreta). La anon key SÍ hay que pasarla por `--dart-define` -- nunca
hardcodeada en el repo (mismo criterio que `NEXT_PUBLIC_SUPABASE_ANON_KEY` en
`.env.local`, protegida por RLS del lado del servidor, no por estar oculta).

Los `--web-header` de arriba son OBLIGATORIOS en Web (ver "Problema
encontrado: persistencia en Web" mas abajo) -- sin ellos, Drift no puede
abrir la base local y la app tira una excepcion al arrancar.

### Deploy en Vercel

`vercel.json` en esta carpeta ya configura esos mismos headers
(`Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`) para
cualquier deploy real -- sin esto, la persistencia offline en la version Web
no funciona de forma confiable en producción tampoco.

## Tras cambiar `lib/data/database.dart`

El esquema local (Drift) se genera con `build_runner`:

```bash
dart run build_runner build --delete-conflicting-outputs
```

## Tests

```bash
flutter test
```

Cubren la cola offline, idempotencia y estado por componente (ver
`test/repository_test.dart`) sin necesitar red ni dispositivo real.

## Arquitectura (núcleo offline-first)

```
lib/
  data/database.dart    Esquema local (Drift): Encuestas, Fotos, ConfigCache
  data/repository.dart  API sobre la DB local (nunca se toca Drift directo)
  services/              image_processor.dart (compresión), connectivity_service.dart
  sync/sync_manager.dart Motor de sincronización (backoff, idempotencia)
  models/                Espejo de src/lib/types.ts
```

Ver la explicación completa (cola, idempotencia, ciclo de vida de fotos) en
la conversación donde se construyó este núcleo.

## Problema encontrado: persistencia en Web

`driftDatabase()` exige un parametro `web:` al compilar a Web (si falta,
tira `ArgumentError` apenas arranca la app) -- ya corregido en
`lib/data/database.dart`, junto con los binarios oficiales
`web/sqlite3.wasm` y `web/drift_worker.js` (misma version que `drift`/
`sqlite3` en `pubspec.lock`).

Con eso solo, la app SEGUIA fallando (`DriftRemoteException`) al servirse
sin los headers `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`:
sin ellos el navegador no da acceso a `SharedArrayBuffer`, y el
almacenamiento local de Drift cae a un modo de respaldo (`sharedIndexedDb`)
que en esta version resulto inestable. Con los headers puestos
(`crossOriginIsolated: true`), Drift elige una implementacion mejor
(`opfsLocks`) y la app arranca sin errores -- confirmado sirviendo el build
de produccion con y sin esos headers.

## Pendiente

- Cámara con GUÍA VISUAL en vivo (overlay de encuadre) -- se implemento el
  selector nativo + guia estatica de texto (decision tomada en la
  conversacion), no una camara en vivo con marco superpuesto.
- Panel admin (usuarios, configuración de preguntas, monitor de
  almacenamiento) -- hoy solo existe en la app Next.js.
- Exportación a Excel desde Flutter (paquete `excel` ya agregado a
  `pubspec.yaml`, sin implementar todavía).
- Build/firma real de iOS (requiere Mac + Xcode, no disponible en este
  entorno; el scaffold y los permisos de `Info.plist` ya están).
- Pruebas en dispositivo Android/iOS físico real (cámara, permisos,
  matar la app, wifi<->datos) -- no hay ningún dispositivo/emulador
  disponible en este entorno (solo Windows desktop + navegadores).
