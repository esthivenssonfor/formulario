import 'dart:convert';

import 'package:drift/drift.dart';

import 'database.dart';
import '../models/respuesta_local.dart';
import '../services/image_processor.dart';

/// Estado de sincronizacion "por componente" de una encuesta, para
/// mostrarlo en UI (ver pedido del usuario: Datos/Respuestas/Cedula
/// frontal/Cedula posterior/Foto participante, cada uno con su check).
class EstadoComponentes {
  final bool datos;
  final Map<String, bool> fotos; // clave = ImageProcessor.claveTipo(...)
  EstadoComponentes(this.datos, this.fotos);

  bool get completo => datos && fotos.values.every((v) => v);
}

/// API de alto nivel sobre la DB local -- la UI y el SyncManager hablan
/// con esto, nunca con las tablas de Drift directamente.
class Repository {
  final AppDatabase db;
  Repository(this.db);

  /// Guarda una encuesta recien completada como PENDING. El `id` ya viene
  /// generado por el llamador (uuid) -- es el mismo que se manda a
  /// Supabase, la clave de idempotencia de punta a punta.
  Future<void> crearEncuestaPendiente({
    required String id,
    required String encuestador,
    required String participante,
    int? edad,
    String? discapacidad,
    String? cedula,
    required DateTime fecha,
    required List<RespuestaLocal> respuestas,
    required double puntajeTotal,
    String? nivelId,
    required List<String> factoresCriticos,
  }) async {
    await db.into(db.encuestas).insertOnConflictUpdate(
          EncuestasCompanion.insert(
            id: id,
            encuestador: encuestador,
            participante: participante,
            edad: Value(edad),
            discapacidad: Value(discapacidad),
            cedula: Value(cedula),
            fecha: fecha.toIso8601String(),
            puntajeTotal: puntajeTotal,
            nivelId: Value(nivelId),
            factoresCriticosJson: Value(jsonEncode(factoresCriticos)),
            respuestasJson: jsonEncode(respuestas.map((r) => r.toJson()).toList()),
          ),
        );
  }

  /// Guarda (o reemplaza, si el usuario "volvio a tomar" antes de
  /// confirmar) la foto YA comprimida de un tipo para una encuesta.
  ///
  /// insertOnConflictUpdate resuelve conflictos por PRIMARY KEY (id
  /// autoincrement), no por la restriccion unica (encuestaId, tipo) --
  /// como cada insert nuevo trae un id distinto, nunca "pisaria" la fila
  /// anterior solo. Por eso el reemplazo se hace explicito: se borra la
  /// version anterior (si existia, todavia no confirmada) y se inserta la
  /// nueva, dentro de una transaccion para que no quede un estado a medias.
  Future<void> guardarFoto({
    required String encuestaId,
    required TipoFoto tipo,
    required Uint8List bytes,
    required String mimeType,
  }) async {
    final clave = ImageProcessor.claveTipo(tipo);
    await db.transaction(() async {
      await (db.delete(db.fotos)
            ..where((t) => t.encuestaId.equals(encuestaId) & t.tipo.equals(clave)))
          .go();
      await db.into(db.fotos).insert(
            FotosCompanion.insert(
              encuestaId: encuestaId,
              tipo: clave,
              bytes: Value(bytes),
              mimeType: mimeType,
            ),
          );
    });
  }

  /// Recuperacion ante cierre/crash a mitad de sincronizacion: si el
  /// proceso murio con una encuesta en SYNCING, esa fila queda "huerfana"
  /// -- pendientesParaSincronizar() solo mira PENDING/ERROR, nunca SYNCING,
  /// asi que sin esto la encuesta jamas se reintentaria. Se llama una vez
  /// al arrancar la app (ver main.dart), ANTES de que el SyncManager
  /// empiece a mirar la cola.
  Future<void> recuperarInterrumpidas() =>
      (db.update(db.encuestas)..where((t) => t.estadoSync.equalsValue(EstadoSync.syncing)))
          .write(const EncuestasCompanion(estadoSync: Value(EstadoSync.pending)));

  /// Encuestas listas para (re)intentar: PENDING o ERROR cuyo backoff ya
  /// paso. No incluye SYNCING (esas las esta procesando otro ciclo) ni
  /// SYNCED (ya no queda nada que hacer, y si esta SYNCED la fila se poda).
  Future<List<Encuesta>> pendientesParaSincronizar() {
    final ahora = DateTime.now();
    return (db.select(db.encuestas)
          ..where((t) =>
              (t.estadoSync.equalsValue(EstadoSync.pending) |
                  t.estadoSync.equalsValue(EstadoSync.error)) &
              (t.proximoIntentoEn.isNull() | t.proximoIntentoEn.isSmallerOrEqualValue(ahora))))
        .get();
  }

  Future<List<Foto>> fotosDe(String encuestaId) =>
      (db.select(db.fotos)..where((t) => t.encuestaId.equals(encuestaId))).get();

  Future<List<Foto>> fotosPendientesDe(String encuestaId) {
    final ahora = DateTime.now();
    return (db.select(db.fotos)
          ..where((t) =>
              t.encuestaId.equals(encuestaId) &
              t.subida.equals(false) &
              (t.proximoIntentoEn.isNull() | t.proximoIntentoEn.isSmallerOrEqualValue(ahora))))
        .get();
  }

  Future<void> marcarSincronizando(String id) =>
      (db.update(db.encuestas)..where((t) => t.id.equals(id)))
          .write(const EncuestasCompanion(estadoSync: Value(EstadoSync.syncing)));

  Future<void> marcarDatosSincronizados(String id) =>
      (db.update(db.encuestas)..where((t) => t.id.equals(id))).write(
        const EncuestasCompanion(
          datosSincronizados: Value(true),
          intentos: Value(0),
          syncError: Value(null),
          proximoIntentoEn: Value(null),
        ),
      );

  Future<void> marcarErrorEncuesta(String id, String error, DateTime proximoIntento, int intentos) =>
      (db.update(db.encuestas)..where((t) => t.id.equals(id))).write(
        EncuestasCompanion(
          estadoSync: const Value(EstadoSync.error),
          syncError: Value(error),
          proximoIntentoEn: Value(proximoIntento),
          intentos: Value(intentos),
        ),
      );

  /// Foto confirmada en Supabase: se limpian los bytes locales (no hace
  /// falta guardar la foto completa para siempre en el dispositivo, solo
  /// mientras estaba pendiente de subir) pero se deja la fila como
  /// registro de que ya se subio.
  Future<void> marcarFotoSubida(int fotoId, String storagePath) =>
      (db.update(db.fotos)..where((t) => t.id.equals(fotoId))).write(
        FotosCompanion(
          subida: const Value(true),
          storagePath: Value(storagePath),
          bytes: const Value(null),
          syncError: const Value(null),
          proximoIntentoEn: const Value(null),
        ),
      );

  Future<void> marcarErrorFoto(int fotoId, String error, DateTime proximoIntento, int intentos) =>
      (db.update(db.fotos)..where((t) => t.id.equals(fotoId))).write(
        FotosCompanion(
          syncError: Value(error),
          proximoIntentoEn: Value(proximoIntento),
          intentos: Value(intentos),
        ),
      );

  /// Una encuesta esta realmente SYNCED cuando sus datos Y todas sus fotos
  /// (las que efectivamente se tomaron) llegaron a Supabase -- nunca antes.
  Future<EstadoComponentes> estadoDe(String encuestaId) async {
    final encuesta =
        await (db.select(db.encuestas)..where((t) => t.id.equals(encuestaId))).getSingle();
    final fotos = await fotosDe(encuestaId);
    return EstadoComponentes(
      encuesta.datosSincronizados,
      {for (final f in fotos) f.tipo: f.subida},
    );
  }

  /// Si datos+todas las fotos ya estan confirmadas, se marca SYNCED y se
  /// elimina la fila local (ya no hace falta conservarla -- ver pedido del
  /// usuario de no acumular historial que ya no se necesita para
  /// operaciones pendientes). Devuelve true si quedo completa.
  Future<bool> intentarCerrarSincronizacion(String encuestaId) async {
    final estado = await estadoDe(encuestaId);
    if (!estado.completo) {
      // datos ok pero falta alguna foto: vuelve a PENDING (no ERROR) para
      // que el proximo ciclo solo reintente las fotos que falten.
      await (db.update(db.encuestas)..where((t) => t.id.equals(encuestaId)))
          .write(const EncuestasCompanion(estadoSync: Value(EstadoSync.pending)));
      return false;
    }
    await db.transaction(() async {
      await (db.delete(db.fotos)..where((t) => t.encuestaId.equals(encuestaId))).go();
      await (db.delete(db.encuestas)..where((t) => t.id.equals(encuestaId))).go();
    });
    return true;
  }

  /// Cache local de la Configuracion (preguntas/opciones/rangos/reglas)
  /// para poder llenar la encuesta sin conexion -- misma idea que
  /// CLAVE_CACHE_CONFIG en src/lib/storage.ts, pero en Drift en vez de
  /// localStorage.
  Future<void> guardarConfigCache(String json) => db.into(db.configCache).insertOnConflictUpdate(
        ConfigCacheCompanion.insert(json: json),
      );

  Future<String?> leerConfigCache() async {
    final fila = await (db.select(db.configCache)..where((t) => t.id.equals(1))).getSingleOrNull();
    return fila?.json;
  }

  /// Contadores para el indicador de sincronizacion en la UI.
  Future<({int pendientes, int fotosPendientes, int errores})> resumen() async {
    final encuestas = await db.select(db.encuestas).get();
    final fotos = await db.select(db.fotos).get();
    return (
      pendientes: encuestas.where((e) => e.estadoSync != EstadoSync.error).length,
      fotosPendientes: fotos.where((f) => !f.subida).length,
      errores: encuestas.where((e) => e.estadoSync == EstadoSync.error).length,
    );
  }
}
